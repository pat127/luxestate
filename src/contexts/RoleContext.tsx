'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type UserRole = 'super_admin' | 'admin' | 'marketing' | 'agent';

interface RoleUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface RoleContextType {
  currentUser: RoleUser;
  setCurrentUser: (user: RoleUser) => void;
  can: (permission: Permission) => boolean;
  isRole: (...roles: UserRole[]) => boolean;
  /** Returns true if the current user is an agent (own-records-only scope) */
  isAgentScoped: boolean;
  /** Returns true if the current user can see all records (not agent-scoped) */
  canViewAll: boolean;
  /** Returns true if the current user is the listing/assigned agent for a record */
  isAssignedAgent: (recordAgentName: string | undefined | null) => boolean;
}

export type Permission =
  | 'view_dashboard' | 'view_contacts' | 'view_all_contacts' | 'view_leads' | 'view_all_leads' |'view_properties'| 'view_projects' | 'view_agents' | 'view_deals' | 'view_all_deals' |'view_calendar'| 'view_all_calendars' | 'view_tasks' | 'view_all_tasks' |'view_marketing' | 'view_documents' | 'view_syndication' | 'view_bulk_import'
  | 'view_analytics'| 'view_settings' | 'view_users' | 'view_blog' | 'manage_users' |'view_property_owners';

const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    'view_dashboard', 'view_contacts', 'view_all_contacts', 'view_leads', 'view_all_leads',
    'view_properties', 'view_projects', 'view_agents', 'view_deals', 'view_all_deals',
    'view_calendar', 'view_all_calendars', 'view_tasks', 'view_all_tasks',
    'view_marketing', 'view_documents', 'view_syndication', 'view_bulk_import',
    'view_analytics', 'view_settings', 'view_users', 'view_blog', 'manage_users', 'view_property_owners',
  ],
  admin: [
    'view_dashboard', 'view_contacts', 'view_all_contacts', 'view_leads', 'view_all_leads',
    'view_properties', 'view_projects', 'view_agents', 'view_deals', 'view_all_deals',
    'view_calendar', 'view_all_calendars', 'view_tasks', 'view_all_tasks',
    'view_marketing', 'view_documents', 'view_syndication', 'view_bulk_import',
    'view_analytics', 'view_settings', 'view_users', 'view_blog', 'view_property_owners',
  ],
  marketing: [
    'view_dashboard', 'view_leads', 'view_all_leads',
    'view_properties', 'view_projects',
    'view_marketing', 'view_analytics', 'view_calendar',
    'view_blog', 'view_settings',
  ],
  agent: [
    'view_dashboard', 'view_contacts', 'view_leads',
    'view_properties', 'view_projects',
    'view_deals', 'view_calendar', 'view_tasks',
  ],
};

const defaultUser: RoleUser = {
  id: '',
  name: 'Loading…',
  email: '',
  role: 'agent',
  avatar: '?',
};

export const mockUsersList: RoleUser[] = [];

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<RoleUser>(defaultUser);

  useEffect(() => {
    if (authLoading) return;

    if (user && profile) {
      const role = (profile.role as UserRole) || 'agent';
      setCurrentUser({
        id: user.id,
        name: profile.full_name || profile.agent_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role,
        avatar: (profile.full_name || user.email || 'U').charAt(0).toUpperCase(),
      });
    } else if (user) {
      // Profile not yet loaded — derive from auth metadata
      const meta = user.user_metadata || {};
      const role = (meta.role as UserRole) || 'agent';
      setCurrentUser({
        id: user.id,
        name: meta.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role,
        avatar: (meta.full_name || user.email || 'U').charAt(0).toUpperCase(),
      });
    } else {
      setCurrentUser(defaultUser);
    }
  }, [user, profile, authLoading]);

  const can = (permission: Permission): boolean => {
    return rolePermissions[currentUser.role]?.includes(permission) ?? false;
  };

  const isRole = (...roles: UserRole[]): boolean => {
    return roles.includes(currentUser.role);
  };

  const isAgentScoped = currentUser.role === 'agent';
  const canViewAll = currentUser.role !== 'agent';

  const isAssignedAgent = (recordAgentName: string | undefined | null): boolean => {
    if (!isAgentScoped) return true;
    if (!recordAgentName) return false;
    const agentName = profile?.agent_name || currentUser.name;
    return recordAgentName.toLowerCase().trim() === agentName.toLowerCase().trim();
  };

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser, can, isRole, isAgentScoped, canViewAll, isAssignedAgent }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
