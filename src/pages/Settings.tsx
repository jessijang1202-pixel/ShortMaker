import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Eye, EyeOff, CheckCircle, XCircle, Loader2, Trash2, ExternalLink, ArrowLeft, Info, Cloud } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import type { UserApiSettings } from '../types';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { validateGeminiKey } from '../services/gemini.service';

type ValidStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export default function Settings() {
  const { settings, setSettings } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<UserApiSettings>({ ...settings });
  const [showGemini, setShowGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<ValidStatus>('idle');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleValidateGemini() {
    if (!form.geminiApiKey) return;
    setGeminiStatus('validating');
    try {
      const valid = await validateGeminiKey(form.geminiApiKey);
      setGeminiStatus(valid ? 'valid' : 'invalid');
    } catch {
      setGeminiStatus('invalid');
    }
  }

  function handleSave() {
    const useMockMode = !form.geminiApiKey.trim();
    setSettings({ ...form, useMockMode });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function clearGemini() {
    setForm(f => ({ ...f, geminiApiKey: '' }));
    setGeminiStatus('idle');
  }

  const StatusIcon = () => {
    if (geminiStatus === 'validating') return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (geminiStatus === 'valid') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (geminiStatus === 'invalid') return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          뒤로
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">API 키 설정</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          API 키는 로그인 계정에 저장됩니다.
        </p>
      </div>

      {user && (
        <div className="flex items-start gap-2.5 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-3 mb-6 text-sm">
          <Cloud className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-violet-700 dark:text-violet-300">계정에 저장됩니다</p>
            <p className="text-violet-600 dark:text-violet-400 text-xs mt-0.5">
              <strong>{user.email}</strong> 계정에 암호화 저장 — 다음 로그인 시 자동으로 불러옵니다.
            </p>
          </div>
        </div>
      )}

      {/* Gemini API Key */}
      <div className="wizard-card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Gemini API 키</h2>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-blue-500 hover:underline flex items-center gap-1"
          >
            키 발급받기 <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          아이디어·대본 생성, Veo 영상(배경음악·효과음 포함), 이미지 생성, 업로드 카피에 사용됩니다.
        </p>

        <div className="relative">
          <input
            type={showGemini ? 'text' : 'password'}
            className="input-base pr-20"
            placeholder="AIzaSy..."
            value={form.geminiApiKey}
            onChange={e => { setForm(f => ({ ...f, geminiApiKey: e.target.value })); setGeminiStatus('idle'); }}
            autoComplete="off"
            spellCheck={false}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <StatusIcon />
            <button
              type="button"
              onClick={() => setShowGemini(s => !s)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {geminiStatus === 'valid' && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> 유효한 API 키입니다.
          </p>
        )}
        {geminiStatus === 'invalid' && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> 유효하지 않은 API 키입니다.
          </p>
        )}

        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleValidateGemini}
            disabled={!form.geminiApiKey || geminiStatus === 'validating'}
            loading={geminiStatus === 'validating'}
          >
            키 유효성 확인
          </Button>
          {form.geminiApiKey && (
            <Button size="sm" variant="ghost" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={clearGemini}>
              삭제
            </Button>
          )}
        </div>
      </div>

      {/* Flow stub */}
      <div className="wizard-card mb-4 border-dashed border-2 border-slate-200 dark:border-slate-700 opacity-60">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-5 h-5 text-purple-400" />
          <h2 className="font-semibold text-slate-700 dark:text-slate-400">Google Flow 연동</h2>
          <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">준비 중</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          이 버전에서는 Flow 연동을 사용하지 않습니다. 향후 업데이트에서 지원될 예정입니다.
        </p>
      </div>

      {/* Mock mode */}
      <div className="wizard-card mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">데모 모드 (Mock)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              API 키 없이 샘플 데이터로 모든 기능을 체험할 수 있습니다.
              Gemini API 키를 입력하면 자동으로 실제 모드로 전환됩니다.
            </p>
          </div>
          <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full ${form.geminiApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>
        <p className="text-xs mt-2 text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3" />
          현재 상태: {form.geminiApiKey ? '실제 Gemini API 사용' : '데모 모드 (Mock)'}
        </p>
      </div>

      {error && <Alert variant="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}
      {saved && (
        <Alert variant="success" className="mb-4">
          {user ? '설정이 계정에 저장되었습니다.' : '설정이 저장되었습니다.'}
        </Alert>
      )}

      <div className="flex gap-3">
        <Button size="lg" onClick={handleSave} leftIcon={<CheckCircle className="w-4 h-4" />}>
          설정 저장
        </Button>
        <Button size="lg" variant="secondary" onClick={() => navigate('/wizard')}>
          영상 제작으로 이동
        </Button>
      </div>

      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">개인정보 및 보안</p>
        {user ? (
          <>
            <p>• API 키는 Supabase에 저장되며 본인 계정으로만 접근 가능합니다.</p>
            <p>• 작업 내역(제목·대본·설명)은 클라우드에 저장됩니다. 영상 파일은 저장되지 않습니다.</p>
          </>
        ) : (
          <>
            <p>• API 키는 브라우저 sessionStorage에만 저장되며 서버로 전송되지 않습니다.</p>
            <p>• 탭/브라우저를 닫으면 모든 키와 세션 데이터가 삭제됩니다.</p>
          </>
        )}
        <p>• AI 생성 콘텐츠는 각 API 제공자의 이용약관을 따릅니다.</p>
      </div>
    </div>
  );
}
