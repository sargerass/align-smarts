// Organizational structure types
export type OrgUnitType = "COMPANY" | "C_LEVEL" | "VP" | "GERENCIA" | "EQUIPO" | "INDIVIDUAL";

export type OrgUnit = {
  id: string;
  name: string;
  type: OrgUnitType;
  parentId?: string;
  leaderUserId?: string;
};

// User management types
export type UserRole = "ADMIN" | "DIRECTOR" | "VP" | "GERENTE" | "LIDER_EQUIPO" | "COLABORADOR";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgUnitId: string;
  label?: string;
};

// Goal management types
export type GoalPeriod = "ANUAL" | "TRIMESTRAL" | "MENSUAL";
export type GoalStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "ACTIVE" | "DONE" | "CANCELLED";

export type GoalMetric = {
  name: string;
  baseline?: number | string;
  target?: number | string;
  unit?: string;
};

export type ParentGoalAlignment = {
  parentGoalId: string;
  relevanceReason?: string; // Optional field to explain why this goal is relevant to the parent
};

export type Goal = {
  id: string;
  orgUnitId: string;
  title: string;
  description: string;
  ownerUserId: string;
  period: GoalPeriod;
  startDate: string; // ISO date
  endDate: string; // ISO date
  metrics: GoalMetric[];
  parentGoalAlignments?: ParentGoalAlignment[]; // Multiple parent goal alignments
  tags?: string[];
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  plans?: GoalPlan[];
  reviews?: GoalReview[];
  // Legacy support
  parentGoalId?: string; // Keep for backward compatibility
};

export type GoalPlan = {
  id: string;
  goalId: string;
  title: string;
  description: string;
  dueDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
};

export type GoalReview = {
  id: string;
  goalId: string;
  reviewDate: string;
  progress: number; // 0-100
  status: "ON_TRACK" | "AT_RISK" | "BEHIND" | "AHEAD";
  achievements: string[];
  challenges: string[];
  nextActions: string[];
  reviewerUserId: string;
  notes?: string;
  createdAt: string;
};

// SMART validation types
export type SMARTCriteria = "S" | "M" | "A" | "R" | "T";

export type SMARTCriteriaResult = {
  ok: boolean;
  message: string;
  score: number; // 0-20 for each criteria
};

export type SmartFeedback = {
  smartScore: number; // 0-100
  breakdown: Record<SMARTCriteria, SMARTCriteriaResult>;
  alignmentScore: number; // 0-100
  alignmentNotes: string[];
  overallGrade: "excellent" | "good" | "needs-work" | "poor";
};

// Application state types
export type AuthState = {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
};

export type OrganizationState = {
  orgUnits: OrgUnit[];
  users: User[];
  setOrgUnits: (units: OrgUnit[]) => void;
  setUsers: (users: User[]) => void;
  getUsersByOrgUnit: (orgUnitId: string) => User[];
  getOrgUnitById: (id: string) => OrgUnit | undefined;
  getParentOrgUnit: (orgUnitId: string) => OrgUnit | undefined;
  getChildOrgUnits: (parentId: string) => OrgUnit[];
};

export type GoalsState = {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  getGoalsByOrgUnit: (orgUnitId: string) => Goal[];
  getGoalById: (id: string) => Goal | undefined;
  getParentGoals: (orgUnitId: string) => Goal[];
  getChildGoals: (parentGoalId: string) => Goal[];
};

// Dashboard metrics
export type DashboardMetrics = {
  totalGoals: number;
  activeGoals: number;
  avgSmartScore: number;
  avgAlignmentScore: number;
  goalsByStatus: Record<GoalStatus, number>;
  improvementTrend: number; // percentage change
};