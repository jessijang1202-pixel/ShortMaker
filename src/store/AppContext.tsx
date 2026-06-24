import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import type {
  AppSession, WizardStep, PlanningInput, ContentIdea, HookOption,
  ScriptSplit, SlideScene, VeoCoreClip, UploadCopyPackage, UserApiSettings,
  SubtitleNarrationSettings,
} from '../types';
import { useAuth } from './AuthContext';
import { loadUserProfile, saveUserProfile } from '../services/db.service';

const initialSession: AppSession = {
  planning: null, ideas: [], selectedIdea: null,
  hooks: [], selectedHook: null, scriptSplit: null,
  subtitleNarration: null, uploadCopy: null, currentStep: 'planning',
};

const defaultSettings: UserApiSettings = { geminiApiKey: '', useMockMode: true };

export interface PreUploadedAssets {
  videoUrl?: string;
  photoUrls: string[];
}

interface AppContextType {
  session: AppSession;
  settings: UserApiSettings;
  isDark: boolean;
  currentProjectId: string | null;
  videoMode: 'simple' | 'advanced';
  setVideoMode: (mode: 'simple' | 'advanced') => void;
  preUploadedAssets: PreUploadedAssets;
  setPreUploadedAssets: (assets: PreUploadedAssets) => void;
  setSettings: (s: UserApiSettings) => void;
  toggleDark: () => void;
  setStep: (step: WizardStep) => void;
  updatePlanning: (planning: PlanningInput) => void;
  setIdeas: (ideas: ContentIdea[]) => void;
  selectIdea: (idea: ContentIdea) => void;
  setHooks: (hooks: HookOption[]) => void;
  selectHook: (hook: HookOption) => void;
  setScriptSplit: (split: ScriptSplit) => void;
  updateVeoClip: (clip: VeoCoreClip) => void;
  updateSlideScene: (scene: SlideScene) => void;
  setSubtitleNarration: (s: SubtitleNarrationSettings) => void;
  setUploadCopy: (copy: UploadCopyPackage) => void;
  setCurrentProjectId: (id: string | null) => void;
  loadProjectSession: (savedData: Partial<AppSession>, projectId: string) => void;
  resetSession: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function loadSettings(): UserApiSettings {
  try {
    const raw = sessionStorage.getItem('snapreel_settings');
    if (raw) return JSON.parse(raw) as UserApiSettings;
  } catch { /* ignore */ }
  return defaultSettings;
}

function persistSettings(s: UserApiSettings) {
  try { sessionStorage.setItem('snapreel_settings', JSON.stringify(s)); } catch { /* ignore */ }
}

function getInitialDark() {
  try {
    const stored = localStorage.getItem('snapreel_dark');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch { return false; }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userRef = useRef<User | null>(null);

  const [session, setSession]             = useState<AppSession>(initialSession);
  const [settings, setSettingsState]      = useState<UserApiSettings>(loadSettings);
  const [videoMode, setVideoMode]         = useState<'simple' | 'advanced'>('advanced');
  const [preUploadedAssets, setPreUploadedAssets] = useState<PreUploadedAssets>({ photoUrls: [] });
  const [isDark, setIsDark]           = useState<boolean>(() => {
    const d = getInitialDark();
    if (d) document.documentElement.classList.add('dark');
    return d;
  });
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => { userRef.current = user; }, [user]);

  // 로그인 상태 변경 시 API 키 로드/클리어
  useEffect(() => {
    if (!user) {
      const cleared = { geminiApiKey: '', useMockMode: true };
      setSettingsState(cleared);
      persistSettings(cleared);
      setCurrentProjectId(null);
      setSession(initialSession);
    } else {
      loadUserProfile(user.id).then(profile => {
        if (profile) {
          const loaded: UserApiSettings = {
            geminiApiKey: profile.gemini_api_key ?? '',
            elevenLabsApiKey: profile.elevenlabs_api_key ?? '',
            useMockMode: !profile.gemini_api_key,
          };
          setSettingsState(loaded);
          persistSettings(loaded);
        }
      }).catch(() => {});
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setSettings = useCallback((s: UserApiSettings) => {
    setSettingsState(s);
    persistSettings(s);
    if (userRef.current) {
      saveUserProfile(userRef.current.id, s.geminiApiKey, s.elevenLabsApiKey).catch(() => {});
    }
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try { localStorage.setItem('snapreel_dark', String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const setStep = useCallback((step: WizardStep) =>
    setSession(s => ({ ...s, currentStep: step })), []);

  const updatePlanning = useCallback((planning: PlanningInput) =>
    setSession(s => ({ ...s, planning })), []);

  const setIdeas = useCallback((ideas: ContentIdea[]) =>
    setSession(s => ({ ...s, ideas, selectedIdea: null })), []);

  const selectIdea = useCallback((selectedIdea: ContentIdea) =>
    setSession(s => ({ ...s, selectedIdea })), []);

  const setHooks = useCallback((hooks: HookOption[]) =>
    setSession(s => ({ ...s, hooks, selectedHook: null })), []);

  const selectHook = useCallback((selectedHook: HookOption) =>
    setSession(s => ({ ...s, selectedHook })), []);

  const setScriptSplit = useCallback((scriptSplit: ScriptSplit) =>
    setSession(s => ({ ...s, scriptSplit })), []);

  const updateVeoClip = useCallback((clip: VeoCoreClip) =>
    setSession(s => s.scriptSplit
      ? { ...s, scriptSplit: { ...s.scriptSplit, veo_core_clip: clip } }
      : s), []);

  const updateSlideScene = useCallback((scene: SlideScene) =>
    setSession(s => s.scriptSplit ? {
      ...s,
      scriptSplit: {
        ...s.scriptSplit,
        slide_scenes: s.scriptSplit.slide_scenes.map(sc =>
          sc.scene_id === scene.scene_id ? scene : sc),
      },
    } : s), []);

  const setSubtitleNarration = useCallback((subtitleNarration: SubtitleNarrationSettings) =>
    setSession(s => ({ ...s, subtitleNarration })), []);

  const setUploadCopy = useCallback((uploadCopy: UploadCopyPackage) =>
    setSession(s => ({ ...s, uploadCopy })), []);

  const loadProjectSession = useCallback((savedData: Partial<AppSession>, projectId: string) => {
    setSession({ ...initialSession, ...savedData });
    setCurrentProjectId(projectId);
  }, []);

  const resetSession = useCallback(() => {
    setSession(initialSession);
    setCurrentProjectId(null);
    setPreUploadedAssets({ photoUrls: [] });
  }, []);

  return (
    <AppContext.Provider value={{
      session, settings, isDark, currentProjectId,
      videoMode, setVideoMode,
      preUploadedAssets, setPreUploadedAssets,
      setSettings, toggleDark, setStep,
      updatePlanning, setIdeas, selectIdea,
      setHooks, selectHook, setScriptSplit,
      updateVeoClip, updateSlideScene,
      setSubtitleNarration, setUploadCopy, setCurrentProjectId,
      loadProjectSession, resetSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
