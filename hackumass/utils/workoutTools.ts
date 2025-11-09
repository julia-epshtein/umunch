/**
 * Client tools for ElevenLabs Agent to process workout information
 */

import { setWorkoutData } from './workoutStore';

/**
 * Save workout data from agent as JSON string
 * This function is called by the ElevenLabs agent after collecting workout information
 * 
 * @param workoutJson - JSON string with workout data: { "difficulty": "medium", "duration": 30, "activity": "running" }
 * @returns Success or error message
 */
export const saveWorkoutData = async (workoutJson: string): Promise<string> => {
  try {
    // Validate JSON format
    const parsed = JSON.parse(workoutJson);
    
    // Validate required fields
    if (!parsed.activity || !parsed.duration || !parsed.difficulty) {
      return 'Error: Missing required fields. JSON must include activity, duration, and difficulty.';
    }
    
    // Validate types
    if (typeof parsed.activity !== 'string') {
      return 'Error: activity must be a string.';
    }
    if (typeof parsed.duration !== 'number' || parsed.duration <= 0) {
      return 'Error: duration must be a positive number.';
    }
    if (typeof parsed.difficulty !== 'string') {
      return 'Error: difficulty must be a string.';
    }
    
    // Store JSON string in global store
    setWorkoutData(workoutJson);
    
    return 'Workout data saved successfully';
  } catch (error: any) {
    console.error('Error saving workout data:', error);
    return `Error: Invalid JSON format. ${error.message}`;
  }
};

