import React, { useState, useMemo } from 'react';
import { useProgrammeStore } from '../store/programmeStore';
import { useAuthStore } from '../store/authStore';
import { Session, ProgrammeItem, ProgrammeItemType } from '../types/programme';
import { CONFERENCE_DAYS } from '../data/event';
import { HALLS } from '../data/halls';
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Lock,
  User,
  LogIn,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Layers,
  Mic,
  Clock,
  MapPin,
  Sliders,
} from 'lucide-react';

export const Admin: React.FC = () => {
  const {
    sessions,
    updateSession,
    updateTalk,
    addTalk,
    deleteTalk,
    addSession,
    deleteSession,
    resetToDefaultProgramme,
    importProgrammeJson,
    getSpeakers,
    isSyncing,
    lastSynced,
    syncError,
    syncWithBackend,
  } = useProgrammeStore();

  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    error: authError,
    login,
    logout,
    clearError,
  } = useAuthStore();

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  // View Mode: 'sessions' | 'talks' | 'tools'
  const [activeTab, setActiveTab] = useState<'sessions' | 'talks' | 'tools'>('sessions');

  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedHall, setSelectedHall] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set());

  // Modal states
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [editingTalk, setEditingTalk] = useState<{ talk: ProgrammeItem; sessionId: string } | null>(null);
  const [isNewTalkModalOpen, setIsNewTalkModalOpen] = useState<{ sessionId: string; sessionTitle: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'session' | 'talk';
    id: string;
    title: string;
  } | null>(null);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const toggleSessionExpand = (id: string) => {
    setExpandedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSessionIds(new Set(sessions.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedSessionIds(new Set());
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedDay !== 'all' && s.date !== selectedDay) return false;
      if (selectedHall !== 'All' && !s.venue.includes(selectedHall) && !selectedHall.includes(s.venue)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = s.title.toLowerCase().includes(q);
        const inIncharge = s.sessionInCharge?.some((c) => c.toLowerCase().includes(q));
        const inTalks = s.items.some(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.speakers?.some((sp) => sp.toLowerCase().includes(q)) ||
            i.chairpersons?.some((c) => c.toLowerCase().includes(q))
        );
        if (!inTitle && !inIncharge && !inTalks) return false;
      }
      return true;
    });
  }, [sessions, selectedDay, selectedHall, searchQuery]);

  // All talks flat list for Quick Talk Finder
  const allTalks = useMemo(() => {
    const list: { item: ProgrammeItem; session: Session }[] = [];
    sessions.forEach((s) => {
      s.items.forEach((item) => {
        list.push({ item, session: s });
      });
    });
    return list;
  }, [sessions]);

  // Filtered talks for Quick Talk Finder
  const filteredTalks = useMemo(() => {
    return allTalks.filter(({ item, session }) => {
      if (selectedDay !== 'all' && session.date !== selectedDay) return false;
      if (selectedHall !== 'All' && !session.venue.includes(selectedHall) && !selectedHall.includes(session.venue)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSession = item.sessionTitle.toLowerCase().includes(q);
        const inSpeakers = item.speakers?.some((sp) => sp.toLowerCase().includes(q));
        const inChairs = item.chairpersons?.some((c) => c.toLowerCase().includes(q));
        const inPanelists = item.panelists?.some((p) => p.toLowerCase().includes(q));
        const inModerator = item.moderator?.toLowerCase().includes(q);
        if (!inTitle && !inSession && !inSpeakers && !inChairs && !inPanelists && !inModerator) return false;
      }
      return true;
    });
  }, [allTalks, selectedDay, selectedHall, searchQuery]);

  const totalTalks = sessions.reduce((acc, s) => acc + s.items.length, 0);
  const totalSpeakers = getSpeakers().length;

  // Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const ok = await login(loginUsername, loginPassword);
    if (ok) {
      showNotification('Logged in successfully to ISOT 2026 Admin!');
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `isot2026-programme-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Programme exported as JSON successfully!');
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProgrammeJson(content);
      if (success) {
        showNotification('Programme imported and synced successfully!');
      } else {
        showNotification('Invalid JSON format for programme data.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Talk Type Badge Helper
  const getTalkTypeBadge = (type: string) => {
    switch (type) {
      case 'panel':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300';
      case 'oration':
      case 'keynote':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-black';
      case 'symposium':
      case 'plenary':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold';
      case 'ceremony':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300';
      case 'break':
      case 'lunch':
        return 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300';
    }
  };

  // ==========================================
  // 1. NON-AUTHENTICATED: LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="py-6 sm:py-12 max-w-md mx-auto px-3 sm:px-4">
        {/* Toast Notification */}
        {statusMessage && (
          <div
            className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border text-sm font-bold animate-in slide-in-from-top-4 duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-zinc-800 shadow-xl space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-isot-burgundy to-isot-deep-burgundy mx-auto flex items-center justify-center text-white shadow-lg shadow-isot-burgundy/25">
              <Lock size={28} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-xs mt-2">
              <ShieldCheck size={13} />
              <span>ISOT 2026 Admin Portal</span>
            </div>

            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Sign In to Edit Programme
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Authorized scientific committee members can update topics, dates, halls, timings & faculty.
            </p>
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 font-medium">
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => {
                    setLoginUsername(e.target.value);
                    if (authError) clearError();
                  }}
                  placeholder="admin or secretariat@isot2026.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-2xl text-sm font-medium border border-gray-200 dark:border-zinc-700 focus:border-isot-burgundy dark:focus:border-rose-400 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (authError) clearError();
                  }}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-2xl text-sm font-medium border border-gray-200 dark:border-zinc-700 focus:border-isot-burgundy dark:focus:border-rose-400 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-isot-burgundy to-isot-deep-burgundy hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-isot-burgundy/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isAuthLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In to Admin CMS</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200/60 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
              <Sparkles size={14} className="text-amber-500" />
              <span>Tap to Quick-Fill:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setLoginUsername('admin');
                  setLoginPassword('admin123');
                  clearError();
                }}
                className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:border-isot-burgundy text-left transition-all active:scale-95"
              >
                <div className="font-bold text-gray-900 dark:text-white">Super Admin</div>
                <div className="text-gray-500 text-[10px]">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginUsername('secretariat');
                  setLoginPassword('isot2026');
                  clearError();
                }}
                className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:border-isot-burgundy text-left transition-all active:scale-95"
              >
                <div className="font-bold text-gray-900 dark:text-white">Secretariat</div>
                <div className="text-gray-500 text-[10px]">secretariat / isot2026</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. AUTHENTICATED: REDESIGNED ADMIN CMS
  // ==========================================
  return (
    <div className="space-y-4 sm:space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border text-sm font-bold animate-in slide-in-from-top-4 duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Header Card: User Info & Live Server Sync */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-isot-burgundy to-isot-deep-burgundy text-white flex items-center justify-center font-black shadow-md shadow-isot-burgundy/20 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-gray-900 dark:text-white truncate">
                {user?.name || user?.username}
              </span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 shrink-0">
                {user?.role || 'Admin'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isSyncing ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Syncing with server...</span>
                </span>
              ) : syncError ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold truncate">
                  ⚠️ {syncError}
                </span>
              ) : lastSynced ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ● Server in sync ({new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              ) : (
                <span className="text-gray-400">● Local changes ready</span>
              )}
            </div>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-center justify-between sm:justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={async () => {
              const ok = await syncWithBackend();
              if (ok) showNotification('Pushed and synced with server!');
              else showNotification('Server sync failed. Check backend.', 'error');
            }}
            disabled={isSyncing}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewSessionModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white font-black text-xs shadow-md shadow-isot-burgundy/25 transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>New Session</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              showNotification('Logged out from admin CMS.');
            }}
            className="inline-flex items-center justify-center p-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold transition-all"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Primary Mobile Navigation Segmented Tabs */}
      <div className="bg-gray-200/80 dark:bg-zinc-800 p-1 rounded-2xl grid grid-cols-3 gap-1 shadow-inner text-xs font-black">
        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'sessions'
              ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Layers size={15} />
          <span className="truncate">Sessions ({filteredSessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('talks')}
          className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'talks'
              ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Mic size={15} />
          <span className="truncate">Talks ({filteredTalks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'tools'
              ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Sliders size={15} />
          <span className="truncate">Tools & Backup</span>
        </button>
      </div>

      {/* Interactive Search & Filter Toolbar (for Sessions & Talks views) */}
      {activeTab !== 'tools' && (
        <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'sessions'
                  ? 'Search sessions, topics, in-charges, or speakers...'
                  : 'Search talk title, speaker, chairperson, or hall...'
              }
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-2xl text-xs sm:text-sm font-medium border border-transparent focus:border-isot-burgundy outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Swipeable Filter Chips */}
          <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-zinc-800">
            {/* Days Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 px-1 shrink-0">
                Day:
              </span>
              <button
                type="button"
                onClick={() => setSelectedDay('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedDay === 'all'
                    ? 'bg-isot-burgundy text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                All Days
              </button>
              {CONFERENCE_DAYS.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDay(d.date)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedDay === d.date
                      ? 'bg-isot-burgundy text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {d.dayName} ({d.dayFormatted})
                </button>
              ))}
            </div>

            {/* Halls Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 px-1 shrink-0">
                Hall:
              </span>
              <button
                type="button"
                onClick={() => setSelectedHall('All')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                  selectedHall === 'All'
                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                All Halls
              </button>
              {HALLS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedHall(h.name)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold shrink-0 transition-all ${
                    selectedHall === h.name
                      ? 'bg-isot-burgundy text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: SESSIONS MANAGEMENT VIEW */}
      {/* ============================================================ */}
      {activeTab === 'sessions' && (
        <div className="space-y-3.5">
          {/* Controls bar */}
          <div className="flex items-center justify-between px-1 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Showing <strong>{filteredSessions.length}</strong> session{filteredSessions.length === 1 ? '' : 's'}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={expandAll}
                className="text-isot-burgundy dark:text-rose-400 font-bold hover:underline"
              >
                Expand All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-isot-burgundy dark:text-rose-400 font-bold hover:underline"
              >
                Collapse
              </button>
            </div>
          </div>

          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              const isExpanded = expandedSessionIds.has(session.id);

              return (
                <div
                  key={session.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-all"
                >
                  {/* Session Header Card */}
                  <div className="p-4 sm:p-5 flex flex-col gap-3 bg-gray-50/60 dark:bg-zinc-800/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Chips row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-isot-burgundy/10 text-isot-burgundy dark:bg-rose-950/60 dark:text-rose-300 font-black text-[11px]">
                            {session.dayName} • {session.dayDisplay || session.date}
                          </span>

                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700">
                            <Clock size={11} className="text-isot-burgundy dark:text-rose-400" />
                            <span>{session.startTime} – {session.endTime}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700">
                            <MapPin size={11} className="text-amber-500" />
                            <span>{session.venue}</span>
                          </span>

                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300">
                            {session.items.length} talk{session.items.length === 1 ? '' : 's'}
                          </span>
                        </div>

                        {/* Session Title */}
                        <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-snug">
                          {session.title}
                        </h3>

                        {/* Session In-charges */}
                        {session.sessionInCharge && session.sessionInCharge.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 flex-wrap">
                            <span className="font-bold text-gray-700 dark:text-gray-300">Session In-Charge:</span>
                            {session.sessionInCharge.map((name, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold text-[11px]"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-200/60 dark:border-zinc-800 gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSession(session)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-gray-100 text-gray-800 dark:text-gray-200 text-xs font-bold border border-gray-200 dark:border-zinc-700 transition-all active:scale-95"
                        >
                          <Edit2 size={13} className="text-isot-burgundy" />
                          <span>Edit Session</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setIsNewTalkModalOpen({
                              sessionId: session.id,
                              sessionTitle: session.title,
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                        >
                          <Plus size={13} />
                          <span>Add Talk</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirm({
                              type: 'session',
                              id: session.id,
                              title: session.title,
                            });
                          }}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Session"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSessionExpand(session.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Talks' : `View ${session.items.length} Talks`}</span>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Talks List */}
                  {isExpanded && (
                    <div className="p-3 sm:p-5 space-y-2.5 border-t border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      {session.items.length === 0 ? (
                        <div className="py-6 text-center text-xs text-gray-400">
                          No presentations in this session yet. Tap "Add Talk" above to add one.
                        </div>
                      ) : (
                        session.items.map((item, idx) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200/60 dark:border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-isot-burgundy/40 transition-all"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] font-black text-isot-burgundy dark:text-rose-400">
                                  #{idx + 1} • {item.startTime} {item.endTime ? `– ${item.endTime}` : ''}
                                </span>

                                <span
                                  className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${getTalkTypeBadge(
                                    item.type
                                  )}`}
                                >
                                  {item.type}
                                </span>
                              </div>

                              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                                {item.title}
                              </h4>

                              {/* Faculty Tags */}
                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                {item.speakers && item.speakers.length > 0 && (
                                  <span className="text-gray-600 dark:text-gray-300">
                                    <strong>Speaker:</strong> {item.speakers.join(', ')}
                                  </span>
                                )}
                                {item.chairpersons && item.chairpersons.length > 0 && (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    • <strong>Chair:</strong> {item.chairpersons.join(', ')}
                                  </span>
                                )}
                                {item.moderator && (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    • <strong>Mod:</strong> {item.moderator}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingTalk({
                                    talk: item,
                                    sessionId: session.id,
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 border border-gray-200 dark:border-zinc-600 shadow-sm active:scale-95"
                              >
                                <Edit2 size={13} className="text-isot-burgundy" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirm({
                                    type: 'talk',
                                    id: item.id,
                                    title: item.title,
                                  });
                                }}
                                className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Delete Talk"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-zinc-800">
              <Layers size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No sessions match your search</h3>
              <p className="text-xs text-gray-500 mt-1">Try clearing your filters or add a new session.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: QUICK TALK FINDER VIEW */}
      {/* ============================================================ */}
      {activeTab === 'talks' && (
        <div className="space-y-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
            Found <strong>{filteredTalks.length}</strong> talk{filteredTalks.length === 1 ? '' : 's'}. Tap <strong>Edit</strong> on any talk to adjust its topic, time, or speakers instantly.
          </div>

          {filteredTalks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTalks.map(({ item, session }) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between gap-3 hover:border-isot-burgundy/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-black text-isot-burgundy dark:text-rose-400">
                          {item.startTime} {item.endTime ? `– ${item.endTime}` : ''}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                          {session.dayName} • {session.venue}
                        </span>
                      </div>

                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${getTalkTypeBadge(item.type)}`}>
                        {item.type}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                      {item.title}
                    </h4>

                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      Session: <strong className="text-gray-700 dark:text-gray-300">{session.title}</strong>
                    </div>

                    {/* Faculty Chips */}
                    {item.speakers && item.speakers.length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        <strong>Speaker(s):</strong> {item.speakers.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingTalk({
                          talk: item,
                          sessionId: session.id,
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-isot-burgundy text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Edit2 size={13} />
                      <span>Edit Talk</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirm({
                          type: 'talk',
                          id: item.id,
                          title: item.title,
                        });
                      }}
                      className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-zinc-800">
              <Mic size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No talks found</h3>
              <p className="text-xs text-gray-500 mt-1">Try another keyword or filter criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: TOOLS & BACKUP VIEW */}
      {/* ============================================================ */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Sessions</span>
              <p className="text-2xl font-black text-isot-burgundy dark:text-rose-400">{sessions.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Talks</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{totalTalks}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Faculty</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{totalSpeakers}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400">Halls</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">8 Halls</p>
            </div>
          </div>

          {/* Backup & Data Sync Tools */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Programme Backup & Data Tools
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Export JSON backups, import updated schedule files, or reset back to the official brochure data.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Seed Cloudflare D1 Database */}
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Seed all 19 official conference sessions and 100+ talks into your Cloudflare D1 Database?')) {
                    try {
                      const res = await fetch('/api/seed');
                      const data = await res.json();
                      if (data.success) {
                        showNotification('Successfully seeded data to Cloudflare D1 Database (isot2026)!');
                      } else {
                        // If /api/seed is on cloud or local, try syncing active programme
                        const ok = await syncWithBackend();
                        if (ok) showNotification('Data pushed to database successfully!');
                        else showNotification(data.error || 'Seed failed', 'error');
                      }
                    } catch {
                      const ok = await syncWithBackend();
                      if (ok) showNotification('Data written to Cloudflare Database successfully!');
                      else showNotification('Could not connect to database endpoint', 'error');
                    }
                  }
                }}
                className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 flex flex-col items-center text-center gap-2 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Seed Cloudflare D1</div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Write 19 sessions to D1 DB</div>
                </div>
              </button>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportJson}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-isot-burgundy flex flex-col items-center text-center gap-2 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-isot-burgundy/10 text-isot-burgundy dark:bg-rose-950/60 dark:text-rose-300 flex items-center justify-center">
                  <Download size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">Export JSON</div>
                  <div className="text-[11px] text-gray-500">Download current schedule file</div>
                </div>
              </button>

              {/* Import Button */}
              <label className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-isot-burgundy flex flex-col items-center text-center gap-2 cursor-pointer transition-all active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Upload size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">Import JSON</div>
                  <div className="text-[11px] text-gray-500">Restore or upload new programme</div>
                </div>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>

              {/* Reset Button */}
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Reset all changes back to official ISOT 2026 default programme data?')) {
                    await resetToDefaultProgramme();
                    showNotification('Programme reset to default data!');
                  }
                }}
                className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 hover:border-amber-500 flex flex-col items-center text-center gap-2 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-300">Reset to Default</div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">Restore official baseline</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: EDIT SESSION MODAL (MOBILE BOTTOM-SHEET / MODAL) */}
      {/* ============================================================ */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto border-t sm:border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-200">
            {/* Drag Bar Indicator for mobile */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                Edit Session Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSession(editingSession.id, editingSession);
                setEditingSession(null);
                showNotification('Session updated successfully!');
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Session Title / Topic
                </label>
                <input
                  type="text"
                  required
                  value={editingSession.title}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, title: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm font-semibold outline-none focus:border-isot-burgundy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Conference Date
                  </label>
                  <select
                    value={editingSession.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const dayObj = CONFERENCE_DAYS.find((d) => d.date === newDate);
                      setEditingSession({
                        ...editingSession,
                        date: newDate,
                        dayName: dayObj ? dayObj.dayName : editingSession.dayName,
                        dayDisplay: dayObj ? dayObj.dayFormatted : editingSession.dayDisplay,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  >
                    {CONFERENCE_DAYS.map((d) => (
                      <option key={d.date} value={d.date}>
                        {d.dayName} ({d.dayFormatted})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Hall / Screen
                  </label>
                  <select
                    value={editingSession.venue}
                    onChange={(e) =>
                      setEditingSession({ ...editingSession, venue: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  >
                    {HALLS.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Start Time (HH:mm)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSession.startTime}
                    onChange={(e) =>
                      setEditingSession({ ...editingSession, startTime: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    End Time (HH:mm)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSession.endTime}
                    onChange={(e) =>
                      setEditingSession({ ...editingSession, endTime: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Session In-charge(s) (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingSession.sessionInCharge?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingSession({
                      ...editingSession,
                      sessionInCharge: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. Vivek Kute, Sanjay Kolte"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-isot-burgundy text-white font-bold text-xs shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: ADD NEW SESSION MODAL */}
      {/* ============================================================ */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto border-t sm:border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-200">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                Create New Session
              </h3>
              <button
                type="button"
                onClick={() => setIsNewSessionModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                const date = (form.elements.namedItem('date') as HTMLSelectElement).value;
                const venue = (form.elements.namedItem('venue') as HTMLSelectElement).value;
                const startTime = (form.elements.namedItem('startTime') as HTMLInputElement).value;
                const endTime = (form.elements.namedItem('endTime') as HTMLInputElement).value;
                const incharge = (form.elements.namedItem('incharge') as HTMLInputElement).value;

                const dayObj = CONFERENCE_DAYS.find((d) => d.date === date) || CONFERENCE_DAYS[0];
                const newId = `custom-session-${Date.now()}`;

                const newSession: Session = {
                  id: newId,
                  index: sessions.length + 1,
                  date,
                  dayName: dayObj.dayName,
                  dayDisplay: dayObj.dayFormatted,
                  title,
                  startTime,
                  endTime,
                  venue,
                  sessionInCharge: incharge ? incharge.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
                  items: [],
                };

                addSession(newSession);
                setIsNewSessionModalOpen(false);
                showNotification('New session created successfully!');
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Session Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Clinical Nephrology & Transplant Symposia"
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm font-semibold outline-none focus:border-isot-burgundy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Conference Date
                  </label>
                  <select
                    name="date"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  >
                    {CONFERENCE_DAYS.map((d) => (
                      <option key={d.date} value={d.date}>
                        {d.dayName} ({d.dayFormatted})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Hall / Screen
                  </label>
                  <select
                    name="venue"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  >
                    {HALLS.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Start Time (HH:mm)
                  </label>
                  <input
                    name="startTime"
                    type="text"
                    required
                    defaultValue="09:00"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    End Time (HH:mm)
                  </label>
                  <input
                    name="endTime"
                    type="text"
                    required
                    defaultValue="18:00"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Session In-charge(s) (comma-separated)
                </label>
                <input
                  name="incharge"
                  type="text"
                  placeholder="e.g. Vivek Kute, Sanjay Kolte"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewSessionModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-isot-burgundy text-white font-bold text-xs shadow-md"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: EDIT / ADD TALK MODAL */}
      {/* ============================================================ */}
      {(editingTalk || isNewTalkModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto border-t sm:border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-200">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                {editingTalk ? 'Edit Talk / Topic' : 'Add New Talk'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingTalk(null);
                  setIsNewTalkModalOpen(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const title = (form.elements.namedItem('talkTitle') as HTMLInputElement).value;
                const startTime = (form.elements.namedItem('talkStartTime') as HTMLInputElement).value;
                const endTime = (form.elements.namedItem('talkEndTime') as HTMLInputElement).value;
                const type = (form.elements.namedItem('talkType') as HTMLSelectElement).value as ProgrammeItemType;
                const speakers = (form.elements.namedItem('talkSpeakers') as HTMLInputElement).value;
                const chairpersons = (form.elements.namedItem('talkChairpersons') as HTMLInputElement).value;
                const panelists = (form.elements.namedItem('talkPanelists') as HTMLInputElement).value;
                const moderator = (form.elements.namedItem('talkModerator') as HTMLInputElement).value;

                if (editingTalk) {
                  updateTalk(editingTalk.talk.id, {
                    title,
                    startTime,
                    endTime,
                    type,
                    speakers: speakers ? speakers.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
                    chairpersons: chairpersons ? chairpersons.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
                    panelists: panelists ? panelists.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
                    moderator: moderator.trim() || undefined,
                  });
                  setEditingTalk(null);
                  showNotification('Talk updated successfully!');
                } else if (isNewTalkModalOpen) {
                  const targetSession = sessions.find((s) => s.id === isNewTalkModalOpen.sessionId);
                  if (targetSession) {
                    const newTalkItem: ProgrammeItem = {
                      id: `custom-talk-${Date.now()}`,
                      sessionId: targetSession.id,
                      sessionTitle: targetSession.title,
                      date: targetSession.date,
                      dayName: targetSession.dayName,
                      startTime,
                      endTime,
                      title,
                      type,
                      venue: targetSession.venue,
                      speakers: speakers ? speakers.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
                      chairpersons: chairpersons ? chairpersons.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
                      panelists: panelists ? panelists.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
                      moderator: moderator.trim() || undefined,
                    };
                    addTalk(targetSession.id, newTalkItem);
                    setIsNewTalkModalOpen(null);
                    showNotification('New talk added to session!');
                  }
                }
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Presentation Topic / Talk Title
                </label>
                <textarea
                  name="talkTitle"
                  required
                  rows={2}
                  defaultValue={editingTalk?.talk.title || ''}
                  placeholder="e.g. Immunological Monitoring in Living Donor Kidney Transplantation"
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold outline-none focus:border-isot-burgundy"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Start (HH:mm)
                  </label>
                  <input
                    name="talkStartTime"
                    type="text"
                    required
                    defaultValue={editingTalk?.talk.startTime || '09:00'}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    End (HH:mm)
                  </label>
                  <input
                    name="talkEndTime"
                    type="text"
                    defaultValue={editingTalk?.talk.endTime || '09:20'}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Type
                  </label>
                  <select
                    name="talkType"
                    defaultValue={editingTalk?.talk.type || 'talk'}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  >
                    <option value="talk">Talk</option>
                    <option value="panel">Panel</option>
                    <option value="oration">Oration</option>
                    <option value="workshop">Workshop</option>
                    <option value="ceremony">Ceremony</option>
                    <option value="lunch">Lunch</option>
                    <option value="break">Tea Break</option>
                    <option value="gbm">GBM</option>
                    <option value="registration">Registration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Speaker(s) (comma-separated)
                </label>
                <input
                  name="talkSpeakers"
                  type="text"
                  defaultValue={editingTalk?.talk.speakers?.join(', ') || ''}
                  placeholder="e.g. Manish Rathi, Vivek Kute"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Chairperson(s) (comma-separated)
                </label>
                <input
                  name="talkChairpersons"
                  type="text"
                  defaultValue={editingTalk?.talk.chairpersons?.join(', ') || ''}
                  placeholder="e.g. S Krishnan, Sindhu Kaza"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Panelists (comma-separated)
                  </label>
                  <input
                    name="talkPanelists"
                    type="text"
                    defaultValue={editingTalk?.talk.panelists?.join(', ') || ''}
                    placeholder="e.g. Umapati Hegde"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Moderator
                  </label>
                  <input
                    name="talkModerator"
                    type="text"
                    defaultValue={editingTalk?.talk.moderator || ''}
                    placeholder="e.g. P. P. Verma"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTalk(null);
                    setIsNewTalkModalOpen(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-isot-burgundy text-white font-bold text-xs shadow-md"
                >
                  {editingTalk ? 'Save Talk' : 'Add Talk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: DELETE CONFIRMATION DIALOG */}
      {/* ============================================================ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Delete {deleteConfirm.type === 'session' ? 'Session' : 'Talk'}?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Are you sure you want to delete "{deleteConfirm.title}"? This change will sync to the server.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === 'session') {
                    deleteSession(deleteConfirm.id);
                    showNotification('Session deleted.');
                  } else {
                    deleteTalk(deleteConfirm.id);
                    showNotification('Talk deleted.');
                  }
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
