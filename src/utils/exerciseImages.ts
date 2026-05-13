/**
 * Exercise GIF Mapping
 *
 * Maps exercise names to animated GIF URLs from ExerciseGymGifsDB.
 * White background, animated figures demonstrating exercise form.
 *
 * Source: https://github.com/JahelCuadrado/ExerciseGymGifsDB
 * CDN: jsDelivr (free, global CDN)
 */

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0';

// Map our exercise names to ExerciseGymGifsDB muscle/slug paths
const exerciseGifMap: Record<string, string> = {
  'Romanian Deadlift': `${CDN_BASE}/hamstrings/barbell-straight-leg-deadlift.gif`,
  'Pull-Up': `${CDN_BASE}/lats/pull-up.gif`,
  'Bulgarian Split Squat': `${CDN_BASE}/quads/dumbbell-single-leg-split-squat.gif`,
  'Chest Supported Row': `${CDN_BASE}/upper-back/lever-t-bar-row.gif`,
  'Kettlebell Swing': `${CDN_BASE}/hamstrings/kettlebell-hang-clean.gif`,
  'Farmer Carry': `${CDN_BASE}/quads/farmers-walk.gif`,
  'Battle Rope': `${CDN_BASE}/cardio/swing-360.gif`,
  'Side Plank': `${CDN_BASE}/abs/side-bridge-v-2.gif`,
  'Bird Dog': `${CDN_BASE}/spine/exercise-ball-back-extension-with-arms-extended.gif`,
  'Neck Flexion/Extension': `${CDN_BASE}/levator-scapulae/neck-side-stretch.gif`,
  'Front Squat': `${CDN_BASE}/quads/barbell-bench-front-squat.gif`,
  'Dumbbell Bench Press': `${CDN_BASE}/pectorals/dumbbell-bench-press.gif`,
  'Copenhagen Plank': `${CDN_BASE}/adductors/side-plank-hip-adduction.gif`,
  'Sled Push': `${CDN_BASE}/quads/forward-jump.gif`,
  'Medicine Ball Slam': `${CDN_BASE}/lats/medicine-ball-catch-and-overhead-throw.gif`,
  'Pushups': `${CDN_BASE}/pectorals/push-up.gif`,
  'Pallof Press': `${CDN_BASE}/abs/cable-twist.gif`,
};

/**
 * Get the animated GIF URL for an exercise.
 * Returns null if the exercise is not mapped.
 */
export function getExerciseGifUrl(exerciseName: string): string | null {
  return exerciseGifMap[exerciseName] ?? null;
}

/** @deprecated Use getExerciseGifUrl instead */
export function getExerciseImage(exerciseName: string): string | null {
  return getExerciseGifUrl(exerciseName);
}

/** @deprecated Use getExerciseGifUrl instead */
export function getExerciseImages(exerciseName: string): { image1: string; image2: string } | null {
  const gif = exerciseGifMap[exerciseName];
  if (!gif) return null;
  return { image1: gif, image2: gif };
}
