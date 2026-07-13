import { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Wand2, 
  Film, 
  ShoppingBag, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ArrowRight, 
  CheckCircle2,
  Moon,
  Sun
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';

// ─── Brand palette (Home.tsx와 동일) ──────────────────────────────────────────
// mint  #8BE8AC · periwinkle #8489F2 · orange #F79A4D · ink #241E3C

const PAYMENT_URL = 'https://www.groble.im/payment/gXWTv4';

const FEATURES = [
  {
    icon: <Clock className="w-6 h-6 text-[#8BE8AC]" />,
    title: '매주 반복되는 기획에서 해방',
    desc: '매번 머리 아프게 고민하던 주제 선정과 오프닝 훅, 대본 작성까지 AI 제시카가 트렌디한 문체로 대신 작성합니다.',
  },
  {
    icon: <Wand2 className="w-6 h-6 text-[#8489F2]" />,
    title: '레퍼런스 스타일 그대로 복제',
    desc: '벤치마킹하고 싶은 영상만 업로드하세요. 대본의 어조, 화면 구성, 폰트 스타일, BGM 분위기까지 그대로 흡수해 재창조합니다.',
  },
  {
    icon: <Film className="w-6 h-6 text-[#F79A4D]" />,
    title: '원클릭 숏폼 비디오 원스톱 빌드',
    desc: '8초 분량의 오프닝 영상(Veo AI)과 22초 분량의 씬 이미지, 음성 내레이션 및 자막 인코딩까지 한 번에 완성합니다.',
  },
];

const STEPS = [
  {
    num: '01',
    title: '주제 & 레퍼런스 입력',
    desc: '제작하고 싶은 주제 키워드를 적고, 분석하고 싶은 레퍼런스 영상이 있다면 업로드합니다.',
  },
  {
    num: '02',
    title: 'AI 스크립트 분할 및 편집',
    desc: 'AI가 첫 3초의 강렬한 훅을 포함한 전체 스크립트를 작성하고 씬별 매칭과 자막을 자동 설정합니다.',
  },
  {
    num: '03',
    title: '최종 비디오 생성 및 내보내기',
    desc: '배경음악(BGM), 효과음, 나레이션 음성 파일이 믹스된 완성형 30초 MP4 숏폼 비디오를 소장합니다.',
  },
];

const FAQS = [
  {
    q: '제작된 숏폼 영상의 상업적 이용이 가능한가요?',
    a: '네, 가능합니다! 생성된 숏폼 영상은 저작권 프리 소스와 사용자의 API를 기반으로 제작되므로 유튜브, 틱톡, 인스타그램 릴스 등 상업적 채널에 업로드하여 수익화할 수 있습니다.',
  },
  {
    q: '구글 Gemini API 연결 시 제 API 키는 안전하게 보호되나요?',
    a: '네, 매우 안전하게 보호됩니다! 입력하신 구글 API 키는 당사의 중앙 서버에 저장되지 않고, 오직 사용자의 브라우저 로컬 스토리지(LocalStorage) 또는 로그인하신 사용자의 개인용 Supabase 데이터베이스에 직접 암호화 저장됩니다. 모든 AI 생성 작업은 귀하의 브라우저에서 구글 서버로 직접 보안 통신을 통해 이루어지므로 정보 유출 걱정 없이 안심하고 사용할 수 있습니다.',
  },
  {
    q: '9,900원 결제 시 추가 결제가 필요한가요?',
    a: '아닙니다! 일회성 결제로 SnapReel의 모든 UI와 기능 시스템을 제한 없이 평생 소장하여 사용할 수 있습니다. 단, 대량 생성 시 API 사용료는 개별 API 설정에 따릅니다.',
  },
  {
    q: '레퍼런스 영상 분석은 어떻게 이루어지나요?',
    a: '업로드된 쇼츠 영상의 시각적 흐름, 사운드, 자막 스타일을 AI가 다차원적으로 분석하여 유사한 톤앤매너로 대본 및 비주얼 프롬프트를 보정해 줍니다.',
  },
];

export default function Landing() {
  const { isDark, toggleDark } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function toggleFaq(index: number) {
    setOpenFaq(openFaq === index ? null : index);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131122] text-slate-800 dark:text-slate-100 overflow-x-hidden font-sans relative transition-colors duration-300">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-[#8489F2]/5 dark:bg-[#8489F2]/10 rounded-full blur-[100px] -z-10 pointer-events-none transition-colors" />
      <div className="absolute top-80 right-1/4 w-[350px] h-[350px] bg-[#8BE8AC]/5 dark:bg-[#8BE8AC]/10 rounded-full blur-[100px] -z-10 pointer-events-none transition-colors" />
      <div className="absolute bottom-40 left-10 w-[300px] h-[300px] bg-[#F79A4D]/5 dark:bg-[#F79A4D]/10 rounded-full blur-[90px] -z-10 pointer-events-none transition-colors" />

      {/* Header */}
      <header className="w-full border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#131122]/60 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#8489F2] to-[#8BE8AC] rounded-xl flex items-center justify-center shadow-md">
              <Film className="w-5 h-5 text-[#241E3C]" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white transition-colors">
              Snap<span className="text-[#8489F2]">Reel</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              id="header_demo_btn"
              className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              데모 체험
            </Link>
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleDark} 
              id="theme_toggle_btn"
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              aria-label={isDark ? '라이트 모드' : '다크 모드'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>

            <a
              href={PAYMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="header_buy_btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#241E3C] dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-[#1b172e] dark:hover:bg-slate-100 transition-colors shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              지금 구매하기
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center">
        
        {/* Badge */}
        <div className="flex justify-center mb-6 slide-up">
          <div className="inline-flex items-center gap-2 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-full tracking-wide transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-[#F79A4D]" />
            AI 숏폼 스튜디오
          </div>
        </div>

        {/* Hero Title */}
        <section className="text-center max-w-3xl mb-16 slide-up">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none mb-6 text-slate-900 dark:text-white transition-colors">
            숏폼 제작소 <span className="bg-gradient-to-r from-[#8BE8AC] via-[#8489F2] to-[#F79A4D] bg-clip-text text-transparent">SnapReel</span>
          </h1>
          <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto transition-colors">
            매번 머리 싸매며 대본을 고민하고 영상 편집에 시간을 낭비하고 계신가요? 
            <br />
            <span className="text-slate-950 dark:text-white font-bold underline decoration-[#8BE8AC] decoration-2 underline-offset-4 transition-colors">
              레퍼런스 영상 하나면 AI 제시카가 30초 숏폼을 완성
            </span>
            합니다.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
            <a
              href={PAYMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="hero_buy_btn"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#8489F2] hover:bg-[#6D72E0] text-white font-bold text-base shadow-[0_8px_30px_rgba(132,137,242,0.4)] hover:shadow-[0_12px_40px_rgba(132,137,242,0.6)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              라이선스 평생 소장하기 (9,900원)
            </a>
            <Link
              to="/"
              id="hero_demo_btn"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-200/50 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-base border border-slate-300 dark:border-white/10 transition-all flex items-center justify-center gap-1.5"
            >
              무료 데모 체험
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Video Mockup Frame */}
        <section className="w-full max-w-4xl mb-24 relative slide-up">
          <div className="aspect-[16/9] w-full rounded-[2.5rem] bg-slate-100 dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 border border-slate-300 dark:border-white/10 p-4 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center transition-colors">
            
            {/* Phone Overlay inside Mockup */}
            <div className="flex w-full h-full gap-6 items-center justify-center px-4 sm:px-12">
              
              {/* Left Column: UI Timeline Description */}
              <div className="hidden md:flex flex-col gap-4 flex-1 text-left">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8BE8AC]" />
                  <span className="text-xs font-bold tracking-widest text-[#8BE8AC] uppercase">AI Auto-Generator</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight transition-colors">자동 타임라인 & 자막 싱크</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">
                  음성 내레이션과 영상 화면 흐름을 일치시키고, 시청자가 놓치기 힘든 굵고 뚜렷한 임팩트 자막을 자동으로 분할 노출합니다.
                </p>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#8BE8AC]" /> 0~8초 인트로 훅 자막 자동 조각화
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#8489F2]" /> 8~30초 슬라이드 씬 매칭
                  </div>
                </div>
              </div>

              {/* Right Column: Mini Phone UI Mockup */}
              <div className="w-[220px] sm:w-[240px] h-[360px] sm:h-[400px] shrink-0 rounded-[2.5rem] bg-slate-950 border-[6px] border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden flex flex-col transition-colors">
                {/* Speaker pill */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-100 dark:bg-slate-900 rounded-full z-20 flex items-center justify-center transition-colors">
                  <div className="w-2 h-2 rounded-full bg-slate-350 dark:bg-slate-800 transition-colors" />
                </div>

                {/* Inner Video Mockup */}
                <div className="w-full h-full relative bg-gradient-to-b from-[#241E3C] to-[#120F24] flex flex-col justify-between p-4 pt-10">
                  
                  {/* Mock Video Visual */}
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600')] z-0" />

                  {/* Top Bar inside Phone */}
                  <div className="flex justify-between items-center z-10">
                    <span className="text-[10px] font-bold bg-[#8489F2] text-white px-2 py-0.5 rounded-full">LIVE</span>
                    <span className="text-[10px] text-slate-400">SnapReel AI</span>
                  </div>

                  {/* Captions overlay in Mock Video */}
                  <div className="w-full flex flex-col items-center justify-center flex-1 z-10 py-6">
                    <div className="animate-pulse bg-[#8BE8AC] text-slate-950 font-black text-sm px-3.5 py-1.5 rounded-lg shadow-lg rotate-1">
                      첫 3초 훅을 잡으세요!🔥
                    </div>
                  </div>

                  {/* Bottom Controls / Waveform */}
                  <div className="w-full space-y-2.5 z-10 bg-slate-950/80 backdrop-blur-sm p-2.5 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                      <span>0:08</span>
                      <span>0:30</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#8BE8AC] to-[#8489F2] w-1/3 rounded-full" />
                    </div>
                    {/* Dummy waveform */}
                    <div className="flex items-end justify-between h-4 px-1 gap-[2px]">
                      <span className="w-1 bg-[#8489F2] h-2 rounded-full" />
                      <span className="w-1 bg-[#8489F2] h-4 rounded-full" />
                      <span className="w-1 bg-[#8BE8AC] h-3 rounded-full" />
                      <span className="w-1 bg-[#8BE8AC] h-1 rounded-full" />
                      <span className="w-1 bg-[#8489F2] h-3 rounded-full" />
                      <span className="w-1 bg-[#F79A4D] h-2 rounded-full" />
                      <span className="w-1 bg-[#F79A4D] h-4 rounded-full" />
                      <span className="w-1 bg-[#8BE8AC] h-2 rounded-full" />
                      <span className="w-1 bg-[#8489F2] h-3 rounded-full" />
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Features / Value Grid */}
        <section className="w-full max-w-5xl mb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors">크리에이팅의 패러다임을 바꾸는 AI</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base transition-colors">지루한 노가다는 제시카에게 맡기고 콘텐츠 컨셉에만 집중하세요.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((feat, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 hover:-translate-y-1 hover:border-slate-350 dark:hover:border-white/20 transition-all duration-300 relative group shadow-sm dark:shadow-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Steps Process */}
        <section className="w-full max-w-5xl mb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors">단 3단계로 끝나는 제작 흐름</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base transition-colors">복잡한 영상 편집 툴을 켤 필요가 없습니다.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex flex-col items-start relative pl-6 sm:pl-0">
                {/* Step Connector Line */}
                {idx < 2 && (
                  <div className="hidden sm:block absolute top-7 left-[calc(100%-40px)] w-[80px] h-[1px] bg-slate-300 dark:bg-gradient-to-r dark:from-slate-700 dark:to-transparent z-0 transition-colors" />
                )}
                
                {/* Step Number */}
                <div className="text-4xl font-black bg-gradient-to-br from-[#8489F2] to-[#8BE8AC] bg-clip-text text-transparent mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Value Proposition Statistics */}
        <section className="w-full max-w-4xl bg-white dark:bg-gradient-to-r dark:from-[#8489F2]/10 dark:to-[#8BE8AC]/10 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 mb-28 text-center shadow-sm dark:shadow-none transition-colors">
          <div className="grid grid-cols-3 gap-6 divide-x divide-slate-200 dark:divide-white/10">
            <div>
              <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white transition-colors">95%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2 transition-colors">제작 시간 단축</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white transition-colors">90%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2 transition-colors">제작 비용 절감</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white transition-colors">24h</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2 transition-colors">쉬지 않는 생성 서버</p>
            </div>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="w-full max-w-md bg-white dark:bg-gradient-to-b dark:from-white/10 dark:to-white/5 border border-slate-200 dark:border-white/15 rounded-[2.5rem] p-8 sm:p-10 text-center shadow-xl dark:shadow-2xl relative overflow-hidden mb-28 transition-colors">
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#8489F2]/10 dark:bg-[#8489F2]/20 rounded-full blur-2xl transition-colors" />
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-[#8BE8AC]/10 dark:bg-[#8BE8AC]/20 rounded-full blur-2xl transition-colors" />

          <p className="text-xs font-extrabold text-[#8489F2] dark:text-[#8BE8AC] tracking-widest uppercase mb-2 transition-colors">LIMITED LAUNCH OFFER</p>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors">스튜디오 라이선스</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 transition-colors">추가 결제 없이 무제한으로 기획하고 소장하세요</p>

          <div className="py-6 border-y border-slate-200 dark:border-white/10 mb-8 transition-colors">
            <span className="text-sm text-slate-450 line-through mr-2">99,000원</span>
            <span className="text-5xl font-black text-slate-900 dark:text-white transition-colors">
              9,900<span className="text-2xl align-top ml-1">원</span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 transition-colors">일회성 구매 · 평생 라이선스 권한 부여</p>
          </div>

          <ul className="text-left space-y-3.5 mb-8">
            <li className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors">
              <Check className="w-4 h-4 text-[#8BE8AC] shrink-0" />
              <span>간단 / 고급 숏폼 제작 빌더 완전 사용</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors">
              <Check className="w-4 h-4 text-[#8BE8AC] shrink-0" />
              <span>자체 Gemini API 연동 모드 지원</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors">
              <Check className="w-4 h-4 text-[#8BE8AC] shrink-0" />
              <span>레퍼런스 스타일 무제한 분석 및 대본 최적화</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors">
              <Check className="w-4 h-4 text-[#8BE8AC] shrink-0" />
              <span>Veo AI 오프닝 클립 및 스토리보드 제작툴 제공</span>
            </li>
          </ul>

          <a
            href={PAYMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="pricing_buy_btn"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#8489F2] hover:bg-[#6D72E0] text-white font-bold text-base shadow-[0_8px_35px_rgba(132,137,242,0.45)] hover:-translate-y-0.5 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            지금 즉시 구매하기
          </a>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-3xl mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">자주 묻는 질문</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    id={`faq_toggle_${idx}`}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-base pr-4 flex items-center gap-2.5 transition-colors">
                      <HelpCircle className="w-5 h-5 text-[#8489F2] shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-950 dark:text-white' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-6 pt-0 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 transition-colors">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line transition-colors">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#0e0d18] py-12 text-center text-slate-500 dark:text-slate-600 text-xs transition-colors">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          <p className="font-black text-sm tracking-tight text-slate-700 dark:text-slate-450 transition-colors">
            Snap<span className="text-[#8489F2]">Reel</span>
          </p>
          <p className="max-w-md mx-auto leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
            SnapReel은 1인 미디어 제작자와 유튜버의 작업 효율을 위한 최첨단 AI 스튜디오 템플릿 서비스입니다.
          </p>
          <p className="text-slate-400 dark:text-slate-600 transition-colors">
            © 2026 SnapReel. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
