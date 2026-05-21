'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { RoleProvider, useRole, type UserRole, type Permission } from '@/contexts/RoleContext';
import { createClient } from '@/lib/supabase/client';

// Routes that should render WITHOUT the admin sidebar/nav
const STANDALONE_ROUTES = ['/admin/login', '/admin/reset-password'];

const allCrmLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'Squares2X2Icon', permission: 'view_dashboard' as Permission },
  { label: 'Contacts', href: '/admin/contacts', icon: 'UsersIcon', permission: 'view_contacts' as Permission },
  { label: 'Leads', href: '/admin/leads', icon: 'UserPlusIcon', permission: 'view_leads' as Permission },
  { label: 'Inquiries', href: '/admin/inquiries', icon: 'InboxIcon', permission: 'view_leads' as Permission },
  { label: 'Properties', href: '/admin/properties', icon: 'HomeIcon', permission: 'view_properties' as Permission },
  { label: 'Projects', href: '/admin/projects', icon: 'BuildingOffice2Icon', permission: 'view_projects' as Permission },
  { label: 'Agents', href: '/admin/agents', icon: 'IdentificationIcon', permission: 'view_agents' as Permission },
  { label: 'Deals', href: '/admin/deals', icon: 'BriefcaseIcon', permission: 'view_deals' as Permission },
  { label: 'Calendar', href: '/admin/calendar', icon: 'CalendarIcon', permission: 'view_calendar' as Permission },
  { label: 'Tasks', href: '/admin/tasks', icon: 'ClipboardDocumentListIcon', permission: 'view_tasks' as Permission },
  { label: 'Marketing', href: '/admin/marketing', icon: 'MegaphoneIcon', permission: 'view_marketing' as Permission },
  { label: 'Documents', href: '/admin/documents', icon: 'DocumentTextIcon', permission: 'view_documents' as Permission },
  { label: 'Syndication', href: '/admin/syndication', icon: 'RssIcon', permission: 'view_syndication' as Permission },
  { label: 'Bulk Import', href: '/admin/bulk-import', icon: 'ArrowUpTrayIcon', permission: 'view_bulk_import' as Permission },
  { label: 'Analytics', href: '/admin/analytics', icon: 'ChartBarIcon', permission: 'view_analytics' as Permission },
];

const allCmsLinks = [
  { label: 'Site Settings', href: '/admin/settings', icon: 'Cog6ToothIcon', permission: 'view_settings' as Permission },
  { label: 'User Management', href: '/admin/users', icon: 'UserGroupIcon', permission: 'view_users' as Permission },
  { label: 'Blog Posts', href: '/admin/blog', icon: 'DocumentDuplicateIcon', permission: 'view_blog' as Permission },
];

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin / CEO',
  admin: 'Admin',
  marketing: 'Marketing',
  agent: 'Agent',
};

const roleBadgeColors: Record<UserRole, string> = {
  super_admin: 'text-primary',
  admin: 'text-blue-400',
  marketing: 'text-pink-400',
  agent: 'text-emerald-400',
};

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  collapsed: boolean;
}

function NavItem({ href, icon, label, active, collapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative ${
        active
          ? 'bg-primary/10 text-primary border-l-2 border-primary' :'text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-2 border-transparent'
      }`}
    >
      <Icon name={icon as any} size={16} className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
          {label}
        </div>
      )}
    </Link>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingDocs, setPendingDocs] = useState<{ id: string; title: string; template_name: string; created_at: string }[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser, can, isRole } = useRole();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const syncAuthUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!STANDALONE_ROUTES.includes(pathname)) {
          router.replace('/admin/login');
        }
        setAuthChecked(true);
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .single();

      if (profile && profile.role) {
        const validRoles: UserRole[] = ['super_admin', 'admin', 'marketing', 'agent'];
        const role: UserRole = validRoles.includes(profile.role) ? profile.role : 'agent';
        const initials = (profile.full_name || profile.email || 'U').charAt(0).toUpperCase();
        setCurrentUser({
          id: profile.id,
          name: profile.full_name || profile.email || 'User',
          email: profile.email || user.email || '',
          role,
          avatar: initials,
        });
      }
      setAuthChecked(true);
    };
    syncAuthUser();
  }, [supabase, setCurrentUser, pathname, router]);

  const fetchPendingDocs = useCallback(async () => {
    if (currentUser.role !== 'super_admin') return;
    const { data } = await supabase
      .from('filled_documents')
      .select('id, title, template_name, created_at')
      .eq('doc_status', 'Pending Approval')
      .order('created_at', { ascending: false });
    if (data) setPendingDocs(data);
  }, [supabase, currentUser.role]);

  useEffect(() => {
    fetchPendingDocs();
  }, [fetchPendingDocs]);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    setShowRoleSwitcher(false);
    if (!showNotifications) fetchPendingDocs();
  };

  const crmLinks = allCrmLinks.filter((l) => can(l.permission));
  const cmsLinks = allCmsLinks.filter((l) => {
    if (!isRole('super_admin', 'admin', 'marketing')) return false;
    return can(l.permission);
  });

  const totalNotifications = currentUser.role === 'super_admin' ? pendingDocs.length : 0;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Render standalone (no sidebar) for login and reset-password pages
  if (STANDALONE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Wait for auth check to complete before rendering (prevents layout flash)
  if (!authChecked) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-card border-r border-border transition-all duration-300 flex-shrink-0 ${
          collapsed ? 'w-14' : 'w-56'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-border">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-black">C</span>
              </div>
              <span className="text-foreground font-bold text-sm tracking-tight">Cove Estates</span>
              <span className="text-muted-foreground text-xs">Admin</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-6 h-6 bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground text-xs font-black">C</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1 text-muted-foreground hover:text-foreground transition-colors ${collapsed ? 'mx-auto mt-2' : ''}`}
          >
            <Icon name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={14} />
          </button>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {/* CRM Section */}
          {crmLinks.length > 0 && (
            <div className="mb-1">
              {!collapsed && (
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  CRM
                </p>
              )}
              {collapsed && <div className="border-t border-border my-2" />}
              {crmLinks.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  active={pathname === link.href}
                  collapsed={collapsed}
                />
              ))}
            </div>
          )}

          {/* CMS Section */}
          {cmsLinks.length > 0 && (
            <div className="mt-3">
              {!collapsed && (
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  CMS
                </p>
              )}
              {collapsed && <div className="border-t border-border my-2" />}
              {cmsLinks.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  active={pathname === link.href}
                  collapsed={collapsed}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowTopRightOnSquareIcon" size={14} />
            {!collapsed && <span>View Website</span>}
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-red-400 transition-colors w-full"
          >
            <Icon name="ArrowRightOnRectangleIcon" size={14} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div />
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={handleBellClick}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="BellIcon" size={18} />
                {totalNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-bold text-black">{totalNotifications > 9 ? '9+' : totalNotifications}</span>
                  </span>
                )}
                {totalNotifications === 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-card border border-border shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground">Notifications</p>
                    <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="XMarkIcon" size={14} />
                    </button>
                  </div>
                  <div className="divide-y divide-border max-h-72 overflow-y-auto">
                    {currentUser.role === 'super_admin' && pendingDocs.length > 0 && pendingDocs.map((doc) => (
                      <Link
                        key={doc.id}
                        href="/admin/documents"
                        onClick={() => setShowNotifications(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 flex-shrink-0 mt-0.5">
                          <Icon name="DocumentTextIcon" size={14} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">Pending Approval</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{doc.title || doc.template_name}</p>
                        </div>
                        <span className="text-[10px] text-amber-400 flex-shrink-0 font-medium">Review</span>
                      </Link>
                    ))}
                    {[
                      { icon: 'UserPlusIcon', title: 'New lead received', desc: 'A new enquiry from the website', time: '2 min ago', color: 'text-blue-400' },
                      { icon: 'HomeIcon', title: 'Property published', desc: 'Marina Heights listing is now live', time: '1 hr ago', color: 'text-primary' },
                      { icon: 'BriefcaseIcon', title: 'Deal updated', desc: 'Palm Villa deal moved to Negotiation', time: '3 hr ago', color: 'text-purple-400' },
                      { icon: 'CalendarIcon', title: 'Viewing scheduled', desc: 'Tomorrow at 10:00 AM — Downtown Apt', time: 'Yesterday', color: 'text-emerald-400' },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="w-8 h-8 flex items-center justify-center bg-card border border-border flex-shrink-0 mt-0.5">
                          <Icon name={n.icon as any} size={14} className={n.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{n.desc}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{n.time}</span>
                      </div>
                    ))}
                    {currentUser.role === 'super_admin' && pendingDocs.length === 0 && (
                      <div className="px-4 py-3">
                        <p className="text-[11px] text-muted-foreground">No documents pending your approval</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-border">
                    <p className="text-[10px] text-center text-muted-foreground">All caught up</p>
                  </div>
                </div>
              )}
            </div>

            {/* Role display (real user — no switcher in production) */}
            <div className="flex items-center gap-2 px-3 py-1.5 border border-border">
              <div className="w-6 h-6 bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">{currentUser.avatar}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-foreground leading-none">{currentUser.name}</p>
                <p className={`text-[10px] mt-0.5 font-medium ${roleBadgeColors[currentUser.role]}`}>{roleLabels[currentUser.role]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto admin-panel">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </RoleProvider>
  );
}
