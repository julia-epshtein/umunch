// lib/api.ts

const BASE_URL = "http://172.31.86.174:8000";
// When testing on a physical device, change this to your computer's LAN IP, e.g. "http://192.168.1.10:8000"

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
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
