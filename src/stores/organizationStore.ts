import { create } from 'zustand';
import type { OrganizationState, OrgUnit, User } from '@/types';
import { seedOrgUnits, seedUsers } from '@/data/seedData';

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  orgUnits: seedOrgUnits,
  users: seedUsers,

  setOrgUnits: (units: OrgUnit[]) => set({ orgUnits: units }),
  
  setUsers: (users: User[]) => set({ users }),

  getUsersByOrgUnit: (orgUnitId: string): User[] => {
    return get().users.filter(user => user.orgUnitId === orgUnitId);
  },

  getOrgUnitById: (id: string): OrgUnit | undefined => {
    return get().orgUnits.find(unit => unit.id === id);
  },

  getParentOrgUnit: (orgUnitId: string): OrgUnit | undefined => {
    const currentUnit = get().getOrgUnitById(orgUnitId);
    if (!currentUnit?.parentId) return undefined;
    return get().getOrgUnitById(currentUnit.parentId);
  },

  getChildOrgUnits: (parentId: string): OrgUnit[] => {
    return get().orgUnits.filter(unit => unit.parentId === parentId);
  },
}));