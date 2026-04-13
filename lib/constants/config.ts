export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

export const CONVEX_CONFIG = {
  deployment: process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT,
} as const;

export const APP_CONFIG = {
  defaultChatColor: "#4a31b0",
  storageKey: "chatColor",
  maxFileSizeBytes: 10 * 1024 * 1024,
  allowedFileTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
  messagePageSize: 10,
  typingDebounceMs: 1000,
  presenceUpdateIntervalMs: 60 * 1000,
} as const;

export const CONVEX_DEPLOYMENT = process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT;
