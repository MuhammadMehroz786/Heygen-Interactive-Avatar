"use client";

import { atom } from 'jotai';

// Avatar connection state
export const isConnectedAtom = atom(false);
export const isLoadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);

// Avatar settings
export const selectedAvatarAtom = atom("Anthony_ProfessionalLook_public");
export const apiKeyAtom = atom("");
export const voiceAtom = atom("default");
export const voiceRateAtom = atom(1.0);
export const voiceEmotionAtom = atom("FRIENDLY");

// UI state
export const isFullscreenAtom = atom(false);
export const isMutedAtom = atom(false);
export const isVideoEnabledAtom = atom(true);
export const isListeningAtom = atom(false);
export const messageAtom = atom("");

// Background effects
export const backgroundTypeAtom = atom<string>("none");
export const selectedPresetAtom = atom<string>("");
export const isProcessingAtom = atom(false);
export const processingFpsAtom = atom(20);

// Recording state
export const isRecordingAtom = atom(false);
export const recordedBlobAtom = atom<Blob | null>(null);

// Transcript
export interface TranscriptEntry {
  type: 'user' | 'avatar';
  text: string;
  timestamp: Date;
}

export const transcriptAtom = atom<TranscriptEntry[]>([]);