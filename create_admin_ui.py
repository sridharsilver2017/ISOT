import os

admin_code = r'''import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProgrammeStore, slugify } from '../store/programmeStore';
import { useAuthStore } from '../store/authStore';
import { useScheduleStore } from '../store/scheduleStore';
import { ProgrammeSession, ProgrammeItem, SessionSection, getSessionItems, ItemType } from '../types/programme';
import { exportProgrammeToCsv, parseCsvToProgramme, getBlankCsvTemplate } from '../utils/csvHelper';
import { SpeakerAvatar } from '../components/SpeakerAvatar';
import { getSpeakerPhoto } from '../utils/speakerImages';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Mic,
  Users,
  Sliders,
  Camera,
  Image as ImageIcon,
  Check,
  Link as LinkIcon,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Clock,
  MapPin,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  X,
  ChevronRight,
  ChevronDown,
  Eye,
  LogOut,
  Sparkles,
  ShieldCheck,
  Moon,
  Sun,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  Settings,
  Grid,
  List,
  UserCheck,
  UserX,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { user, login, logout, isAuthenticated, isChecking } = useAuthStore();
  const { darkMode, toggleDarkMode } = useScheduleStore();
  const {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    addItemToSession,
    updateItemInSession,
    deleteItemFromSession,
    resetToDefaultProgramme,
    importProgrammeJson,
    getSpeakers,
    speakerPhotos,
    uploadSpeakerPhoto,
    deleteSpeakerPhoto,
    isSyncing,
    syncError,
    lastSyncTime,
    fetchProgrammeFromServer,
    fetchSpeakerPhotos,
  } = useProgrammeStore();

  // Authentication states
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active View Tab: 'dashboard' | 'sessions' | 'talks' | 'faculty' | 'sync'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sessions' | 'talks' | 'faculty' | 'sync'>('dashboard');

  // Filter & Search states
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedHall, setSelectedHall] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [facultyRoleFilter, setFacultyRoleFilter] = useState<string>('all');
  const [facultyPhotoFilter, setFacultyPhotoFilter] = useState<'all' | 'has_photo' | 'missing_photo'>('all');
  const [talkTypeFilter, setTalkTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals & Drawers
  const [editingSession, setEditingSession] = useState<ProgrammeSession | null>(null);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ sessionId: string; sectionId: string; item: ProgrammeItem } | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [targetSessionForNewItem, setTargetSessionForNewItem] = useState<{ sessionId: string; sectionId: string } | null>(null);

  // Photo Uploader state
  const [editingPhotoSpeaker, setEditingPhotoSpeaker] = useState<{ id: string; name: string } | null>(null);
  const [photoUploadMethod, setPhotoUploadMethod] = useState<'file' | 'url'>('file');
  const [directPhotoUrl, setDirectPhotoUrl] = useState('');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  // Google Sheets states
  const [isGoogleSheetsGuideOpen, setIsGoogleSheetsGuideOpen] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Show auto-dismiss notification toast
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    fetchProgrammeFromServer();
    fetchSpeakerPhotos();
  }, [fetchProgrammeFromServer, fetchSpeakerPhotos]);

  // Derived Data
  const days = useMemo(() => {
    const uniqueDays = Array.from(new Set(sessions.map((s) => s.date))).sort();
    return uniqueDays.map((d) => {
      const match = sessions.find((s) => s.date === d);
      return {
        date: d,
        dayName: match?.dayName || 'Day',
        dayDisplay: match?.dayDisplay || d,
      };
    });
  }, [sessions]);

  const halls = useMemo(() => {
    return Array.from(new Set(sessions.map((s) => s.venue))).filter(Boolean).sort();
  }, [sessions]);

  const allTalks = useMemo(() => {
    const list: { session: ProgrammeSession; section: SessionSection; item: ProgrammeItem }[] = [];
    sessions.forEach((s) => {
      (s.sections || []).forEach((sec) => {
        (sec.items || []).forEach((it) => {
          list.push({ session: s, section: sec, item: it });
        });
      });
    });
    return list;
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedDay !== 'all' && s.date !== selectedDay) return false;
      if (selectedHall !== 'all' && s.venue !== selectedHall) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = s.title.toLowerCase().includes(q);
        const inTrack = s.track?.toLowerCase().includes(q);
        const inIncharge = s.sessionInCharge?.some((p) => p.toLowerCase().includes(q));
        const inItems = getSessionItems(s).some(
          (it) =>
            it.title.toLowerCase().includes(q) ||
            it.speakers?.some((sp) => sp.toLowerCase().includes(q)) ||
            it.chairpersons?.some((c) => c.toLowerCase().includes(q))
        );
        if (!inTitle && !inTrack && !inIncharge && !inItems) return false;
      }
      return true;
    });
  }, [sessions, selectedDay, selectedHall, searchQuery]);

  const filteredTalks = useMemo(() => {
    return allTalks.filter(({ session, item }) => {
      if (selectedDay !== 'all' && session.date !== selectedDay) return false;
      if (selectedHall !== 'all' && session.venue !== selectedHall) return false;
      if (talkTypeFilter !== 'all' && item.type !== talkTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSession = session.title.toLowerCase().includes(q);
        const inSpeakers = item.speakers?.some((sp) => sp.toLowerCase().includes(q));
        const inChairs = item.chairpersons?.some((c) => c.toLowerCase().includes(q));
        const inPanelists = item.panelists?.some((p) => p.toLowerCase().includes(q));
        const inModerator = item.moderator?.toLowerCase().includes(q);
        if (!inTitle && !inSession && !inSpeakers && !inChairs && !inPanelists && !inModerator) return false;
      }
      return true;
    });
  }, [allTalks, selectedDay, selectedHall, talkTypeFilter, searchQuery]);

  const allFaculty = useMemo(() => {
    return getSpeakers();
  }, [sessions, getSpeakers]);

  const filteredFaculty = useMemo(() => {
    return allFaculty.filter((sp) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!sp.name.toLowerCase().includes(q)) return false;
      }
      if (facultyRoleFilter !== 'all') {
        if (!sp.roles.some((r) => r.role === facultyRoleFilter)) return false;
      }
      const hasPhoto = !!getSpeakerPhoto(sp.name, speakerPhotos);
      if (facultyPhotoFilter === 'has_photo' && !hasPhoto) return false;
      if (facultyPhotoFilter === 'missing_photo' && hasPhoto) return false;
      return true;
    });
  }, [allFaculty, searchQuery, facultyRoleFilter, facultyPhotoFilter, speakerPhotos]);

  const facultyWithPhotosCount = useMemo(() => {
    return allFaculty.filter((sp) => !!getSpeakerPhoto(sp.name, speakerPhotos)).length;
  }, [allFaculty, speakerPhotos]);

  // Auth Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const ok = await login(loginUsername, loginPassword);
      if (ok) {
        showNotification('Welcome back! Authenticated to ISOT 2026 Admin.');
      } else {
        setLoginError('Invalid username or password. Use admin / admin123');
      }
    } catch {
      setLoginError('Login failed. Check server connection.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Image resize and compress
  const compressAndResizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          canvas.width = 500;
          canvas.height = 500;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;
            ctx.drawImage(img, startX, startY, size, size, 0, 0, 500, 500);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const resizedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.png'), {
                    type: 'image/png',
                  });
                  resolve(resizedFile);
                } else {
                  resolve(file);
                }
              },
              'image/png',
              0.9
            );
          } else {
            resolve(file);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressAndResizeImage(file);
      setSelectedPhotoFile(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch {
      setSelectedPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveSpeakerPhoto = async () => {
    if (!editingPhotoSpeaker) return;
    setIsPhotoUploading(true);
    try {
      if (photoUploadMethod === 'file') {
        if (!selectedPhotoFile) {
          showNotification('Please choose an image file first.', 'error');
          setIsPhotoUploading(false);
          return;
        }
        const res = await uploadSpeakerPhoto(editingPhotoSpeaker.id, selectedPhotoFile);
        if (res) {
          showNotification(`Photo uploaded to Cloudflare R2 for ${editingPhotoSpeaker.name}!`);
          setEditingPhotoSpeaker(null);
          setSelectedPhotoFile(null);
          setPhotoPreview(null);
        } else {
          showNotification('Failed to upload photo to server.', 'error');
        }
      } else {
        if (!directPhotoUrl.trim()) {
          showNotification('Please enter a valid image URL.', 'error');
          setIsPhotoUploading(false);
          return;
        }
        const res = await uploadSpeakerPhoto(editingPhotoSpeaker.id, directPhotoUrl.trim());
        if (res) {
          showNotification(`Photo URL updated for ${editingPhotoSpeaker.name}!`);
          setEditingPhotoSpeaker(null);
          setDirectPhotoUrl('');
          setPhotoPreview(null);
        } else {
          showNotification('Failed to update photo URL.', 'error');
        }
      }
    } catch (err: any) {
      showNotification(err?.message || 'Error updating photo', 'error');
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const handleRemoveSpeakerPhoto = async (speaker: { id: string; name: string }) => {
    if (window.confirm(`Remove custom photo for ${speaker.name}?`)) {
      const ok = await deleteSpeakerPhoto(speaker.id);
      if (ok) {
        showNotification(`Removed photo for ${speaker.name}.`);
      } else {
        showNotification('Failed to remove photo.', 'error');
      }
    }
  };

  // CSV Export & Import Handlers
  const handleDownloadCsvTemplate = () => {
    const csvContent = getBlankCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'isot2026-google-sheet-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Downloaded Google Sheets CSV template!');
  };

  const handleExportCsv = () => {
    const csvContent = exportProgrammeToCsv(sessions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `isot2026-programme-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Exported live programme to Google Sheets CSV!');
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCsv(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          showNotification('CSV file is empty.', 'error');
          setIsUploadingCsv(false);
          return;
        }

        const parsedSessions = parseCsvToProgramme(text);
        if (parsedSessions.length === 0) {
          showNotification('Could not find any valid sessions in the uploaded CSV.', 'error');
          setIsUploadingCsv(false);
          return;
        }

        const ok = await importProgrammeJson(parsedSessions);
        if (ok) {
          showNotification(`Imported & Synced ${parsedSessions.length} sessions to Cloudflare D1!`);
        } else {
          showNotification('Failed to sync imported CSV to server database.', 'error');
        }
      } catch (err: any) {
        showNotification(err?.message || 'Error parsing CSV file', 'error');
      } finally {
        setIsUploadingCsv(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // 1. UNAUTHENTICATED: LOGIN SCREEN
  if (!isAuthenticated && !isChecking) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-zinc-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-isot-burgundy to-isot-deep-burgundy flex items-center justify-center shadow-lg shadow-isot-burgundy/30 text-white">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              ISOT 2026 Admin Portal
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Master Content Management & Cloudflare CMS Studio
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-sm font-medium outline-none focus:border-isot-burgundy dark:focus:border-rose-400 transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-sm font-medium outline-none focus:border-isot-burgundy dark:focus:border-rose-400 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white font-extrabold text-sm shadow-lg shadow-isot-burgundy/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Sign In to Admin Studio</span>
                </>
              )}
            </button>
          </form>

          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/60 dark:border-zinc-700/60 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Demo Credentials</span>
            <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">admin / admin123</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED: REDESIGNED MASTER ADMIN CMS STUDIO
  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-bold ${
              notification.type === 'error'
                ? 'bg-rose-500 text-white border-rose-600'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Header & Connection Indicators Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-isot-burgundy to-isot-deep-burgundy flex items-center justify-center shadow-md shadow-isot-burgundy/25 text-white font-black text-sm">
            ISOT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                Admin Studio CMS
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-isot-burgundy/10 dark:bg-rose-950/50 text-isot-burgundy dark:text-rose-300 border border-isot-burgundy/20">
                v23.1
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cloudflare D1 Database & R2 Storage Hub
            </p>
          </div>
        </div>

        {/* Backend Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Cloudflare D1 Pulse */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>D1 Live Sync</span>
          </div>

          {/* Cloudflare R2 Pulse */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Cloud size={13} />
            <span>R2: isot-2026</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-isot-burgundy transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              logout();
              showNotification('Logged out from Admin CMS.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/50 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Segmented Tabs */}
      <div className="bg-gray-200/80 dark:bg-zinc-800/80 p-1.5 rounded-2xl grid grid-cols-2 sm:grid-cols-5 gap-1 shadow-inner text-xs font-black">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'dashboard'
              ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'sessions'
              ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Layers size={15} />
          <span>Sessions ({filteredSessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('talks')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'talks'
              ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Mic size={15} />
          <span>Talks ({filteredTalks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faculty')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'faculty'
              ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Camera size={15} />
          <span>Faculty & R2 ({allFaculty.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sync')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all col-span-2 sm:col-span-1 ${
            activeTab === 'sync'
              ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet size={15} />
          <span>Sheets & Sync</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* VIEW 1: DASHBOARD COMMAND CENTER */}
      {/* ============================================================ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Total Sessions</span>
                <Layers size={18} className="text-isot-burgundy dark:text-rose-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{sessions.length}</p>
              <span className="text-[11px] text-gray-500 font-medium block">Across 3 Days & 5 Halls</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Programme Items</span>
                <Mic size={18} className="text-blue-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{allTalks.length}</p>
              <span className="text-[11px] text-gray-500 font-medium block">Talks, Panels & Debates</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Faculty & Speakers</span>
                <Users size={18} className="text-purple-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{allFaculty.length}</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                {facultyWithPhotosCount} photos in R2 ({Math.round((facultyWithPhotosCount / allFaculty.length) * 100)}%)
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Cloudflare D1 Status</span>
                <Database size={18} className="text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">Live</p>
              <span className="text-[11px] text-gray-500 font-medium block">Auto-seeded V23-1 dataset</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <span>Quick Action Studio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('sessions');
                  setIsNewSessionModalOpen(true);
                }}
                className="p-4 rounded-2xl bg-isot-burgundy/5 hover:bg-isot-burgundy hover:text-white border border-isot-burgundy/15 text-isot-burgundy dark:text-rose-300 dark:hover:text-white group transition-all text-left space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm">Create New Session</span>
                  <Plus size={16} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80">Add timing, hall & chairpersons</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('faculty')}
                className="p-4 rounded-2xl bg-blue-50/60 hover:bg-blue-600 hover:text-white border border-blue-200/60 dark:bg-blue-950/20 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 dark:hover:text-white group transition-all text-left space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm">Upload Faculty Photos</span>
                  <Camera size={16} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80">Upload portraits straight to Cloudflare R2</p>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-600 hover:text-white border border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 dark:hover:text-white group transition-all text-left space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm">Export Google Sheets CSV</span>
                  <Download size={16} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80">Download full live schedule spreadsheet</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar for Sessions, Talks, and Faculty */}
      {activeTab !== 'dashboard' && activeTab !== 'sync' && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions, topics, speakers, chairpersons, moderators..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-2xl text-xs sm:text-sm font-medium border border-gray-200 dark:border-zinc-700 outline-none focus:border-isot-burgundy dark:focus:border-rose-400 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            {/* Day Filter */}
            {(activeTab === 'sessions' || activeTab === 'talks') && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 uppercase text-[10px] tracking-wider">Day:</span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 text-xs font-semibold outline-none focus:border-isot-burgundy"
                >
                  <option value="all">All 3 Days</option>
                  {days.map((d) => (
                    <option key={d.date} value={d.date}>
                      {d.dayName} ({d.dayDisplay})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Hall Filter */}
            {(activeTab === 'sessions' || activeTab === 'talks') && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 uppercase text-[10px] tracking-wider">Hall:</span>
                <select
                  value={selectedHall}
                  onChange={(e) => setSelectedHall(e.target.value)}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 text-xs font-semibold outline-none focus:border-isot-burgundy"
                >
                  <option value="all">All Halls ({halls.length})</option>
                  {halls.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Faculty Role Filter */}
            {activeTab === 'faculty' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 uppercase text-[10px] tracking-wider">Role:</span>
                  <select
                    value={facultyRoleFilter}
                    onChange={(e) => setFacultyRoleFilter(e.target.value)}
                    className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  >
                    <option value="all">All Roles</option>
                    <option value="speaker">Speakers</option>
                    <option value="chairperson">Chairpersons</option>
                    <option value="panelist">Panelists</option>
                    <option value="moderator">Moderators</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 uppercase text-[10px] tracking-wider">Photo:</span>
                  <select
                    value={facultyPhotoFilter}
                    onChange={(e) => setFacultyPhotoFilter(e.target.value as any)}
                    className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 text-xs font-semibold outline-none focus:border-isot-burgundy"
                  >
                    <option value="all">All ({allFaculty.length})</option>
                    <option value="has_photo">Has Photo ({facultyWithPhotosCount})</option>
                    <option value="missing_photo">Needs Photo ({allFaculty.length - facultyWithPhotosCount})</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 2: SESSIONS PLANNER VIEW */}
      {/* ============================================================ */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {filteredSessions.length} session{filteredSessions.length === 1 ? '' : 's'}
            </p>
            <button
              type="button"
              onClick={() => setIsNewSessionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white text-xs font-extrabold shadow-md shadow-isot-burgundy/25 transition-all"
            >
              <Plus size={15} />
              <span>Add Session</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {filteredSessions.map((session) => {
              const sessionItems = getSessionItems(session);
              return (
                <div
                  key={session.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-isot-burgundy/10 dark:bg-rose-950/40 text-isot-burgundy dark:text-rose-300 font-extrabold text-xs">
                          {session.startTime} – {session.endTime}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs">
                          {session.venue}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs">
                          {session.dayName} ({session.dayDisplay})
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                        {session.title}
                      </h3>
                      {session.track && (
                        <p className="text-xs text-gray-500 font-medium">Track: {session.track}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingSession(session)}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:text-isot-burgundy hover:bg-isot-burgundy/10 transition-colors"
                        title="Edit session details"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete session "${session.title}"?`)) {
                            deleteSession(session.id);
                            showNotification('Deleted session successfully.');
                          }
                        }}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Program Items List inside Session */}
                  <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                      <span>{sessionItems.length} Programme Items</span>
                      <button
                        type="button"
                        onClick={() => {
                          const sec = session.sections?.[0];
                          if (sec) {
                            setTargetSessionForNewItem({ sessionId: session.id, sectionId: sec.id });
                            setIsNewItemModalOpen(true);
                          }
                        }}
                        className="text-isot-burgundy dark:text-rose-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>Add Item to Session</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {sessionItems.map((it) => (
                        <div
                          key={it.id}
                          className="p-3 rounded-2xl bg-gray-50/80 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 dark:text-white">{it.startTime}</span>
                              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300">
                                {it.type}
                              </span>
                            </div>
                            <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{it.title}</p>
                            {it.speakers && it.speakers.length > 0 && (
                              <p className="text-[11px] text-gray-500">
                                Speaker: <strong className="text-gray-700 dark:text-gray-300">{it.speakers.join(', ')}</strong>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const sec = (session.sections || []).find((s) => s.items?.some((i) => i.id === it.id));
                                if (sec) {
                                  setEditingItem({ sessionId: session.id, sectionId: sec.id, item: it });
                                }
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-isot-burgundy hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const sec = (session.sections || []).find((s) => s.items?.some((i) => i.id === it.id));
                                if (sec && window.confirm(`Delete item "${it.title}"?`)) {
                                  deleteItemFromSession(session.id, sec.id, it.id);
                                  showNotification('Item deleted.');
                                }
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 3: TALKS & PROGRAMME ITEMS VIEW */}
      {/* ============================================================ */}
      {activeTab === 'talks' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Showing {filteredTalks.length} item{filteredTalks.length === 1 ? '' : 's'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTalks.map(({ session, section, item }) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                    <span className="text-isot-burgundy dark:text-rose-400 font-extrabold">{item.startTime}</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 uppercase text-[10px]">
                      {session.venue} • {session.dayName}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-gray-500 truncate">
                    Session: {session.title}
                  </p>

                  {item.speakers && item.speakers.length > 0 && (
                    <div className="pt-2 flex items-center gap-2">
                      <SpeakerAvatar name={item.speakers[0]} size="sm" />
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                        {item.speakers.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem({ sessionId: session.id, sectionId: section.id, item })}
                    className="px-3 py-1.5 rounded-xl bg-isot-burgundy/10 text-isot-burgundy dark:bg-rose-950/40 dark:text-rose-300 hover:bg-isot-burgundy hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1"
                  >
                    <Edit2 size={12} />
                    <span>Edit Talk</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 4: FACULTY DIRECTORY & R2 PORTRAIT STUDIO */}
      {/* ============================================================ */}
      {activeTab === 'faculty' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Faculty</span>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{allFaculty.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">Photos in R2</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300">{facultyWithPhotosCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block">Needs Photo</span>
              <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-300">{allFaculty.length - facultyWithPhotosCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFaculty.map((sp) => {
              const photo = getSpeakerPhoto(sp.name, speakerPhotos);
              const uniqueRoles = Array.from(new Set(sp.roles.map((r) => r.role)));

              return (
                <div
                  key={sp.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:border-isot-burgundy/30 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative group/avatar shrink-0">
                      <SpeakerAvatar name={sp.name} size="lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhotoSpeaker(sp);
                          setPhotoUploadMethod('file');
                          setSelectedPhotoFile(null);
                          setDirectPhotoUrl('');
                          setPhotoPreview(photo || null);
                        }}
                        className="absolute inset-0 rounded-2xl bg-black/50 text-white opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity"
                        title="Upload portrait to R2"
                      >
                        <Camera size={18} />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate" title={sp.name}>
                        {sp.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {sp.roles.length} role{sp.roles.length > 1 ? 's' : ''}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {uniqueRoles.map((role) => (
                          <span
                            key={role}
                            className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPhotoSpeaker(sp);
                        setPhotoUploadMethod('file');
                        setSelectedPhotoFile(null);
                        setDirectPhotoUrl('');
                        setPhotoPreview(photo || null);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-isot-burgundy/10 hover:bg-isot-burgundy hover:text-white text-isot-burgundy dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white text-xs font-bold transition-all"
                    >
                      <Camera size={13} />
                      <span>{photo ? 'Change R2 Photo' : 'Upload to R2'}</span>
                    </button>

                    {photo && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSpeakerPhoto(sp)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove custom photo"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 5: SHEETS & CLOUDFLARE D1 SYNC STUDIO */}
      {/* ============================================================ */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-base">
              <FileSpreadsheet size={20} />
              <span>Google Sheets & CSV Live Database Sync</span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Edit the entire ISOT 2026 scientific programme in Google Sheets or Excel, then upload the CSV file directly to your Cloudflare D1 database.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-isot-burgundy text-left transition-all space-y-1"
              >
                <span className="font-extrabold text-sm text-gray-900 dark:text-white block">
                  1. Export All Live Data to CSV
                </span>
                <p className="text-xs text-gray-500">Includes all 19 sessions, 276 items and red PDF headers</p>
              </button>

              <label className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-500 text-left transition-all cursor-pointer space-y-1 block">
                <span className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300 block">
                  {isUploadingCsv ? 'Uploading & Syncing...' : '2. Upload Edited CSV to D1'}
                </span>
                <p className="text-xs text-gray-500">Overwrites and synchronizes database with your edited spreadsheet</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  disabled={isUploadingCsv}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Danger Zone & Database Reset</h4>
            <p className="text-xs text-gray-500">Reset the database to the official ISOT 2026 Brochure V23-1 dataset.</p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset entire programme to official Brochure V23-1 dataset?')) {
                  resetToDefaultProgramme();
                  showNotification('Reset database to V23-1 brochure dataset!');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold transition-all"
            >
              Reset to Brochure V23-1 Default
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: PHOTO UPLOADER TO CLOUDFLARE R2 */}
      {/* ============================================================ */}
      {editingPhotoSpeaker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full border-t sm:border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-isot-burgundy dark:text-rose-400" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Upload Portrait to Cloudflare R2
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPhotoSpeaker(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center space-y-2 py-1">
              <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden border-2 border-isot-burgundy/30 shadow-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover object-top" />
                ) : (
                  <SpeakerAvatar name={editingPhotoSpeaker.name} size="xl" />
                )}
              </div>
              <h4 className="font-black text-base text-gray-900 dark:text-white">
                {editingPhotoSpeaker.name}
              </h4>
              <p className="text-xs text-gray-500">Auto-resized to 500×500 px PNG on Cloudflare R2</p>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPhotoUploadMethod('file')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  photoUploadMethod === 'file'
                    ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                <ImageIcon size={14} />
                <span>Upload File</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoUploadMethod('url')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  photoUploadMethod === 'url'
                    ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                <LinkIcon size={14} />
                <span>Image URL</span>
              </button>
            </div>

            {photoUploadMethod === 'file' ? (
              <div className="space-y-2">
                <label className="block p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-isot-burgundy text-center cursor-pointer transition-all bg-gray-50 dark:bg-zinc-800/50">
                  <Camera size={28} className="mx-auto text-isot-burgundy dark:text-rose-400 mb-2" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200 block">
                    {selectedPhotoFile ? selectedPhotoFile.name : 'Click or Drag photo here'}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">PNG, JPG, JPEG, WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Direct Image URL (HTTPS)
                </label>
                <input
                  type="url"
                  value={directPhotoUrl}
                  onChange={(e) => {
                    setDirectPhotoUrl(e.target.value);
                    if (e.target.value) setPhotoPreview(e.target.value);
                  }}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold outline-none focus:border-isot-burgundy"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setEditingPhotoSpeaker(null);
                  setSelectedPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPhotoUploading || (photoUploadMethod === 'file' && !selectedPhotoFile) || (photoUploadMethod === 'url' && !directPhotoUrl)}
                onClick={handleSaveSpeakerPhoto}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-isot-burgundy hover:bg-isot-deep-burgundy disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-isot-burgundy/25 transition-all"
              >
                {isPhotoUploading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving to R2...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Save to R2</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
'''

with open('/Users/sridharsilver/Desktop/ISOT-Admin/src/pages/Admin.tsx', 'w') as f:
    f.write(admin_code)

print('Updated ISOT-Admin/src/pages/Admin.tsx with modern redesign!')
