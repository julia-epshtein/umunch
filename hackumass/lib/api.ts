// lib/api.ts
import { Platform } from 'react-native';

// Unified API configuration
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }
  
  // For Android emulator, use 10.0.2.2 instead of localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  
  // For iOS simulator or physical device, use the IP from environment variable
  // or fallback to localhost for development
  const host = process.env.EXPO_PUBLIC_API_HOST || 'localhost';
  return `http://${host}:8000`;
};

export const BASE_URL = getApiBaseUrl();

const API_TIMEOUT = 60000; // 60 second timeout

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    console.log(`🚀 API Request: ${BASE_URL}${path}`); // Debug logging
    const startTime = Date.now();
    
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
    });

    const endTime = Date.now();
    console.log(`⏱️ Request took ${endTime - startTime}ms`); // Debug logging

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ API Error: ${res.status}`, text); // Debug logging
      throw new Error(`API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log(`✅ API Response:`, data); // Debug logging
    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`🔥 API Error:`, error); // Debug logging
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${API_TIMEOUT}ms - server may be loading datasets. Please try again.`);
    }
    
    // More specific error messages
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
    
    if (error.message.includes('Network request failed')) {
      throw new Error(`Cannot connect to server at ${BASE_URL}. Please make sure the backend server is running.`);
    }
    
    throw error;
  }
}

export const UmunchApi = {
  getTodayDashboard: (externalUserKey: string) =>
    api<{ snapshot: any }>(
      `/dashboard/today?external_user_key=${encodeURIComponent(externalUserKey)}`
    ),

  saveDiet: (payload: {
    external_user_key: string;
    dietary_restrictions: string[];
    allergies: string[];
  }) =>
    api<{ status: string }>('/onboarding/diet', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAiRecommendation: (payload: {
    meal_type: string;
    dining_hall: string;
    user_id: number;
  }) =>
    api<{
      meal_type: string;
      dining_hall: string;
      recommendations: {
        itemName: string;
        estimatedCalories: number;
        reason: string;
      }[];
    }>('/coach/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
