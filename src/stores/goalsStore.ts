import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GoalsState, Goal } from '@/types';
import { seedGoals } from '@/data/seedData';
import { useOrganizationStore } from './organizationStore';

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: seedGoals,

      setGoals: (goals: Goal[]) => set({ goals }),

      addGoal: (goal: Goal) => {
        set(state => ({ 
          goals: [...state.goals, goal] 
        }));
      },

      updateGoal: (goalId: string, updates: Partial<Goal>) => {
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === goalId 
              ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
              : goal
          )
        }));
      },

      deleteGoal: (goalId: string) => {
        set(state => ({
          goals: state.goals.filter(goal => goal.id !== goalId)
        }));
      },

      getGoalsByOrgUnit: (orgUnitId: string): Goal[] => {
        return get().goals.filter(goal => goal.orgUnitId === orgUnitId);
      },

      getGoalById: (id: string): Goal | undefined => {
        return get().goals.find(goal => goal.id === id);
      },

      getParentGoals: (orgUnitId: string): Goal[] => {
        // Get parent org unit and return its ACTIVE goals
        const orgStore = useOrganizationStore.getState();
        const parentUnit = orgStore.getParentOrgUnit(orgUnitId);
        
        if (!parentUnit) return [];
        
        return get().goals.filter(goal => 
          goal.orgUnitId === parentUnit.id && goal.status === 'ACTIVE'
        );
      },

      getChildGoals: (parentGoalId: string): Goal[] => {
        return get().goals.filter(goal => goal.parentGoalId === parentGoalId);
      },
    }),
    {
      name: 'acelera-goals',
    }
  )
);