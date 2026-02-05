import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AssessmentState {
  // Assessment progress
  currentSectionIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  startedAt: string | null;
  completedAt: string | null;

  // User info
  ageRange: string | null;
  gender: string | null;
  inRelationship: boolean | null;

  // Crisis flag
  crisisDetected: boolean;

  // Report
  reportTier: 'free' | 'full' | 'couples' | null;
  reportGenerated: boolean;
  reportContent: Record<string, string> | null;
  scores: Record<string, unknown> | null;

  // Share
  shareCode: string | null;

  // Actions
  setAnswer: (questionId: string, value: number) => void;
  setCurrentSection: (index: number) => void;
  setCurrentQuestion: (index: number) => void;
  startAssessment: () => void;
  completeAssessment: () => void;
  setUserInfo: (info: { ageRange?: string; gender?: string; inRelationship?: boolean }) => void;
  setCrisisDetected: (detected: boolean) => void;
  setReportTier: (tier: 'free' | 'full' | 'couples') => void;
  setReportContent: (content: Record<string, string>) => void;
  setScores: (scores: Record<string, unknown>) => void;
  setShareCode: (code: string) => void;
  resetAssessment: () => void;
  getProgress: () => number;
  getTotalQuestions: () => number;
  getAnsweredCount: () => number;
}

const initialState = {
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  startedAt: null,
  completedAt: null,
  ageRange: null,
  gender: null,
  inRelationship: null,
  crisisDetected: false,
  reportTier: null as 'free' | 'full' | 'couples' | null,
  reportGenerated: false,
  reportContent: null,
  scores: null,
  shareCode: null,
};

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAnswer: (questionId: string, value: number) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),

      setCurrentSection: (index: number) =>
        set({ currentSectionIndex: index }),

      setCurrentQuestion: (index: number) =>
        set({ currentQuestionIndex: index }),

      startAssessment: () =>
        set({ startedAt: new Date().toISOString() }),

      completeAssessment: () =>
        set({ completedAt: new Date().toISOString() }),

      setUserInfo: (info) =>
        set((state) => ({
          ageRange: info.ageRange ?? state.ageRange,
          gender: info.gender ?? state.gender,
          inRelationship: info.inRelationship ?? state.inRelationship,
        })),

      setCrisisDetected: (detected: boolean) =>
        set({ crisisDetected: detected }),

      setReportTier: (tier) =>
        set({ reportTier: tier }),

      setReportContent: (content) =>
        set({ reportContent: content, reportGenerated: true }),

      setScores: (scores) =>
        set({ scores }),

      setShareCode: (code) =>
        set({ shareCode: code }),

      resetAssessment: () =>
        set(initialState),

      getProgress: () => {
        const state = get();
        const total = state.getTotalQuestions();
        if (total === 0) return 0;
        return Math.round((Object.keys(state.answers).length / total) * 100);
      },

      getTotalQuestions: () => {
        // BFI-2: 60, ECR-R: 36, PHQ-9: 9, GAD-7: 7, ASRS: 18, ACE: 10, PSS-10: 10, PC-PTSD-5: 5, AQ-10: 10, DERS-SF: 18, Values: 21
        return 204;
      },

      getAnsweredCount: () => {
        return Object.keys(get().answers).length;
      },
    }),
    {
      name: 'deep-personality-assessment',
      partialize: (state) => ({
        answers: state.answers,
        currentSectionIndex: state.currentSectionIndex,
        currentQuestionIndex: state.currentQuestionIndex,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
        ageRange: state.ageRange,
        gender: state.gender,
        inRelationship: state.inRelationship,
        crisisDetected: state.crisisDetected,
        reportTier: state.reportTier,
        reportGenerated: state.reportGenerated,
        reportContent: state.reportContent,
        scores: state.scores,
        shareCode: state.shareCode,
      }),
    }
  )
);
