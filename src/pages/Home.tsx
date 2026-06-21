import { useNavigate } from 'react-router-dom';
import { Zap, Image, Download, Settings, ChevronRight, CheckCircle, Sparkles, Video, Layout, TrendingUp, Wand2, Clapperboard } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import Button from '../components/ui/Button';

const FEATURES = [
  { icon: <Zap className="w-5 h-5 text-amber-500" />, title: 'AI 아이디어 & 대본', desc: 'Gemini AI가 주제와 톤에 맞는 아이디어, 훅, 30초 대본을 구조적으로 생성합니다.' },
  { icon: <Video className="w-5 h-5 text-blue-500" />, title: 'Veo 3.1 Lite 핵심 클립', desc: '첫 8–10초를 Veo 3.1 Lite AI 영상으로 생성합니다. 직접 Gemini API로 처리됩니다.' },
  { icon: <Image className="w-5 h-5 text-amber-500" />, title: '슬라이드 씬 + 이미지', desc: '나머지 20초는 AI 이미지 + 텍스트 슬라이드로 구성됩니다. Imagen 3 / Gemini 이미지 생성.' },
  { icon: <Layout className="w-5 h-5 text-purple-500" />, title: '30초 스토리보드', desc: '타임라인 뷰와 폰 프레임 시뮬레이터로 최종 영상 구성을 미리 확인합니다.' },
  { icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, title: '플랫폼별 업로드 카피', desc: 'YouTube Shorts, Instagram Reels, TikTok, 카카오 맞춤 제목·캡션·해시태그.' },
  { icon: <Download className="w-5 h-5 text-violet-500" />, title: '내보내기 & 자산 저장', desc: '대본, Veo 프롬프트, 슬라이드 이미지, 스토리보드 JSON 모두 다운로드 가능합니다.' },
];

const STEPS = [
  { label: '기획 입력', hint: '' },
  { label: '아이디어', hint: '' },
  { label: '훅 선택', hint: '' },
  { label: '대본 분리', hint: 'Veo+슬라이드' },
  { label: 'Veo 클립', hint: '8–10s AI' },
  { label: '슬라이드', hint: '이미지+텍스트' },
  { label: '자막/나레이션', hint: 'ElevenLabs' },
  { label: '스토리보드', hint: '30초 타임라인' },
  { label: '업로드 카피', hint: '' },
  { label: '내보내기', hint: '' },
];

const CATEGORIES_PREVIEW = [
  { emoji: '🎬', label: '일상/브이로그' },
  { emoji: '🍜', label: '음식/먹방' },
  { emoji: '✈️', label: '여행/탐방' },
  { emoji: '💄', label: '뷰티/패션' },
  { emoji: '🎮', label: '게임/엔터' },
  { emoji: '💪', label: '피트니스/운동' },
  { emoji: '📚', label: '교육/꿀팁' },
  { emoji: '🐾', label: '반려동물' },
];

export default function Home() {
  const navigate = useNavigate();
  const { settings, resetSession } = useApp();
  const { user } = useAuth();

  function handleModeClick() {
    if (user) {
      resetSession();
      navigate('/wizard');
    } else {
      navigate('/login', { state: { from: '/wizard' } });
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Gemini API · Veo 3.1 Lite · Imagen 3
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
          SnapReel
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-2">
          AI 숏폼 스튜디오 — 누구나 30초 크리에이터
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xl mx-auto">
          Veo 3.1 Lite AI 영상(10초) + 슬라이드 씬(20초) = 30초 완성.
          아이디어부터 업로드 카피까지 10단계로 숏폼 영상을 뚝딱 만들어보세요.
        </p>

        <div className="mt-4">
          {settings.useMockMode ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              데모 모드 (Mock) — API 키 없이 체험 가능
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-3 h-3" />
              Gemini API 연결됨
            </span>
          )}
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {/* 간단 영상 만들기 */}
        <button
          onClick={handleModeClick}
          className="group text-left wizard-card border-2 border-transparent hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Wand2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">간단 영상 만들기</h3>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                클릭 몇 번으로 30초 숏폼 영상 제작 가능
              </p>
            </div>
          </div>
        </button>

        {/* 고급 영상 만들기 */}
        <button
          onClick={handleModeClick}
          className="group text-left wizard-card border-2 border-transparent hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Clapperboard className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">고급 영상 만들기</h3>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                동영상, 이미지, 자막, 목소리 등 맞춤 제작 가능
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Settings shortcut */}
      <div className="flex justify-center mb-10">
        <Button size="sm" variant="secondary" leftIcon={<Settings className="w-4 h-4" />} onClick={() => navigate('/settings')}>
          API 키 설정
        </Button>
      </div>

      {/* Category chips */}
      <div className="wizard-card mb-8">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">지원 콘텐츠 카테고리</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES_PREVIEW.map(c => (
            <span key={c.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-medium">
              {c.emoji} {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {FEATURES.map((f) => (
          <div key={f.title} className="wizard-card flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              {f.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{f.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Step flow */}
      <div className="wizard-card mb-12">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4 text-center">10단계 제작 워크플로우</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{i + 1}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{step.label}</span>
                </div>
                {step.hint && <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">{step.hint}</span>}
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Demo scenario */}
      <div className="wizard-card bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border-violet-200 dark:border-violet-800">
        <h2 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          데모 시나리오 포함
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          "기획 입력" 단계에서 <strong>예시 자동 채우기</strong> 버튼을 누르면 아래 샘플 데이터로 바로 체험해볼 수 있습니다.
        </p>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-sm">
          <div className="grid sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
            <div><span className="font-medium text-slate-800 dark:text-slate-200">크리에이터:</span> 1인 라이프스타일 유튜버</div>
            <div><span className="font-medium text-slate-800 dark:text-slate-200">카테고리:</span> 일상/브이로그</div>
            <div className="sm:col-span-2"><span className="font-medium text-slate-800 dark:text-slate-200">주제:</span> 새벽 5시에 일어나는 직장인의 아침 루틴 — 30분으로 하루가 달라진다</div>
            <div><span className="font-medium text-slate-800 dark:text-slate-200">말투:</span> 친근한, 유쾌한</div>
          </div>
        </div>
        <Button variant="primary" className="mt-4 w-full sm:w-auto" onClick={handleModeClick}>
          데모로 바로 시작하기
        </Button>
      </div>

      {/* Architecture note */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">기술 구성</p>
        <p>• Veo 3.1 Lite (veo-3.1-lite-generate-preview) — 8–10초 세로형 AI 영상 생성</p>
        <p>• Gemini Flash 이미지 생성 / Imagen 3 폴백 — 슬라이드 이미지</p>
        <p>• ElevenLabs — AI 나레이션 & 자막</p>
        <p>• API 키는 브라우저 sessionStorage에만 저장됩니다 (서버 전송 없음)</p>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
        SnapReel — 세션 중 데이터만 보관됩니다.
      </p>
    </div>
  );
}
