import { useEffect, useState } from 'react';
import { X, FolderOpen, Trash2, DownloadCloud, Plus, Loader2, AlertCircle, Clock, FileText, ChevronRight } from 'lucide-react';
import { listProjects, deleteProject, type SavedProject } from '../../services/db.service';
import type { AppSession } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onLoad: (session: Partial<AppSession>, projectId: string) => void;
  onNew: () => void;
  currentProjectId: string | null;
}

const STEP_LABELS: Record<string, string> = {
  'planning': '기획', 'ideas': '아이디어', 'hooks': '훅',
  'script-split': '대본', 'veo-clip': 'Veo 클립', 'slides': '슬라이드',
  'subtitle-narration': '자막/나레이션', 'storyboard': '스토리보드',
  'upload-copy': '업로드 카피', 'export': '완료',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function ProjectDrawer({ open, onClose, onLoad, onNew, currentProjectId }: Props) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true); setError('');
    listProjects()
      .then(setProjects)
      .catch(() => setError('프로젝트 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm('이 프로젝트를 삭제할까요?')) return;
    setDeleting(id);
    try {
      await deleteProject(id);
      setProjects(ps => ps.filter(p => p.id !== id));
    } catch { setError('삭제에 실패했습니다.'); }
    finally { setDeleting(null); }
  }

  function handleLoad(project: SavedProject) {
    if (currentProjectId && currentProjectId !== project.id) {
      if (!window.confirm('현재 작업 중인 내용이 사라집니다. 불러올까요?')) return;
    }
    onLoad(project.session_data, project.id);
    onClose();
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-violet-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">내 작업 내역</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* New project button */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <button onClick={() => { onNew(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />새 프로젝트 시작
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-600">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">저장된 작업이 없습니다.</p>
              <p className="text-xs mt-1">제작 중 저장 버튼을 눌러 보관하세요.</p>
            </div>
          )}

          {projects.map(project => (
            <div key={project.id}
              className={`rounded-xl border transition-colors ${
                currentProjectId === project.id
                  ? 'border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
              }`}>
              {/* 프로젝트 헤더 */}
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === project.id ? null : project.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{project.title}</p>
                    {project.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{project.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                        {STEP_LABELS[project.current_step] ?? project.current_step}단계까지
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />{formatDate(project.updated_at)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${expanded === project.id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* 펼쳐진 대본 미리보기 */}
              {expanded === project.id && project.full_script && (
                <div className="px-4 pb-3 -mt-1">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <FileText className="w-3 h-3" />대본 미리보기
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-6">
                      {project.full_script}
                    </p>
                  </div>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-2 px-4 pb-4">
                <button onClick={() => handleLoad(project)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors">
                  <DownloadCloud className="w-3.5 h-3.5" />불러오기
                </button>
                <button onClick={e => handleDelete(project.id, e)} disabled={deleting === project.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
                  {deleting === project.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
