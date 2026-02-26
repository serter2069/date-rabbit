import { create } from 'zustand';
import type { Verification, VerificationReference, VerificationStatus } from '../types';
import { verificationApi, ApiError } from '../services/api';

interface VerificationState {
  verification: Verification | null;
  status: VerificationStatus;
  currentStep: number;
  totalSteps: number; // 5 for seeker, 7 for companion
  isLoading: boolean;
  error: string | null;

  // Actions
  startVerification: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  submitSSN: (ssn: string) => Promise<boolean>;
  uploadId: (uri: string) => Promise<boolean>;
  uploadSelfie: (uri: string) => Promise<boolean>;
  uploadVideo: (uri: string) => Promise<boolean>;
  submitReferences: (refs: VerificationReference[]) => Promise<boolean>;
  submitConsent: () => Promise<boolean>;
  submitForReview: () => Promise<boolean>;
  reset: () => void;
}

const DEFAULT_STATE = {
  verification: null as Verification | null,
  status: 'not_started' as VerificationStatus,
  currentStep: 0,
  totalSteps: 5,
  isLoading: false,
  error: null as string | null,
};

function stepsForType(type: 'seeker' | 'companion'): number {
  return type === 'companion' ? 7 : 5;
}

export const useVerificationStore = create<VerificationState>()((set, get) => ({
  ...DEFAULT_STATE,

  startVerification: async () => {
    set({ isLoading: true, error: null });
    try {
      const verification = await verificationApi.start();
      set({
        verification,
        status: verification.status,
        currentStep: 1,
        totalSteps: stepsForType(verification.type),
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to start verification';
      set({ error: message, isLoading: false });
    }
  },

  fetchStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const verification = await verificationApi.getStatus();
      set({
        verification,
        status: verification.status,
        totalSteps: stepsForType(verification.type),
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch verification status';
      set({ error: message, isLoading: false });
    }
  },

  submitSSN: async (ssn: string) => {
    set({ isLoading: true, error: null });
    try {
      const verification = await verificationApi.submitSSN(ssn);
      set({
        verification,
        status: verification.status,
        currentStep: get().currentStep + 1,
        isLoading: false,
      });
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to submit SSN';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  uploadId: async (uri: string) => {
    set({ isLoading: true, error: null });
    try {
      const verification = await verificationApi.uploadId(uri);
      set({
        verification,
        status: verification.status,
        currentStep: get().currentStep + 1,
        isLoading: false,
      });
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to upload ID photo';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  uploadSelfie: async (uri: string) => {
    set({ isLoading: true, error: null });
    try {
      const verification = await verificationApi.uploadSelfie(uri);
      set({
        verification,
        status: verification.status,
        currentStep: get().currentStep + 1,
        isLoading: false,
      });
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to upload selfie';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  uploadVideo: async (uri: string) => {
    set({ isLoading: true, error: null });
    try {
      const verification = await verificationApi.uploadVideo(uri);
      set({
        verification,
        status: verification.status,
        currentStep: get().currentStep + 1,
        isLoading: false,
      });
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to upload video';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  submitReferences: async (refs: VerificationReference[]) => {
    set({ isLoading: true, error: null });
    try {
      const verification = await verificationApi.submitReferences(refs);
      set({
        verification,
        status: verification.status,
        currentStep: get().currentStep + 1,
        isLoading: false,
      });
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to submit references';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  submitConsent: async () => {
    set({ isLoading: true, error: null });
    try {
      const verification = await verificationApi.submitConsent(true);
      set({
        verification,
        status: verification.status,
        currentStep: get().currentStep + 1,
        isLoading: false,
      });
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to submit consent';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  submitForReview: async () => {
    set({ isLoading: true, error: null });
    try {
      const verification = await verificationApi.submit();
      set({
        verification,
        status: verification.status,
        isLoading: false,
      });
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to submit for review';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  reset: () => set({ ...DEFAULT_STATE }),
}));
