/**
 * Workout Session Store (Zustand)
 *
 * Manages the active workout session state. This lives in memory while
 * a workout is in progress and writes each set to SQLite immediately
 * on logging (so no data is lost on crash).
 *
 * Lifecycle:
 *   startSession() → logSet() × N → completeSession()
 *
 * Why Zustand: lightweight, no boilerplate, perfect for ephemeral session
 * state that needs to survive navigation but not app restarts (though we
 * persist to SQLite on each action as a safety net).
 */
import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure';
import { SetLog, WorkoutSession, PersonalRecord, TemplateExerciseWithDetails } from '@/types/global';
import { setLogRepo, workoutRepo, prRepo } from '@/core/repositories';

interface LogSetInput {
  exerciseId: string;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup?: boolean;
}

interface WorkoutSessionState {
  // ━━━ State ━━━
  isActive: boolean;
  sessionId: string | null;
  templateId: string | null;
  templateName: string;
  startedAt: number | null;
  completedSets: SetLog[];
  sessionPRs: PersonalRecord[];
  restTimerEnd: number | null;
  restTimerDuration: number | null;

  // ━━━ Actions ━━━
  startSession: (templateId: string, templateName: string) => void;
  logSet: (input: LogSetInput) => SetLog;
  undoLastSet: () => void;
  startRestTimer: (seconds: number) => void;
  clearRestTimer: () => void;
  completeSession: () => WorkoutSession & { prs: PersonalRecord[] };
  abandonSession: () => void;

  // ━━━ Derived ━━━
  getSetsForExercise: (exerciseId: string) => SetLog[];
  getTotalVolume: () => number;
  getElapsedMinutes: () => number;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set, get) => ({
  // ━━━ Initial State ━━━
  isActive: false,
  sessionId: null,
  templateId: null,
  templateName: '',
  startedAt: null,
  completedSets: [],
  sessionPRs: [],
  restTimerEnd: null,
  restTimerDuration: null,

  // ━━━ Actions ━━━

  startSession: (templateId: string, templateName: string) => {
    const sessionId = nanoid();
    const now = Date.now();

    // Create the session record in SQLite immediately
    workoutRepo.createSession({
      id: sessionId,
      templateId,
      templateName,
      startedAt: now,
      completedAt: null,
      totalVolume: 0,
      totalSets: 0,
      duration: null,
      notes: null,
      rating: null,
      createdAt: now,
    });

    set({
      isActive: true,
      sessionId,
      templateId,
      templateName,
      startedAt: now,
      completedSets: [],
      sessionPRs: [],
      restTimerEnd: null,
    });
  },

  logSet: (input: LogSetInput) => {
    const state = get();
    const exerciseSets = state.completedSets.filter(
      (s) => s.exerciseId === input.exerciseId
    );

    const setLog: SetLog = {
      id: nanoid(),
      sessionId: state.sessionId!,
      exerciseId: input.exerciseId,
      setNumber: exerciseSets.length + 1,
      weight: input.weight,
      reps: input.reps,
      rpe: input.rpe ?? null,
      isWarmup: input.isWarmup ?? false,
      isPR: false, // PR detection happens after insert
      completedAt: Date.now(),
    };

    // Persist immediately — crash-safe
    setLogRepo.insert(setLog);

    // Detect PRs
    const pr = prRepo.checkAndRecord(setLog);
    if (pr) {
      setLog.isPR = true;
      set({
        completedSets: [...state.completedSets, setLog],
        sessionPRs: [...state.sessionPRs, pr],
      });
    } else {
      set({ completedSets: [...state.completedSets, setLog] });
    }

    return setLog;
  },

  undoLastSet: () => {
    const state = get();
    const sets = [...state.completedSets];
    const removed = sets.pop();
    if (removed) {
      setLogRepo.delete(removed.id);
      set({ completedSets: sets });
    }
  },

  startRestTimer: (seconds: number) => {
    set({
      restTimerEnd: Date.now() + seconds * 1000,
      restTimerDuration: seconds,
    });
  },

  clearRestTimer: () => {
    set({ restTimerEnd: null, restTimerDuration: null });
  },

  completeSession: () => {
    const state = get();
    const now = Date.now();
    const workingSets = state.completedSets.filter((s) => !s.isWarmup);
    const totalVolume = workingSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    const duration = Math.round((now - state.startedAt!) / 60000);
    const prs = [...state.sessionPRs];

    const session: WorkoutSession = {
      id: state.sessionId!,
      templateId: state.templateId,
      templateName: state.templateName,
      startedAt: state.startedAt!,
      completedAt: now,
      totalVolume,
      totalSets: workingSets.length,
      duration,
      notes: null,
      rating: null,
      createdAt: state.startedAt!,
    };

    // Update the session record in SQLite
    workoutRepo.updateSession(session.id, {
      completedAt: now,
      totalVolume,
      totalSets: workingSets.length,
      duration,
    });

    // Reset store
    set({
      isActive: false,
      sessionId: null,
      templateId: null,
      templateName: '',
      startedAt: null,
      completedSets: [],
      sessionPRs: [],
      restTimerEnd: null,
    });

    return { ...session, prs };
  },

  abandonSession: () => {
    set({
      isActive: false,
      sessionId: null,
      templateId: null,
      templateName: '',
      startedAt: null,
      completedSets: [],
      sessionPRs: [],
      restTimerEnd: null,
    });
  },

  // ━━━ Derived ━━━

  getSetsForExercise: (exerciseId: string) => {
    return get().completedSets.filter((s) => s.exerciseId === exerciseId);
  },

  getTotalVolume: () => {
    return get()
      .completedSets.filter((s) => !s.isWarmup)
      .reduce((sum, s) => sum + s.weight * s.reps, 0);
  },

  getElapsedMinutes: () => {
    const { startedAt } = get();
    if (!startedAt) return 0;
    return Math.round((Date.now() - startedAt) / 60000);
  },
}));
