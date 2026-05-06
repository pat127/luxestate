'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { RoleProvider, useRole, mockUsersList, type UserRole, type Permission } from '@/contexts/RoleContext';

const allCrmLinks = [
  { label: 'Dashboard', href: '/admin', icon: 'Squares2X2Icon', permission: 'view_dashboard' as Permission },
  { label: 'Contacts', href: '/admin/contacts', icon: 'UsersIcon', permission: 'view_contacts' as Permission },
  { label: 'Leads', href: '/admin/leads', icon: 'UserPlusIcon', permission: 'view_leads' as Permission },
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
  const pathname = usePathname();
  const { currentUser, setCurrentUser, can, isRole } = useRole();

  const crmLinks = allCrmLinks.filter((l) => can(l.permission));
  const cmsLinks = allCmsLinks.filter((l) => {
    // CMS section visible only to super_admin (CEO) and marketing roles
    if (!isRole('super_admin', 'marketing')) return false;
    return can(l.permission);
  });

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
                <span className="text-primary-foreground text-xs font-black">L</span>
              </div>
              <span className="text-foreground font-bold text-sm tracking-tight">LuxEstate</span>
              <span className="text-muted-foreground text-xs">Admin</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-6 h-6 bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground text-xs font-black">L</span>
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
          <button className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-red-400 transition-colors w-full">
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
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="BellIcon" size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>

            {/* Role switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center gap-2 px-3 py-1.5 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-6 h-6 bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">{currentUser.avatar}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-foreground leading-none">{currentUser.name}</p>
                  <p className={`text-[10px] mt-0.5 font-medium ${roleBadgeColors[currentUser.role]}`}>{roleLabels[currentUser.role]}</p>
                </div>
                <Icon name="ChevronDownIcon" size={12} className="text-muted-foreground" />
              </button>

              {showRoleSwitcher && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Switch Role (Demo)</p>
                  </div>
                  {mockUsersList.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setCurrentUser(u); setShowRoleSwitcher(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary/10 transition-colors ${currentUser.id === u.id ? 'bg-primary/5' : ''}`}
                    >
                      <div className="w-7 h-7 bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-xs font-bold">{u.avatar}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-medium text-foreground">{u.name}</p>
                        <p className={`text-[10px] ${roleBadgeColors[u.role]}`}>{roleLabels[u.role]}</p>
                      </div>
                      {currentUser.id === u.id && <Icon name="CheckIcon" size={12} className="text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
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
