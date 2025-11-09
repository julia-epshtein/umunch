// lib/api.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect if running on iOS simulator
// CRITICAL: iOS simulators MUST use localhost, network IPs won't work
// This function uses multiple detection methods and defaults to simulator for safety
const isIOSSimulator = (): boolean => {
  if (Platform.OS !== 'ios') return false;
  
  try {
    // CRITICAL: In development mode, ALWAYS use localhost for iOS
    // This is the most reliable method and should be checked FIRST
    // (except for explicit overrides)
    try {
      // @ts-ignore - __DEV__ is a global in React Native
      const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;
      console.log(`🔍 Development mode check: ${isDev}`);
      
      // Explicit override: if user explicitly says NOT to use localhost
      const forceNetworkIP = process.env.EXPO_PUBLIC_USE_LOCALHOST === 'false';
      
      if (isDev && !forceNetworkIP) {
        console.log('✅ Development mode detected - FORCING localhost for simulator');
        console.log('💡 In development, iOS simulators are the default. Using localhost:8000');
        console.log('💡 Note: EXPO_PUBLIC_API_HOST in .env is IGNORED for simulators');
        console.log('💡 To use a physical device, set EXPO_PUBLIC_USE_LOCALHOST=false in .env');
        return true; // Always use localhost in development (unless explicitly overridden)
      }
      
      if (forceNetworkIP) {
        console.log('⚠️ EXPO_PUBLIC_USE_LOCALHOST=false - forcing network IP (physical device mode)');
      }
    } catch (e) {
      // If we can't check, assume dev mode (safer)
      console.log('🔍 Could not check dev mode, assuming development (simulator/localhost)');
      return true;
    }
    
    // Method 1: Explicit override via environment variable
    if (process.env.EXPO_PUBLIC_USE_LOCALHOST === 'true') {
      console.log('✅ EXPO_PUBLIC_USE_LOCALHOST=true - forcing localhost for simulator');
      return true;
    }
    
    // Method 2: Check device name - iOS simulators always include "Simulator" in the name
    try {
      const deviceName = Constants.deviceName || '';
      console.log(`🔍 Checking device name: "${deviceName}"`);
      
      if (deviceName.toLowerCase().includes('simulator')) {
        console.log(`✅ Detected iOS Simulator via device name: ${deviceName}`);
        return true;
      }
      
      // If we have a device name and it doesn't contain "Simulator", 
      // AND we have an explicit network IP set, it's likely a physical device
      if (deviceName && 
          deviceName.trim().length > 0 && 
          !deviceName.toLowerCase().includes('simulator') &&
          process.env.EXPO_PUBLIC_API_HOST &&
          process.env.EXPO_PUBLIC_API_HOST !== 'localhost' &&
          process.env.EXPO_PUBLIC_API_HOST !== '127.0.0.1') {
        console.log(`📱 Detected iOS Physical Device: ${deviceName} (using network IP)`);
        return false;
      }
    } catch (e) {
      console.log(`⚠️ Could not read device name: ${e}`);
    }
    
    // Method 4: Check execution environment
    try {
      const executionEnvironment = Constants.executionEnvironment;
      console.log(`🔍 Execution environment: ${executionEnvironment}`);
      // In Expo Go or development builds, we're usually on a simulator
      if (executionEnvironment === 'storeClient' || executionEnvironment === 'bare') {
        // For bare workflow, we need to check device name more carefully
        // But if we got here, device name check didn't find "Simulator"
        // So if we have a network IP explicitly set, use it
        if (process.env.EXPO_PUBLIC_API_HOST &&
            process.env.EXPO_PUBLIC_API_HOST !== 'localhost' &&
            process.env.EXPO_PUBLIC_API_HOST !== '127.0.0.1') {
          console.log(`📱 Bare workflow with network IP set - assuming physical device`);
          return false;
        }
      }
    } catch (e) {
      console.log(`⚠️ Could not read execution environment: ${e}`);
    }
    
    // Default: assume simulator (safer for development)
    // Simulators are much more common in development, and localhost always works
    console.log('⚠️ Could not definitively determine device type, defaulting to simulator (localhost)');
    console.log('💡 To use a physical device, ensure:');
    console.log('   1. Device name does NOT contain "Simulator"');
    console.log('   2. EXPO_PUBLIC_API_HOST is set to your Mac\'s network IP');
    console.log('   3. Device and Mac are on the same WiFi network');
    return true;
  } catch (error) {
    // Fallback: if we can't determine, default to simulator for safety
    console.warn('⚠️ Error detecting iOS device type, defaulting to simulator (localhost):', error);
    return true;
  }
};

// Unified API configuration - use the same logic as meal.tsx
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }
  
  // For Android emulator, use 10.0.2.2 instead of localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  
  // For iOS: simulator uses localhost, physical device uses network IP
  if (Platform.OS === 'ios') {
    // Check simulator status FIRST before looking at environment variables
    // This ensures simulators always use localhost, even if EXPO_PUBLIC_API_HOST is set
    const isSimulator = isIOSSimulator();
    
    // Get environment variables for logging
    const envApiHost = process.env.EXPO_PUBLIC_API_HOST;
    const envApiPort = process.env.EXPO_PUBLIC_API_PORT || '8000';
    
    console.log(`🔍 iOS Device Detection:`);
    console.log(`   Is Simulator: ${isSimulator}`);
    console.log(`   EXPO_PUBLIC_API_HOST: ${envApiHost || '(not set)'}`);
    console.log(`   EXPO_PUBLIC_API_PORT: ${envApiPort}`);
    
    if (isSimulator) {
      // SIMULATOR: Try network IP first if EXPO_PUBLIC_API_HOST is set
      // iOS Simulator sometimes has issues with localhost, so network IP can work better
      if (envApiHost && envApiHost !== 'localhost' && envApiHost !== '127.0.0.1') {
        const url = `http://${envApiHost}:${envApiPort}`;
        console.log(`✅ iOS Simulator detected - using network IP from EXPO_PUBLIC_API_HOST: ${url}`);
        console.log('💡 Note: Using network IP for simulator. Make sure server is accessible on this IP.');
        return url;
      }
      
      // Fallback to localhost if no network IP is configured
      const url = 'http://localhost:8000';
      console.log(`✅ iOS Simulator detected - using: ${url}`);
      console.log('💡 Note: If localhost doesn\'t work, set EXPO_PUBLIC_API_HOST to your Mac\'s network IP in .env');
      console.log('💡 Find your IP: ifconfig | grep "inet " | grep -v 127.0.0.1');
      return url;
    }
    
    // PHYSICAL DEVICE: Use network IP from environment
    if (!envApiHost || envApiHost === 'localhost' || envApiHost === '127.0.0.1') {
      const errorMsg = 'iOS Physical Device detected but EXPO_PUBLIC_API_HOST is not set to a network IP.';
      console.error(`❌ ${errorMsg}`);
      console.error('💡 Physical devices cannot use localhost.');
      console.error('💡 Set EXPO_PUBLIC_API_HOST to your Mac\'s local IP address in your .env file.');
      console.error('💡 Find your IP: ifconfig | grep "inet " | grep -v 127.0.0.1');
      console.error('💡 Example: EXPO_PUBLIC_API_HOST=192.168.1.100');
      throw new Error(`${errorMsg} Set EXPO_PUBLIC_API_HOST to your Mac's network IP (e.g., 192.168.1.100)`);
    }
    
    const url = `http://${envApiHost}:${envApiPort}`;
    console.log(`✅ iOS Physical Device - using network IP: ${url}`);
    console.log('💡 Make sure your Mac and iPhone are on the same WiFi network');
    return url;
  }
  
  // Fallback
  return 'http://localhost:8000';
};

const BASE_URL = getApiBaseUrl();

// Export BASE_URL for debugging and other components
export { BASE_URL };

// Log the base URL being used (helpful for debugging)
console.log(`🔧 API Base URL configured: ${BASE_URL}`);
console.log(`🔧 Platform: ${Platform.OS}`);
if (Platform.OS === 'ios') {
  try {
    const deviceName = Constants.deviceName || 'unknown';
    console.log(`🔧 Device: ${deviceName}`);
  } catch (e) {
    console.log(`🔧 Device: unknown (${e})`);
  }
}

const API_TIMEOUT = 30000; // 30 second timeout

// Test server connection (useful for debugging)
export const testServerConnection = async (): Promise<boolean> => {
  try {
    console.log(`🔍 Testing server connection to: ${BASE_URL}/health`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second test timeout
    
    const res = await fetch(`${BASE_URL}/health`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const data = await res.json();
    console.log(`✅ Server is reachable! Response:`, data);
    return true;
  } catch (error) {
    console.error(`❌ Server connection test failed:`, error);
    return false;
  }
};

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  const url = `${BASE_URL}${path}`;
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorDetail = '';
      try {
        const errorData = await res.json();
        errorDetail = JSON.stringify(errorData);
      } catch {
        const text = await res.text();
        errorDetail = text || `HTTP ${res.status}`;
      }
      
      console.error(`❌ API Error ${res.status}: ${errorDetail}`);
      
      // Provide helpful error messages based on status code
      if (res.status === 500) {
        throw new Error(`Server error (500): The backend encountered an error. This is likely a database connection issue. Check server logs. Details: ${errorDetail}`);
      } else if (res.status === 404) {
        throw new Error(`Not found (404): The requested resource was not found. URL: ${url}`);
      } else if (res.status === 503) {
        throw new Error(`Service unavailable (503): The server is temporarily unavailable. It may be starting up or overloaded.`);
      }
      
      throw new Error(`API error ${res.status}: ${errorDetail}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Log the full error for debugging
    console.error(`❌ API Request failed for: ${url}`);
    if (error instanceof Error) {
      console.error(`   Error type: ${error.constructor.name}`);
      console.error(`   Error name: ${error.name}`);
      console.error(`   Error message: ${error.message}`);
      console.error(`   Error stack: ${error.stack?.substring(0, 200)}...`);
    } else {
      console.error(`   Unknown error:`, error);
    }
    
    // Handle timeout errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      const errorName = error.name.toLowerCase();
      const errorType = error.constructor.name.toLowerCase();
      
      // Check for various timeout/network error patterns
      if (errorName === 'aborterror' || 
          errorType === 'aborterror' ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('timed out') ||
          errorMessage.includes('network request timed out')) {
        console.error(`⏱️ Request timeout after ${API_TIMEOUT/1000}s: ${url}`);
        console.error(`🔍 Troubleshooting:`);
        console.error(`   1. Is the backend server running? Check: http://${BASE_URL.replace('http://', '')}/health`);
        console.error(`   2. Try: curl http://${BASE_URL.replace('http://', '')}/health`);
        console.error(`   3. For iOS Simulator: Server must be on localhost:8000`);
        console.error(`   4. Server might be slow - check backend logs for errors`);
        console.error(`   5. Database queries might be timing out`);
        throw new Error(`Request timeout after ${API_TIMEOUT/1000}s. Server may not be running or responding. URL: ${BASE_URL}`);
      }
      
      // Handle network connection errors (most common for iOS simulator)
      const isNetworkError = 
        (errorName === 'typeerror' && errorMessage.includes('network request failed')) ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('networkerror') ||
        errorMessage.includes('err_network_changed') ||
        errorMessage.includes('could not connect') ||
        errorMessage.includes('connection refused') ||
        (errorName === 'typeerror' && errorMessage.includes('load failed')) ||
        errorMessage.includes('networkerror') ||
        (errorName === 'typeerror' && errorMessage.includes('cors'));
      
      if (isNetworkError) {
        console.error(`🔌 Network connection error: Cannot reach ${BASE_URL}`);
        console.error(`🔍 Detailed Diagnostics:`);
        console.error(`   URL attempted: ${url}`);
        console.error(`   Base URL: ${BASE_URL}`);
        console.error(`   Platform: ${Platform.OS}`);
        if (Platform.OS === 'ios') {
          try {
            const deviceName = Constants.deviceName || 'unknown';
            console.error(`   Device: ${deviceName}`);
            console.error(`   Is likely simulator: ${deviceName.toLowerCase().includes('simulator')}`);
          } catch (e) {
            console.error(`   Device info unavailable: ${e}`);
          }
        }
        console.error(`🔍 Troubleshooting Steps:`);
        console.error(`   1. Verify server is running: curl http://localhost:8000/health`);
        console.error(`   2. Check server logs for startup errors`);
        console.error(`   3. For iOS Simulator: Restart the simulator`);
        console.error(`   4. Try restarting Expo: npx expo start --clear`);
        console.error(`   5. Check if port 8000 is available: lsof -i :8000`);
        console.error(`   6. Verify server is listening on 0.0.0.0:8000 (not just 127.0.0.1)`);
        
        // Provide specific help based on the URL
        if (BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')) {
          console.error(`💡 iOS Simulator Troubleshooting:`);
          console.error(`   1. Verify server is running: curl http://127.0.0.1:8000/health`);
          console.error(`   2. Test database connection: curl http://127.0.0.1:8000/health/db`);
          console.error(`   3. Check server logs for errors (especially database connection issues)`);
          console.error(`   4. If curl works but app doesn't:`);
          console.error(`      - Restart the iOS Simulator`);
          console.error(`      - Restart Expo: npx expo start --clear`);
          console.error(`      - Check iOS Simulator network settings`);
          console.error(`   5. Server should be running with: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`);
        }
        
        // The actual error might be a database issue causing the server to hang
        // Provide a more helpful error message
        throw new Error(`Network error: Cannot reach server at ${BASE_URL}. The server may be running but not responding to requests. This could be due to:\n1. Database connection timeout\n2. Server hanging on a slow query\n3. iOS Simulator network issue\n\nCheck server logs for database errors. Try: curl http://127.0.0.1:8000/health`);
      }
    }
    
    // Generic error handling - re-throw with context
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`API request failed: ${errorMsg}. URL: ${url}`);
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
