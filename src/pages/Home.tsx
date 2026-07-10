import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, CheckCircle, Sparkles, Wand2, Clapperboard, Zap } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';

// ─── Brand palette (레퍼런스 이미지 기반) ────────────────────────────────────
// mint  #8BE8AC · periwinkle #8489F2 · orange #F79A4D · ink #241E3C

export default function Home() {
  const navigate = useNavigate();
  const { settings, resetSession, setVideoMode } = useApp();
  const { user } = useAuth();

  function handleModeClick(mode: 'simple' | 'advanced') {
    setVideoMode(mode);
    if (user) {
      resetSession();
      navigate('/wizard');
    } else {
      navigate('/login', { state: { from: '/wizard' } });
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#241E3C] dark:bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#F79A4D]" />
          AI 숏폼 스튜디오
        </div>

        <h1 className="text-6xl sm:text-7xl font-black tracking-tight leading-none mb-5">
          <span className="text-[#241E3C] dark:text-white">Snap</span>
          <span className="text-[#8489F2]">Reel</span>
        </h1>

        <p className="text-xl sm:text-2xl font-bold text-[#241E3C] dark:text-white leading-snug">
          레퍼런스 영상 하나면,
          <br />
          <span className="relative inline-block mt-1">
            <span className="absolute inset-x-0 bottom-1 h-4 bg-[#8BE8AC] dark:bg-[#8BE8AC]/40 -z-10 rounded" />
            AI가 20초 숏폼을 완성
          </span>
        </p>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          아이디어 → AI 영상 → 자막·음악까지 한 번에
        </p>

        {/* Status badge */}
        <div className="mt-5">
          {settings.useMockMode ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B06A1F] bg-[#FDEBD7] dark:bg-amber-950/40 dark:text-amber-400 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F79A4D] animate-pulse" />
              데모 모드 — API 키 없이 체험 가능
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-[#DBF7E5] dark:bg-emerald-950/40 dark:text-emerald-400 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3 h-3" />
              Gemini API 연결됨
            </span>
          )}
        </div>
      </div>

      {/* Mode cards — 컬러 블록 */}
      <div className="grid sm:grid-cols-2 gap-5 mb-10">

        {/* 간단 영상 만들기 — mint */}
        <button
          onClick={() => handleModeClick('simple')}
          className="group relative text-left rounded-[2rem] bg-[#8BE8AC] p-7 pb-8 overflow-hidden
                     shadow-[0_8px_30px_rgba(139,232,172,0.45)] hover:shadow-[0_12px_40px_rgba(139,232,172,0.65)]
                     hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/25 group-hover:scale-125 transition-transform duration-300" />
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm">
            <Wand2 className="w-7 h-7 text-[#1E9950]" />
          </div>
          <h3 className="text-2xl font-black text-[#14351F] leading-tight">
            간단 영상<br />만들기
          </h3>
          <p className="mt-2.5 text-sm font-medium text-[#2C5E3D] leading-relaxed">
            주제만 넣으면 AI가 알아서 완성.
            <br />클릭 몇 번으로 끝!
          </p>
          <div className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#14351F]">
            바로 시작
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* 고급 영상 만들기 — periwinkle */}
        <button
          onClick={() => handleModeClick('advanced')}
          className="group relative text-left rounded-[2rem] bg-[#8489F2] p-7 pb-8 overflow-hidden
                     shadow-[0_8px_30px_rgba(132,137,242,0.45)] hover:shadow-[0_12px_40px_rgba(132,137,242,0.65)]
                     hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/20 group-hover:scale-125 transition-transform duration-300" />
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm">
            <Clapperboard className="w-7 h-7 text-[#5157D8]" />
          </div>
          <h3 className="text-2xl font-black text-white leading-tight">
            고급 영상<br />만들기
          </h3>
          <p className="mt-2.5 text-sm font-medium text-[#E3E4FD] leading-relaxed">
            10단계를 직접 확인하며
            <br />영상·이미지·자막 맞춤 제작
          </p>
          <div className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-white">
            바로 시작
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* 핵심 3가지만 — orange accent strip */}
      <div className="rounded-[2rem] bg-[#F79A4D] p-7 mb-10 shadow-[0_8px_30px_rgba(247,154,77,0.4)]">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-black text-white">20초</p>
            <p className="text-xs font-semibold text-[#7A3D0E] mt-1">완성 영상 길이</p>
          </div>
          <div>
            <p className="text-3xl font-black text-white">8초</p>
            <p className="text-xs font-semibold text-[#7A3D0E] mt-1">Veo AI 영상<br />+ 음악·효과음</p>
          </div>
          <div>
            <p className="text-3xl font-black text-white">12초</p>
            <p className="text-xs font-semibold text-[#7A3D0E] mt-1">내 사진·영상<br />또는 AI 이미지</p>
          </div>
        </div>
      </div>

      {/* Settings shortcut */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => navigate('/settings')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#241E3C] dark:bg-white/10 text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Settings className="w-4 h-4" />
          API 키 설정
        </button>
        {settings.useMockMode && (
          <button
            onClick={() => handleModeClick('simple')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#241E3C] dark:border-white/30 text-[#241E3C] dark:text-white text-sm font-bold hover:bg-[#241E3C] hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <Zap className="w-4 h-4" />
            데모로 체험하기
          </button>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-10">
        SnapReel — 누구나 20초 크리에이터
      </p>
    </div>
  );
}
