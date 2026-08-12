'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  /** Returns true if the current user can edit a property (non-agents always can; agents only if assigned) */
  canEditProperty: (recordAgentName: string | undefined | null) => boolean;
  /** Returns true if the current user can edit a project (agents cannot edit any project) */
  canEditProject: boolean;
}

export type Permission =
  | 'view_dashboard' |'view_contacts' |'view_all_contacts' |'view_leads' |'view_all_leads' |'view_properties' |'view_projects' |'view_agents' |'view_deals' |'view_all_deals' |'view_calendar' |'view_all_calendars' |'view_tasks' |'view_all_tasks' |'view_marketing' |'view_documents' |'view_syndication' |'view_bulk_import' |'view_analytics' |'view_settings' |'view_users' |'view_blog' |'manage_users' |'view_property_owners';

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
    'view_blog', 'view_settings', 'view_property_owners',
  ],
  agent: [
    // Agents see only their own records for: dashboard, contacts, leads, deals, calendar, tasks
    // Properties and projects are visible to all agents (but owner/unit info restricted)
    'view_dashboard', 'view_contacts', 'view_leads',
    'view_properties', 'view_projects',
    'view_deals', 'view_calendar', 'view_tasks',
    // NOTE: No view_all_* permissions — agents are scoped to their own records
  ],
};

const mockUsers: RoleUser[] = [
  { id: '1', name: 'CEO Admin', email: 'ceo@luxestate.com', role: 'super_admin', avatar: 'C' },
  { id: '2', name: 'Admin Manager', email: 'admin@luxestate.com', role: 'admin', avatar: 'A' },
  { id: '3', name: 'Marketing Team', email: 'marketing@luxestate.com', role: 'marketing', avatar: 'M' },
  { id: '4', name: 'Sarah Mitchell', email: 'sarah@luxestate.com', role: 'agent', avatar: 'S' },
];

export const mockUsersList = mockUsers;

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<RoleUser>(mockUsers[0]);

  const can = (permission: Permission): boolean => {
    return rolePermissions[currentUser.role]?.includes(permission) ?? false;
  };

  const isRole = (...roles: UserRole[]): boolean => {
    return roles.includes(currentUser.role);
  };

  const isAgentScoped = currentUser.role === 'agent';

  const canViewAll = currentUser.role !== 'agent';

  const isAssignedAgent = (recordAgentName: string | undefined | null): boolean => {
    if (!isAgentScoped) return true; // non-agents always have access
    if (!recordAgentName) return false;
    return recordAgentName.toLowerCase().trim() === currentUser.name.toLowerCase().trim();
  };

  const canEditProperty = (recordAgentName: string | undefined | null): boolean => {
    if (!isAgentScoped) return true; // marketing, admin, super_admin can always edit
    return isAssignedAgent(recordAgentName); // agents only if assigned
  };

  const canEditProject = currentUser.role !== 'agent'; // agents cannot edit any project

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser, can, isRole, isAgentScoped, canViewAll, isAssignedAgent, canEditProperty, canEditProject }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
