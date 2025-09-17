import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/authStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { useOrganizationStore } from '@/stores/organizationStore';
import { evaluateSmartGoal } from '@/utils/smartValidator';
import { TrendingUp, Target, BarChart3, PieChart, Activity } from 'lucide-react';

export default function Analytics() {
  const { currentUser } = useAuthStore();
  const { goals, getGoalsByOrgUnit, getGoalById } = useGoalsStore();
  const { orgUnits, getOrgUnitById } = useOrganizationStore();

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!currentUser) return null;

    const userOrgUnit = getOrgUnitById(currentUser.orgUnitId);
    const userGoals = getGoalsByOrgUnit(currentUser.orgUnitId);

    // Calculate SMART scores improvement simulation
    const smartScores = userGoals.map(goal => {
      const parentGoal = goal.parentGoalId ? getGoalById(goal.parentGoalId) : undefined;
      return evaluateSmartGoal(goal, parentGoal);
    });

    const avgSmartScore = smartScores.length > 0
      ? Math.round(smartScores.reduce((sum, s) => sum + s.smartScore, 0) / smartScores.length)
      : 0;

    const avgAlignmentScore = smartScores.length > 0
      ? Math.round(smartScores.reduce((sum, s) => sum + s.alignmentScore, 0) / smartScores.length)
      : 0;

    // SMART criteria breakdown
    const smartBreakdown = {
      S: Math.round(smartScores.reduce((sum, s) => sum + s.breakdown.S.score, 0) / Math.max(smartScores.length, 1)),
      M: Math.round(smartScores.reduce((sum, s) => sum + s.breakdown.M.score, 0) / Math.max(smartScores.length, 1)),
      A: Math.round(smartScores.reduce((sum, s) => sum + s.breakdown.A.score, 0) / Math.max(smartScores.length, 1)),
      R: Math.round(smartScores.reduce((sum, s) => sum + s.breakdown.R.score, 0) / Math.max(smartScores.length, 1)),
      T: Math.round(smartScores.reduce((sum, s) => sum + s.breakdown.T.score, 0) / Math.max(smartScores.length, 1)),
    };

    // Goal distribution
    const statusDistribution = {
      DRAFT: userGoals.filter(g => g.status === 'DRAFT').length,
      ACTIVE: userGoals.filter(g => g.status === 'ACTIVE').length,
      DONE: userGoals.filter(g => g.status === 'DONE').length,
      CANCELLED: userGoals.filter(g => g.status === 'CANCELLED').length,
    };

    const periodDistribution = {
      ANUAL: userGoals.filter(g => g.period === 'ANUAL').length,
      TRIMESTRAL: userGoals.filter(g => g.period === 'TRIMESTRAL').length,
      MENSUAL: userGoals.filter(g => g.period === 'MENSUAL').length,
    };

    // Simulate improvement trends (in a real app, this would be historical data)
    const improvementData = [
      { month: 'Ene', smart: 45, alignment: 40 },
      { month: 'Feb', smart: 52, alignment: 48 },
      { month: 'Mar', smart: 61, alignment: 55 },
      { month: 'Abr', smart: 68, alignment: 62 },
      { month: 'May', smart: avgSmartScore, alignment: avgAlignmentScore },
    ];

    // Organizational overview (for admins)
    const orgOverview = currentUser.role === 'ADMIN' ? {
      totalUnits: orgUnits.length,
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'ACTIVE').length,
      avgOrgSmartScore: Math.round(
        goals.reduce((sum, goal) => {
          const parentGoal = goal.parentGoalId ? getGoalById(goal.parentGoalId) : undefined;
          return sum + evaluateSmartGoal(goal, parentGoal).smartScore;
        }, 0) / Math.max(goals.length, 1)
      ),
    } : null;

    return {
      userOrgUnit,
      userGoals,
      avgSmartScore,
      avgAlignmentScore,
      smartBreakdown,
      statusDistribution,
      periodDistribution,
      improvementData,
      orgOverview,
    };
  }, [currentUser, getOrgUnitById, getGoalsByOrgUnit, getGoalById, orgUnits, goals]);

  if (!currentUser || !analytics) return null;

  const {
    userOrgUnit,
    userGoals,
    avgSmartScore,
    avgAlignmentScore,
    smartBreakdown,
    statusDistribution,
    periodDistribution,
    improvementData,
    orgOverview
  } = analytics;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Análisis de progreso y calidad de objetivos SMART
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score SMART Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSmartScore}/100</div>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className={getScoreColor(avgSmartScore)}>
                {avgSmartScore >= 80 ? 'Excelente' : avgSmartScore >= 60 ? 'Bueno' : 'Necesita mejora'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alineación Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAlignmentScore}/100</div>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className={getScoreColor(avgAlignmentScore)}>
                {avgAlignmentScore >= 80 ? 'Excelente' : avgAlignmentScore >= 60 ? 'Bueno' : 'Necesita mejora'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objetivos Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusDistribution.ACTIVE}</div>
            <p className="text-xs text-muted-foreground">
              de {userGoals.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusDistribution.DONE}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((statusDistribution.DONE / Math.max(userGoals.length, 1)) * 100)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* SMART Criteria Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Desglose SMART
            </CardTitle>
            <CardDescription>
              Puntuación promedio por criterio SMART
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(smartBreakdown).map(([criteria, score]) => {
              const criteriaNames = {
                S: 'Específico',
                M: 'Medible',
                A: 'Alcanzable',
                R: 'Relevante',
                T: 'Tiempo definido'
              };

              const normalizedScore = Math.round((score / 20) * 100);

              return (
                <div key={criteria} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {criteria} - {criteriaNames[criteria as keyof typeof criteriaNames]}
                    </span>
                    <Badge variant="outline">{normalizedScore}%</Badge>
                  </div>
                  <Progress value={normalizedScore} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>


        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Distribución por Estado
            </CardTitle>
            <CardDescription>
              Estados actuales de tus objetivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const total = Object.values(statusDistribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

              const statusLabels = {
                DRAFT: 'Borrador',
                ACTIVE: 'Activo',
                DONE: 'Completado',
                CANCELLED: 'Cancelado'
              };

              const statusColors = {
                DRAFT: 'warning',
                ACTIVE: 'success',
                DONE: 'success',
                CANCELLED: 'error'
              };

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[status as keyof typeof statusColors]}>
                      {statusLabels[status as keyof typeof statusLabels]}
                    </Badge>
                    <span className="text-sm">{count} objetivos</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{percentage}%</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>

      {/* Organization Overview (Admin only) */}
      {orgOverview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Vista Organizacional
            </CardTitle>
            <CardDescription>
              Métricas globales de la organización (solo administradores)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-gold">{orgOverview.totalUnits}</div>
                <p className="text-sm text-muted-foreground">Unidades Organizacionales</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{orgOverview.totalGoals}</div>
                <p className="text-sm text-muted-foreground">Objetivos Totales</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{orgOverview.activeGoals}</div>
                <p className="text-sm text-muted-foreground">Objetivos Activos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{orgOverview.avgOrgSmartScore}/100</div>
                <p className="text-sm text-muted-foreground">Score SMART Org.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}