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
  { label: 'Property Owners', href: '/admin/property-owners', icon: 'KeyIcon', permission: 'view_property_owners' as Permission },
  { label: 'WhatsApp', href: '/admin/whatsapp', icon: 'ChatBubbleLeftRightIcon', permission: 'view_whatsapp' as Permission },
  { label: 'Approvals', href: '/admin/approvals', icon: 'CheckBadgeIcon', permission: 'view_properties' as Permission },
  { label: 'Agents', href: '/admin/agents', icon: 'IdentificationIcon', permission: 'view_agents' as Permission },
  { label: 'Deals', href: '/admin/deals', icon: 'BriefcaseIcon', permission: 'view_deals' as Permission },
  { label: 'Calendar', href: '/admin/calendar', icon: 'CalendarIcon', permission: 'view_calendar' as Permission },
  { label: 'Tasks', href: '/admin/tasks', icon: 'ClipboardDocumentListIcon', permission: 'view_tasks' as Permission },
  { label: 'Marketing', href: '/admin/marketing', icon: 'MegaphoneIcon', permission: 'view_marketing' as Permission },
  { label: 'Campaigns', href: '/admin/campaigns', icon: 'RectangleGroupIcon', permission: 'view_marketing' as Permission },
  { label: 'Documents', href: '/admin/documents', icon: 'DocumentTextIcon', permission: 'view_documents' as Permission },
  { label: 'Syndication', href: '/admin/syndication', icon: 'RssIcon', permission: 'view_syndication' as Permission },
  { label: 'Bulk Import', href: '/admin/bulk-import', icon: 'ArrowUpTrayIcon', permission: 'view_bulk_import' as Permission },
  { label: 'Analytics', href: '/admin/analytics', icon: 'ChartBarIcon', permission: 'view_analytics' as Permission },
];

const allCmsLinks = [
  { label: 'Site Settings', href: '/admin/settings', icon: 'Cog6ToothIcon', permission: 'view_settings' as Permission },
  { label: 'User Management', href: '/admin/users', icon: 'UserGroupIcon', permission: 'view_users' as Permission },
  { label: 'Blog Posts', href: '/admin/blog', icon: 'DocumentDuplicateIcon', permission: 'view_blog' as Permission },
  { label: 'FAQs', href: '/admin/faqs', icon: 'QuestionMarkCircleIcon', permission: 'view_blog' as Permission },
];

// Bottom nav items (most used — shown on mobile)
const bottomNavItems = [
  { label: 'Home', href: '/admin', icon: 'Squares2X2Icon', permission: 'view_dashboard' as Permission },
  { label: 'Leads', href: '/admin/leads', icon: 'UserPlusIcon', permission: 'view_leads' as Permission },
  { label: 'Properties', href: '/admin/properties', icon: 'HomeIcon', permission: 'view_properties' as Permission },
  { label: 'Calendar', href: '/admin/calendar', icon: 'CalendarIcon', permission: 'view_calendar' as Permission },
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
  badge?: number;
  onClick?: () => void;
}

function NavItem({ href, icon, label, active, collapsed, badge, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative ${
        active
          ? 'bg-primary/10 text-primary border-l-2 border-primary' :'text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-2 border-transparent'
      }`}
    >
      <Icon name={icon as any} size={16} className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
      {!collapsed && <span className="truncate flex-1">{label}</span>}
      {!collapsed && badge && badge > 0 ? (
        <span className="ml-auto w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-bold text-black">{badge > 9 ? '9+' : badge}</span>
        </span>
      ) : null}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
          {label}
        </div>
      )}
    </Link>
  );
}

interface ApprovalNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  approval_requests?: { item_type: string; item_id: string } | null;
}

interface FollowUpNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  lead_id: string | null;
  lead_name: string | null;
  action_url: string;
  read: boolean;
  created_at: string;
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingDocs, setPendingDocs] = useState<{ id: string; title: string; template_name: string; created_at: string }[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<{ id: string; item_title: string; item_type: string; submitted_by_name: string; submitted_at: string }[]>([]);
  const [approvalNotifications, setApprovalNotifications] = useState<ApprovalNotification[]>([]);
  const [followUpNotifications, setFollowUpNotifications] = useState<FollowUpNotification[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser, can, isRole } = useRole();
  const supabase = useMemo(() => createClient(), []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

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

  const fetchApprovalData = useCallback(async () => {
    if (!currentUser.id || currentUser.id === '1') return;

    if (currentUser.role === 'super_admin') {
      const { data } = await supabase
        .from('approval_requests')
        .select('id, item_title, item_type, submitted_by_name, submitted_at')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });
      if (data) setPendingApprovals(data);
    }

    const { data: notifs } = await supabase
      .from('approval_notifications')
      .select('id, type, title, message, read, created_at, approval_requests(item_type, item_id)')
      .eq('recipient_id', currentUser.id)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10);
    if (notifs) setApprovalNotifications(notifs as ApprovalNotification[]);
  }, [supabase, currentUser.id, currentUser.role]);

  const fetchFollowUpNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('crm_notifications')
      .select('id, type, title, message, lead_id, lead_name, action_url, read, created_at')
      .eq('read', false)
      .eq('type', 'follow_up')
      .order('created_at', { ascending: false })
      .limit(15);
    if (data) setFollowUpNotifications(data as FollowUpNotification[]);
  }, [supabase]);

  useEffect(() => {
    fetchPendingDocs();
    fetchApprovalData();
    fetchFollowUpNotifications();
  }, [fetchPendingDocs, fetchApprovalData, fetchFollowUpNotifications]);

  // Poll for new follow-up notifications every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFollowUpNotifications();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchFollowUpNotifications]);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchPendingDocs();
      fetchApprovalData();
      fetchFollowUpNotifications();
    }
  };

  const handleMarkApprovalNotificationsRead = async () => {
    if (!currentUser.id || currentUser.id === '1') return;
    await supabase
      .from('approval_notifications')
      .update({ read: true })
      .eq('recipient_id', currentUser.id)
      .eq('read', false);
    setApprovalNotifications([]);
  };

  const handleMarkFollowUpRead = async (id: string) => {
    await supabase.from('crm_notifications').update({ read: true }).eq('id', id);
    setFollowUpNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllFollowUpsRead = async () => {
    const ids = followUpNotifications.map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from('crm_notifications').update({ read: true }).in('id', ids);
    setFollowUpNotifications([]);
  };

  const crmLinks = allCrmLinks.filter((l) => can(l.permission));
  const cmsLinks = allCmsLinks.filter((l) => {
    if (!isRole('super_admin', 'admin', 'marketing')) return false;
    return can(l.permission);
  });
  const mobileBottomLinks = bottomNavItems.filter((l) => can(l.permission));

  const pendingApprovalsCount = currentUser.role === 'super_admin' ? pendingApprovals.length : 0;
  const approvalNotifsCount = approvalNotifications.length;
  const followUpNotifsCount = followUpNotifications.length;
  const totalNotifications = (currentUser.role === 'super_admin' ? pendingDocs.length : 0) + pendingApprovalsCount + approvalNotifsCount + followUpNotifsCount;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Render standalone (no sidebar) for login and reset-password pages
  if (STANDALONE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Wait for auth check to complete before rendering
  if (!authChecked) {
    return null;
  }

  // Get current page label for mobile header
  const currentPageLabel = [...allCrmLinks, ...allCmsLinks].find(l => l.href === pathname)?.label || 'Admin';

  const notificationTypeIcon = (type: string) => {
    if (type === 'review_requested') return { icon: 'ClockIcon', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    if (type === 'approved') return { icon: 'CheckCircleIcon', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (type === 'rejected') return { icon: 'ExclamationCircleIcon', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
    return { icon: 'BellIcon', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' };
  };

  const NotificationPanel = () => (
    <div className="divide-y divide-border max-h-96 overflow-y-auto">
      {/* Follow-up reminders */}
      {followUpNotifications.length > 0 && (
        <div className="px-4 py-2 flex items-center justify-between bg-orange-500/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Follow-up Reminders ({followUpNotifsCount})</p>
          <button
            onClick={handleMarkAllFollowUpsRead}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Mark all read
          </button>
        </div>
      )}
      {followUpNotifications.map((notif) => (
        <Link
          key={notif.id}
          href={notif.action_url || '/admin/leads'}
          onClick={() => { setShowNotifications(false); handleMarkFollowUpRead(notif.id); }}
          className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-orange-500/10 border border-orange-500/20 flex-shrink-0 mt-0.5">
            <Icon name="CalendarDaysIcon" size={14} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">{notif.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
          </div>
          <span className="text-[10px] text-orange-400 flex-shrink-0 font-medium">Follow-up</span>
        </Link>
      ))}

      {/* Approval notifications for current user (approved/rejected) */}
      {approvalNotifications.map((notif) => {
        const { icon, color, bg } = notificationTypeIcon(notif.type);
        const href = notif.approval_requests
          ? `/admin/${notif.approval_requests.item_type === 'project' ? 'projects' : 'properties'}`
          : '/admin/approvals';
        return (
          <Link
            key={notif.id}
            href={href}
            onClick={() => { setShowNotifications(false); handleMarkApprovalNotificationsRead(); }}
            className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className={`w-8 h-8 flex items-center justify-center border flex-shrink-0 mt-0.5 ${bg}`}>
              <Icon name={icon as any} size={14} className={color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{notif.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
            </div>
            <span className={`text-[10px] flex-shrink-0 font-medium ${color}`}>New</span>
          </Link>
        );
      })}

      {/* Pending approvals for CEO */}
      {currentUser.role === 'super_admin' && pendingApprovals.map((req) => (
        <Link
          key={req.id}
          href="/admin/approvals"
          onClick={() => setShowNotifications(false)}
          className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 flex-shrink-0 mt-0.5">
            <Icon name="CheckBadgeIcon" size={14} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Approval Required</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {req.item_type === 'project' ? 'Project' : 'Property'}: {req.item_title}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">by {req.submitted_by_name}</p>
          </div>
          <span className="text-[10px] text-amber-400 flex-shrink-0 font-medium">Review</span>
        </Link>
      ))}

      {/* Pending docs for CEO */}
      {currentUser.role === 'super_admin' && pendingDocs.map((doc) => (
        <Link key={doc.id} href="/admin/documents" onClick={() => setShowNotifications(false)} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 flex-shrink-0 mt-0.5">
            <Icon name="DocumentTextIcon" size={14} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Document Pending Approval</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{doc.title || doc.template_name}</p>
          </div>
          <span className="text-[10px] text-amber-400 flex-shrink-0 font-medium">Review</span>
        </Link>
      ))}

      {/* Static notifications */}
      {[
        { icon: 'UserPlusIcon', title: 'New lead received', desc: 'A new enquiry from the website', time: '2 min ago', color: 'text-blue-400' },
        { icon: 'HomeIcon', title: 'Property published', desc: 'Marina Heights listing is now live', time: '1 hr ago', color: 'text-primary' },
        { icon: 'BriefcaseIcon', title: 'Deal updated', desc: 'Palm Villa deal moved to Negotiation', time: '3 hr ago', color: 'text-purple-400' },
        { icon: 'CalendarIcon', title: 'Viewing scheduled', desc: 'Tomorrow at 10:00 AM — Downtown Apt', time: 'Yesterday', color: 'text-emerald-400' },
      ].map((n, i) => (
        <div key={`static-${i}`} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
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

      {totalNotifications === 0 && (
        <div className="px-4 py-3">
          <p className="text-[11px] text-muted-foreground">No new notifications</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 flex-shrink-0 ${
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
          {crmLinks.length > 0 && (
            <div className="mb-1">
              {!collapsed && (
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">CRM</p>
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
                  badge={link.href === '/admin/approvals' ? (pendingApprovalsCount + approvalNotifsCount) || undefined : undefined}
                />
              ))}
            </div>
          )}
          {cmsLinks.length > 0 && (
            <div className="mt-3">
              {!collapsed && (
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">CMS</p>
              )}
              {collapsed && <div className="border-t border-border my-2" />}
              {cmsLinks.map((link) => (
                <NavItem key={link.href} href={link.href} icon={link.icon} label={link.label} active={pathname === link.href} collapsed={collapsed} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowTopRightOnSquareIcon" size={14} />
            {!collapsed && <span>View Website</span>}
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-red-400 transition-colors w-full">
            <Icon name="ArrowRightOnRectangleIcon" size={14} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      {mobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* ─── MOBILE SLIDE-OUT DRAWER ─── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileDrawerOpen(false)}>
            <div className="w-7 h-7 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-black">C</span>
            </div>
            <div>
              <p className="text-foreground font-bold text-sm tracking-tight leading-none">Cove Estates</p>
              <p className="text-muted-foreground text-[10px] mt-0.5">Admin Panel</p>
            </div>
          </Link>
          <button onClick={() => setMobileDrawerOpen(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        {/* User info in drawer */}
        <div className="px-4 py-3 border-b border-border bg-background/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-sm font-bold">{currentUser.avatar}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{currentUser.name}</p>
              <p className={`text-[11px] font-medium ${roleBadgeColors[currentUser.role]}`}>{roleLabels[currentUser.role]}</p>
            </div>
          </div>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto py-2">
          {crmLinks.length > 0 && (
            <div className="mb-1">
              <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">CRM</p>
              {crmLinks.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  active={pathname === link.href}
                  collapsed={false}
                  badge={link.href === '/admin/approvals' ? (pendingApprovalsCount + approvalNotifsCount) || undefined : undefined}
                  onClick={() => setMobileDrawerOpen(false)}
                />
              ))}
            </div>
          )}
          {cmsLinks.length > 0 && (
            <div className="mt-2">
              <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">CMS</p>
              {cmsLinks.map((link) => (
                <NavItem key={link.href} href={link.href} icon={link.icon} label={link.label} active={pathname === link.href} collapsed={false} onClick={() => setMobileDrawerOpen(false)} />
              ))}
            </div>
          )}
        </div>

        {/* Drawer footer */}
        <div className="border-t border-border p-3 space-y-1">
          <Link href="/" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowTopRightOnSquareIcon" size={16} />
            <span>View Website</span>
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-red-400 transition-colors w-full">
            <Icon name="ArrowRightOnRectangleIcon" size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ─── TOP BAR (desktop) ─── */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
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
                  <NotificationPanel />
                  <div className="px-4 py-2.5 border-t border-border">
                    <Link href="/admin/approvals" onClick={() => setShowNotifications(false)} className="text-[10px] text-center text-primary hover:text-accent block transition-colors">
                      View all approvals →
                    </Link>
                  </div>
                </div>
              )}
            </div>
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

        {/* ─── MOBILE TOP BAR ─── */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0 safe-area-top">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open menu"
          >
            <Icon name="Bars3Icon" size={22} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-black">C</span>
            </div>
            <span className="text-foreground font-bold text-sm tracking-tight">{currentPageLabel}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={handleBellClick}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="BellIcon" size={20} />
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
                <div className="absolute right-0 top-full mt-1 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground">Notifications</p>
                    <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="XMarkIcon" size={14} />
                    </button>
                  </div>
                  <NotificationPanel />
                  <div className="px-4 py-2.5 border-t border-border">
                    <Link href="/admin/approvals" onClick={() => setShowNotifications(false)} className="text-[10px] text-center text-primary hover:text-accent block transition-colors">
                      View all approvals →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {/* Avatar */}
            <div className="w-8 h-8 bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">{currentUser.avatar}</span>
            </div>
          </div>
        </header>

        {/* ─── PAGE CONTENT ─── */}
        <main className="flex-1 overflow-y-auto admin-panel pb-20 lg:pb-0">
          {children}
        </main>

        {/* ─── MOBILE BOTTOM NAV ─── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 safe-area-bottom">
          <div className="flex items-stretch">
            {mobileBottomLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon name={item.icon as any} size={22} className={active ? 'text-primary' : 'text-muted-foreground'} />
                  <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                  {active && <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />}
                </Link>
              );
            })}
            {/* More button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-muted-foreground transition-colors"
            >
              <Icon name="EllipsisHorizontalIcon" size={22} />
              <span className="text-[10px] font-semibold tracking-wide">More</span>
            </button>
          </div>
        </nav>

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
