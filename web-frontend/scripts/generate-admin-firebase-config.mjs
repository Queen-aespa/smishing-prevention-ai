import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const requiredKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missing = requiredKeys.filter((key) => !process.env[key]);

const outputDir = resolve(process.cwd(), "public/admin");
const outputPath = resolve(outputDir, "firebase-config.js");
mkdirSync(outputDir, { recursive: true });

if (missing.length > 0) {
  writeFileSync(
    outputPath,
    `window.__ADMIN_FIREBASE_CONFIG__ = null;\nwindow.__ADMIN_FIREBASE_CONFIG_ERROR__ = "Missing env: ${missing.join(", ")}";\n`,
    "utf8",
  );
  console.warn(`[admin-config] Missing firebase env vars: ${missing.join(", ")}`);
  process.exit(0);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

writeFileSync(
  outputPath,
  `window.__ADMIN_FIREBASE_CONFIG__ = ${JSON.stringify(firebaseConfig, null, 2)};\n`,
  "utf8",
);
console.log(`[admin-config] Generated ${outputPath}`);
