/**
 * Global workout data store for JSON storage
 * Used to share workout data between ElevenLabs agent and React components
 */

let workoutDataJson: string | null = null;

/**
 * Store JSON string from agent
 */
export function setWorkoutData(jsonString: string): void {
  workoutDataJson = jsonString;
}

/**
 * Retrieve stored JSON string
 */
export function getWorkoutData(): string | null {
  return workoutDataJson;
}

/**
 * Clear stored data
 */
export function clearWorkoutData(): void {
  workoutDataJson = null;
}

