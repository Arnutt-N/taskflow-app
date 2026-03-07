'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle2,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Zap,
  ShieldCheck,
  UserCircle,
  BarChart3,
  Building2,
  UsersRound,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

// ─── Nav Structure ───────────────────────────────────────────────────────────
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'Tasks', icon: CheckCircle2 },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

const adminNavItems: NavItem[] = [
  { href: '/admin/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { href: '/admin/departments', label: 'Departments', icon: Building2, roles: ['ADMIN'] },
  { href: '/admin/teams', label: 'Teams', icon: UsersRound, roles: ['ADMIN'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ClipboardList, roles: ['ADMIN'] },
];

// ─── Breadcrumb helper ────────────────────────────────────────────────────────
function useBreadcrumb(pathname: string) {
  const crumbs: { label: string; href: string }[] = [{ label: 'Home', href: '/' }];
  const segments = pathname.split('/').filter(Boolean);
  let accumulated = '';
  for (const seg of segments) {
    accumulated += `/${seg}`;
    const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    crumbs.push({ label, href: accumulated });
  }
  return crumbs;
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role?: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ADMIN: { label: 'Admin', cls: 'bg-rose-100 text-rose-700' },
    PM: { label: 'PM', cls: 'bg-violet-100 text-violet-700' },
    LEAD: { label: 'Lead', cls: 'bg-amber-100 text-amber-700' },
    STAFF: { label: 'Staff', cls: 'bg-slate-100 text-slate-600' },
  };
  const r = map[role || ''] || map['STAFF'];
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${r.cls}`}>
      {r.label}
    </span>
  );
}

// ─── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then(r => r.json()),
    enabled: open,
  });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-500" />
          Notifications
          {notifications.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </h3>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto sidebar-scroll">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <AlertCircle className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">ไม่มีการแจ้งเตือนใหม่</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((n: { id: string; message: string; createdAt: string }) => (
            <div key={n.id} className="px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
              <p className="text-sm text-slate-700">{n.message}</p>
              <p className="text-[11px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString('th-TH')}</p>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function SidebarItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      {/* Active indicator bar */}
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/50 rounded-r-full" />
      )}
      <Icon className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4.5 h-4.5'}`} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
    </Link>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = useBreadcrumb(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const role = (session?.user as { role?: string })?.role || 'STAFF';
  const isAdmin = role === 'ADMIN';

  // Persist collapsed state
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored) setCollapsed(stored === 'true');
  }, []);
  const toggleCollapse = () => {
    setCollapsed(v => {
      localStorage.setItem('sidebar-collapsed', String(!v));
      return !v;
    });
  };

  // Close user menu on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Cmd+K search shortcut
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
    }
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, []);

  const sidebarWidth = collapsed ? 'w-[70px]' : 'w-60';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${sidebarWidth}
          flex flex-col
          bg-white border-r border-slate-100
          transition-all duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-slate-100 ${collapsed ? 'justify-center px-3' : 'px-5 gap-3'}`}>
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-extrabold text-slate-900 text-sm leading-tight tracking-tight">
                Engineering<span className="text-indigo-600">Flow</span>
              </p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Project Management
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6 sidebar-scroll">
          {/* Main */}
          <div>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Main
              </p>
            )}
            <div className="space-y-0.5">
              {mainNavItems.map(item => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                  collapsed={collapsed}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>

          {/* Admin */}
          {isAdmin && (
            <div>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Admin
                </p>
              )}
              {collapsed && <div className="my-1 mx-3 border-t border-slate-100" />}
              <div className="space-y-0.5">
                {adminNavItems.map(item => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    isActive={pathname.startsWith(item.href)}
                    collapsed={collapsed}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User area */}
        <div className={`border-t border-slate-100 p-2 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setUserMenuOpen(v => !v)}>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">{session?.user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{session?.user?.email}</p>
              </div>
              <RoleBadge role={role} />
            </div>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow"
              title={session?.user?.name || 'User'}
              onClick={() => setUserMenuOpen(v => !v)}>
              {session?.user?.name?.[0] || 'U'}
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-colors z-10"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top Navbar ── */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 gap-4 flex-shrink-0 shadow-sm shadow-slate-100">

          {/* Left: Mobile menu + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1.5 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-300">/</span>}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-slate-800">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="text-slate-400 hover:text-slate-700 transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>

          {/* Right: Search + Notifications + User */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Search trigger */}
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-400 text-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden md:inline bg-white border border-slate-200 text-[10px] font-mono px-1 rounded">⌘K</kbd>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>
              <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                  {session?.user?.name?.[0] || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{session?.user?.name?.split(' ')[0]}</p>
                  <div className="flex">
                    <RoleBadge role={role} />
                  </div>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden py-1">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{session?.user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { router.push('/profile'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <UserCircle className="w-4 h-4" /> My Profile
                    </button>
                    <button
                      onClick={() => { router.push('/settings'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { router.push('/admin/users'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" /> Admin Panel
                      </button>
                    )}
                  </div>
                  <div className="py-1 border-t border-slate-100">
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto content-scroll">
          {children}
        </main>
      </div>

      {/* ── Cmd+K Search Modal ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search tasks, projects, people..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery) {
                    router.push(`/tasks?search=${encodeURIComponent(searchQuery)}`);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }
                }}
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-3 text-xs text-slate-400 flex items-center gap-4">
              <span><kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px]">↵</kbd> to search</span>
              <span><kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px]">Esc</kbd> to close</span>
            </div>
            {/* Quick links */}
            <div className="px-3 py-2 border-t border-slate-50">
              <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Links</p>
              {[
                { label: 'Projects', href: '/projects', icon: FolderKanban },
                { label: 'Tasks', href: '/tasks', icon: CheckCircle2 },
                { label: 'Dashboard', href: '/', icon: LayoutDashboard },
              ].map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
