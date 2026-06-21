import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Film, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { signIn, signUp, signInWithGoogle, signInWithKakao } from '../services/auth.service';
import { useAuth } from '../store/AuthContext';
import Button from '../components/ui/Button';

type EmailTab = 'login' | 'signup';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E">
      <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.623 1.617 4.926 4.07 6.274L5.14 20.5a.5.5 0 0 0 .73.55l4.35-2.9C10.72 18.22 11.35 18.25 12 18.25c5.523 0 10-3.477 10-7.75S17.523 3 12 3z"/>
    </svg>
  );
}


export default function LoginPage() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/wizard';

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTab, setEmailTab] = useState<EmailTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [signupDone, setSignupDone] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate(from, { replace: true });
  }, [user, authLoading, navigate, from]);

  function switchEmailTab(t: EmailTab) { setEmailTab(t); setError(''); }

  async function handleOAuth(provider: 'google' | 'kakao') {
    setError('');
    setOauthLoading(provider);
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithKakao();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
      setOauthLoading(null);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('이메일과 비밀번호를 입력해 주세요.'); return; }
    if (emailTab === 'signup' && password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }

    setLoading(true);
    try {
      if (emailTab === 'login') {
        await signIn(email.trim(), password);
        navigate(from, { replace: true });
      } else {
        await signUp(email.trim(), password);
        setSignupDone(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (signupDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto">
            <Film className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">회원가입 완료!</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>{email}</strong> 으로 가입이 완료되었습니다.
          </p>
          <button type="button"
            onClick={() => { setSignupDone(false); setEmailTab('login'); }}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors">
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Film className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">SnapReel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight">AI 숏폼 스튜디오</p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-5">
          간편하게 로그인하고 시작하세요
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Google */}
        <button
          onClick={() => handleOAuth('google')}
          disabled={!!oauthLoading}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-slate-800 dark:text-slate-200 text-sm shadow-sm disabled:opacity-60"
        >
          {oauthLoading === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
          <span className="flex-1 text-center">Google로 로그인</span>
        </button>

        {/* Kakao */}
        <button
          onClick={() => handleOAuth('kakao')}
          disabled={!!oauthLoading}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#FEE500] hover:bg-[#F5DB00] rounded-2xl transition-colors font-medium text-[#3C1E1E] text-sm shadow-sm disabled:opacity-60"
        >
          {oauthLoading === 'kakao' ? <Loader2 className="w-5 h-5 animate-spin" /> : <KakaoIcon />}
          <span className="flex-1 text-center">카카오로 로그인</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-400">또는</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Email toggle */}
        <button
          type="button"
          onClick={() => setEmailOpen(o => !o)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Mail className="w-4 h-4" />
          이메일로 계속하기
          <ChevronDown className={`w-4 h-4 transition-transform ${emailOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Email form */}
        {emailOpen && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Sub-tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              {(['login', 'signup'] as EmailTab[]).map(t => (
                <button key={t} type="button" onClick={() => switchEmailTab(t)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    emailTab === t
                      ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-slate-800'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}>
                  {t === 'login' ? '로그인' : '회원가입'}
                </button>
              ))}
            </div>

            <form onSubmit={handleEmailSubmit} className="p-5 space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" className="input-base pl-9" placeholder="example@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPw ? 'text' : 'password'} className="input-base pl-9 pr-10"
                    placeholder="6자 이상" value={password} onChange={e => setPassword(e.target.value)}
                    autoComplete={emailTab === 'login' ? 'current-password' : 'new-password'} required />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {emailTab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">비밀번호 확인</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPw ? 'text' : 'password'} className="input-base pl-9"
                      placeholder="비밀번호 재입력" value={passwordConfirm}
                      onChange={e => setPasswordConfirm(e.target.value)} autoComplete="new-password" required />
                  </div>
                </div>
              )}

              <Button type="submit" size="lg" loading={loading} className="w-full">
                {emailTab === 'login' ? '로그인' : '회원가입'}
              </Button>
            </form>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-slate-400 text-center">
        로그인 시 작업 내역이 클라우드에 저장됩니다
      </p>
    </div>
  );
}
