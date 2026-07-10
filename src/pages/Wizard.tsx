import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, CheckCircle, AlertCircle, FolderOpen, Loader2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { WIZARD_STEPS, type WizardStep } from '../types';
import { WizardSidebar, WizardTopBar } from '../components/layout/WizardProgress';
import ProjectDrawer from '../components/layout/ProjectDrawer';
import SimpleAutoProcess from '../components/layout/SimpleAutoProcess';
import StepReviewPanel from '../components/layout/StepReviewPanel';
import PlanningStep from '../components/steps/PlanningStep';
import IdeaStep from '../components/steps/IdeaStep';
import HookStep from '../components/steps/HookStep';
import ScriptSplitStep from '../components/steps/ScriptSplitStep';
import VeoClipStep from '../components/steps/VeoClipStep';
import SlidesStep from '../components/steps/SlidesStep';
import SubtitleNarrationStep from '../components/steps/SubtitleNarrationStep';
import StoryboardStep from '../components/steps/StoryboardStep';
import UploadCopyStep from '../components/steps/UploadCopyStep';
import ExportStep from '../components/steps/ExportStep';
import Alert from '../components/ui/Alert';
import { saveProject } from '../services/db.service';

const SIMPLE_AUTO_STEPS = new Set<WizardStep>([
  'hooks', 'script-split', 'veo-clip', 'slides', 'subtitle-narration',
]);

const STEP_COMPONENTS: Record<WizardStep, React.ComponentType> = {
  'planning':           PlanningStep,
  'ideas':              IdeaStep,
  'hooks':              HookStep,
  'script-split':       ScriptSplitStep,
  'veo-clip':           VeoClipStep,
  'slides':             SlidesStep,
  'subtitle-narration': SubtitleNarrationStep,
  'storyboard':         StoryboardStep,
  'upload-copy':        UploadCopyStep,
  'export':             ExportStep,
};

function getCompletedSteps(currentStep: WizardStep): WizardStep[] {
  const idx = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  return WIZARD_STEPS.slice(0, idx).map(s => s.id);
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function Wizard() {
  const {
    session, settings, setStep, directSetStep, currentProjectId,
    setCurrentProjectId, loadProjectSession, resetSession,
    videoMode, pendingNextStep, confirmPendingStep, cancelPendingStep, triggerRegenerate,
  } = useApp();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [autoError, setAutoError] = useState('');

  const currentStep = session.currentStep;
  const completed = getCompletedSteps(currentStep);
  const StepComponent = STEP_COMPONENTS[currentStep];
  const canSave = !!session.planning;
  const showAutoProcess = videoMode === 'simple' && SIMPLE_AUTO_STEPS.has(currentStep);

  async function handleSave() {
    if (!canSave) return;
    setSaveStatus('saving');
    try {
      const newId = await saveProject(currentProjectId, session);
      setCurrentProjectId(newId);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }

  function handleNew() {
    if (window.confirm('현재 작업을 초기화하고 새 프로젝트를 시작할까요?')) resetSession();
  }

  return (
    <div className="min-h-screen">
      <WizardTopBar currentStep={currentStep} completedSteps={completed} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 space-y-2">
        {settings.useMockMode && (
          <Alert variant="warning">
            <span className="font-medium">데모 모드</span>로 실행 중입니다.{' '}
            <button onClick={() => navigate('/settings')} className="underline font-semibold">
              설정에서 Gemini API 키를 입력하세요
            </button>.
          </Alert>
        )}

        {/* 저장 바 */}
        <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {currentProjectId
              ? <><span className="font-bold text-slate-700 dark:text-slate-300">{session.planning?.topic ?? '저장됨'}</span></>
              : '저장되지 않은 프로젝트'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#5157D8] dark:hover:text-[#B4B7F8] px-2 py-1.5 rounded-xl hover:bg-[#ECEDFD] dark:hover:bg-[#8489F2]/10 transition-colors">
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">작업 내역</span>
            </button>
            <button onClick={handleSave} disabled={!canSave || saveStatus === 'saving'}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                saveStatus === 'saved'  ? 'bg-[#DBF7E5] dark:bg-[#8BE8AC]/15 text-[#1E9950] dark:text-[#8BE8AC]'
                : saveStatus === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-[#8489F2] hover:bg-[#6D72E0] text-white disabled:opacity-50'
              }`}>
              {saveStatus === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saveStatus === 'saved'  && <CheckCircle className="w-3.5 h-3.5" />}
              {saveStatus === 'error'  && <AlertCircle className="w-3.5 h-3.5" />}
              {saveStatus === 'idle'   && <Save className="w-3.5 h-3.5" />}
              {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'saved' ? '저장됨' : saveStatus === 'error' ? '저장 실패' : '저장'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-8">
          <WizardSidebar currentStep={currentStep} completedSteps={completed} onStepClick={directSetStep} />
          <div className="flex-1 min-w-0 max-w-3xl">
            {autoError && (
              <Alert variant="error" onClose={() => { setAutoError(''); setStep('ideas'); }}>
                자동 제작 중 오류: {autoError} — 아이디어 선택 단계로 돌아갑니다.
              </Alert>
            )}
            <StepComponent />
          </div>
        </div>
      </div>

      {showAutoProcess && (
        <SimpleAutoProcess
          onError={msg => { setAutoError(msg); directSetStep('ideas'); }}
        />
      )}

      {pendingNextStep && videoMode === 'advanced' && (
        <StepReviewPanel
          currentStep={currentStep}
          onConfirm={confirmPendingStep}
          onEdit={cancelPendingStep}
          onRegenerate={() => triggerRegenerate(currentStep)}
        />
      )}

      <ProjectDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLoad={loadProjectSession}
        onNew={handleNew}
        currentProjectId={currentProjectId}
      />
    </div>
  );
}
