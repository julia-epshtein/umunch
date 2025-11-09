// lib/api.ts
import { Platform } from 'react-native';

// Unified API configuration - use the same logic as meal.tsx
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }
  
  // For Android emulator, use 10.0.2.2 instead of localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  
  // For iOS simulator or physical device, use your computer's local IP from environment
  const apiHost = process.env.EXPO_PUBLIC_API_HOST;
  const apiPort = process.env.EXPO_PUBLIC_API_PORT || '8000';
  return `http://${apiHost}:${apiPort}`;
};

const BASE_URL = getApiBaseUrl();

const API_TIMEOUT = 30000; // 30 second timeout

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - server may be loading datasets');
    }
    throw error;
  }
}

export const UmunchApi = {
  // we'll add more methods later; start with two:
  getTodayDashboard: (externalUserKey: string) =>
    api<{ snapshot: any }>(
      `/dashboard/today?external_user_key=${encodeURIComponent(externalUserKey)}`
    ),

  saveDiet: (payload: {
    external_user_key: string;
    dietary_restrictions: string[];
    allergies: string[];
  }) =>
    api<{ status: string }>("/onboarding/diet", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
