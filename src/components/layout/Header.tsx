import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Moon, Sun, Film, Home, RotateCcw, LogOut, User } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import { signOut } from '../../services/auth.service';
import Button from '../ui/Button';

export default function Header() {
  const { isDark, toggleDark, resetSession } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isWizard = location.pathname === '/wizard';

  async function handleLogout() {
    if (!window.confirm('로그아웃 하시겠습니까?')) return;
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-[#241E3C] rounded-xl flex items-center justify-center shadow-sm">
            <Film className="w-4 h-4 text-[#8BE8AC]" />
          </div>
          <span className="brand-wordmark text-sm sm:text-base hidden xs:block">
            <span className="text-[#241E3C] dark:text-white">Snap</span><span className="text-[#8489F2]">Reel</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isWizard && (
            <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => { if (window.confirm('현재 작업을 초기화하고 처음부터 시작할까요?')) resetSession(); }}
              className="hidden sm:inline-flex text-slate-500">
              초기화
            </Button>
          )}
          {!isWizard && (
            <Link to="/"><Button variant="ghost" size="sm" leftIcon={<Home className="w-3.5 h-3.5" />}>
              <span className="hidden sm:inline">홈</span>
            </Button></Link>
          )}
          <Link to="/settings">
            <Button variant="ghost" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
              <span className="hidden sm:inline">설정</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={toggleDark} aria-label={isDark ? '라이트 모드' : '다크 모드'}>
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </Button>

          {user && (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700 ml-1">
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                <User className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400 max-w-[120px] truncate">
                  {user.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}
                aria-label="로그아웃" className="text-slate-500 hover:text-red-500">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
