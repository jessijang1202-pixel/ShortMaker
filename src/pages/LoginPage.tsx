import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { signIn, signUp } from '../services/auth.service';
import { useAuth } from '../store/AuthContext';
import Button from '../components/ui/Button';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSent, setSignupSent] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate('/', { replace: true });
  }, [user, authLoading, navigate]);

  function switchTab(t: Tab) { setTab(t); setError(''); setSignupSent(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('이메일과 비밀번호를 입력해 주세요.'); return; }
    if (tab === 'signup' && password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }

    setLoading(true);
    try {
      if (tab === 'login') {
        await signIn(email.trim(), password);
        navigate('/', { replace: true });
      } else {
        const data = await signUp(email.trim(), password);
        if (data.session) navigate('/', { replace: true });
        else setSignupSent(true);
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

  if (signupSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">이메일을 확인하세요</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>{email}</strong> 으로 가입 확인 이메일을 보냈습니다.
          </p>
          <button type="button" onClick={() => { setSignupSent(false); switchTab('login'); }}
            className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline">
            로그인 화면으로 돌아가기
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

      {/* Card */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {(['login', 'signup'] as Tab[]).map(t => (
            <button key={t} type="button" onClick={() => switchTab(t)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-slate-800'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
              {t === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

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
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'} required />
              <button type="button" onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {tab === 'signup' && (
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

          <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
            {tab === 'login' ? '로그인' : '회원가입'}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-xs text-slate-400 text-center">
        API 키는 계정에 암호화 저장됩니다 · 작업 내역도 클라우드에 저장됩니다
      </p>
    </div>
  );
}
