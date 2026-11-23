"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
};

export function firebaseWebConfig(): FirebaseWebConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "bartender-3a68e";
  const authDomain =
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ||
    `${projectId}.firebaseapp.com`;
  if (!apiKey) return null;
  return { apiKey, authDomain, projectId };
}

export function firebaseAuthEnabled(): boolean {
  return firebaseWebConfig() !== null;
}

let authSingleton: Auth | null = null;

export function getClientAuth(): Auth | null {
  const cfg = firebaseWebConfig();
  if (!cfg) return null;
  if (authSingleton) return authSingleton;
  const app: FirebaseApp =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: cfg.apiKey,
          authDomain: cfg.authDomain,
          projectId: cfg.projectId,
        });
  authSingleton = getAuth(app);
  return authSingleton;
}