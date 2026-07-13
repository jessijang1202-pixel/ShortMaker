import { Sparkles, Clock, Wand2, Film, Lock } from 'lucide-react';

// ─── Brand palette (Home.tsx와 동일) ──────────────────────────────────────────
// mint  #8BE8AC · periwinkle #8489F2 · orange #F79A4D · ink #241E3C

const POINTS = [
  {
    icon: <Clock className="w-5 h-5 text-[#1E9950]" />,
    title: '매주 반복되는 숏폼 기획, 이제 손 뗄 시간',
    desc: '유튜버·숏폼 크리에이터가 매번 처음부터 다시 짜야 했던 주제 선정과 대본 작성을 제시카가 대신합니다.',
  },
  {
    icon: <Wand2 className="w-5 h-5 text-[#5157D8]" />,
    title: '아이디어 → 영상 → 자막까지 한 번에',
    desc: '기획안만 던져주면 AI 영상 생성부터 자막·음악 배치까지 제시카가 알아서 끝까지 완성합니다.',
  },
  {
    icon: <Film className="w-5 h-5 text-[#B0621E]" />,
    title: '크리에이터는 콘텐츠 방향에만 집중',
    desc: '반복적인 제작 업무는 제시카에게 맡기고, 사람은 채널 전략과 소통에만 시간을 쓸 수 있습니다.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-lg">

        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#241E3C] text-white text-xs font-bold px-4 py-2 rounded-full tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#F79A4D]" />
            AI 직원 소개
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-6xl sm:text-7xl font-black tracking-tight leading-none mb-5">
            <span className="text-[#241E3C] dark:text-white">제시카</span>
          </h1>
          <p className="text-lg sm:text-xl font-bold text-[#241E3C] dark:text-white leading-snug">
            유튜버와 숏폼 크리에이터를 위한
            <br />
            <span className="relative inline-block mt-1">
              <span className="absolute inset-x-0 bottom-1 h-4 bg-[#8BE8AC] dark:bg-[#8BE8AC]/40 -z-10 rounded" />
              24시간 쉬지 않는 숏폼 자동 제작 AI 직원
            </span>
          </p>
        </div>

        {/* 소개 3줄 */}
        <div className="space-y-4 mb-10">
          {POINTS.map((p) => (
            <div key={p.title} className="wizard-card flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {p.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{p.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 가격 카드 */}
        <div className="rounded-[2rem] bg-[#8489F2] p-8 mb-6 text-center shadow-[0_8px_30px_rgba(132,137,242,0.45)]">
          <p className="text-sm font-bold text-[#E3E4FD] mb-2">일회성 구매</p>
          <p className="text-5xl font-black text-white mb-1">
            9,900<span className="text-2xl align-top ml-0.5">원</span>
          </p>
          <p className="text-xs text-[#E3E4FD] font-medium">평생 소장 · 추가 결제 없음</p>
        </div>

        {/* 구매하기 버튼 — 결제 연결 준비 전까지 비활성 */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-base cursor-not-allowed select-none"
        >
          <Lock className="w-4 h-4" />
          결제 연결 준비 중
        </button>
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-3">
          결제 연결이 완료되면 이 버튼으로 바로 구매할 수 있어요
        </p>

      </div>
    </div>
  );
}
