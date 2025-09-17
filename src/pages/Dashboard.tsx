import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/authStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { useOrganizationStore } from '@/stores/organizationStore';
import { evaluateSmartGoal } from '@/utils/smartValidator';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, Users, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import type { DashboardMetrics, Goal } from '@/types';
import { Input } from '@/components/ui/input';

export default function Dashboard() {
  const { currentUser } = useAuthStore();
  const { goals, getGoalsByOrgUnit, getParentGoals, getGoalById } = useGoalsStore();
  const { getOrgUnitById, getParentOrgUnit } = useOrganizationStore();

  const userOrgUnit = currentUser ? getOrgUnitById(currentUser.orgUnitId) : null;
  const parentOrgUnit = currentUser ? getParentOrgUnit(currentUser.orgUnitId) : null;

  // Get goals relevant to current user
  const userGoals = currentUser ? getGoalsByOrgUnit(currentUser.orgUnitId) : [];
  const parentGoals = currentUser ? getParentGoals(currentUser.orgUnitId) : [];

  // Get team goals that need review (if user is manager/leader)
  const teamGoalsToReview = useMemo(() => {
    if (!currentUser || !['GERENTE', 'LIDER_EQUIPO', 'VP', 'C_LEVEL'].includes(currentUser.role)) {
      return [];
    }

    // Get all child org units
    const { getChildOrgUnits, getUsersByOrgUnit } = useOrganizationStore.getState();
    const childUnits = getChildOrgUnits(currentUser.orgUnitId);
    const childUsers = childUnits.flatMap(unit => getUsersByOrgUnit(unit.id));

    // Get goals from team members that need review
    return goals.filter(goal =>
      childUsers.some(user => user.id === goal.ownerUserId) &&
      ['IN_REVIEW'].includes(goal.status)
    );
  }, [currentUser, goals]);

  // Calculate dashboard metrics
  const dashboardMetrics: DashboardMetrics = useMemo(() => {
    const totalGoals = userGoals.length;
    const activeGoals = userGoals.filter(goal => goal.status === 'ACTIVE').length;

    // Calculate average SMART scores
    let totalSmartScore = 0;
    let totalAlignmentScore = 0;
    let validEvaluations = 0;

    userGoals.forEach(goal => {
      const parentGoal = goal.parentGoalId ? getGoalById(goal.parentGoalId) : undefined;
      const evaluation = evaluateSmartGoal(goal, parentGoal);
      totalSmartScore += evaluation.smartScore;
      totalAlignmentScore += evaluation.alignmentScore;
      validEvaluations++;
    });

    const avgSmartScore = validEvaluations > 0 ? Math.round(totalSmartScore / validEvaluations) : 0;
    const avgAlignmentScore = validEvaluations > 0 ? Math.round(totalAlignmentScore / validEvaluations) : 0;

    const goalsByStatus = {
      DRAFT: userGoals.filter(g => g.status === 'DRAFT').length,
      IN_REVIEW: userGoals.filter(g => g.status === 'IN_REVIEW').length,
      APPROVED: userGoals.filter(g => g.status === 'APPROVED').length,
      ACTIVE: userGoals.filter(g => g.status === 'ACTIVE').length,
      DONE: userGoals.filter(g => g.status === 'DONE').length,
      CANCELLED: userGoals.filter(g => g.status === 'CANCELLED').length,
    };

    // Simple improvement trend (could be enhanced with historical data)
    const improvementTrend = avgSmartScore > 70 ? 15 : avgSmartScore > 50 ? 5 : -5;

    return {
      totalGoals,
      activeGoals,
      avgSmartScore,
      avgAlignmentScore,
      goalsByStatus,
      improvementTrend,
    };
  }, [userGoals, getGoalById]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'APPROVED': return 'success';
      case 'DRAFT': return 'secondary';
      case 'IN_REVIEW': return 'warning';
      case 'DONE': return 'success';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'DRAFT': return <Clock className="w-4 h-4" />;
      case 'IN_REVIEW': return <Clock className="w-4 h-4" />;
      case 'DONE': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <AlertTriangle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {userOrgUnit?.name} · {currentUser.name}
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/goals/new">
            <Plus className="w-4 h-4" />
            Nuevo Objetivo
          </Link>
        </Button>
      </div>


      <div className="grid lg:grid-cols-2 gap-6">
        {/* User's Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Mis Objetivos
            </CardTitle>
            <CardDescription>
              Objetivos de {userOrgUnit?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userGoals.length === 0 ? (
              <>
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes objetivos definidos aún</p>
                  <Button asChild className="mt-3" variant="outline">
                    <Link to="/goals/new">Crear primer objetivo</Link>
                  </Button>
                </div>
                {/* Sample data to show layout */}
                <div className="space-y-2 p-3 rounded-lg border opacity-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">Incrementar ventas del equipo en 25%</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        Desarrollar estrategias de venta para alcanzar el objetivo trimestral...
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      <CheckCircle className="w-4 h-4" />
                      ACTIVE
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span>SMART:</span>
                      <Badge variant="secondary">85/100</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Alineación:</span>
                      <Badge variant="secondary">92/100</Badge>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              userGoals.slice(0, 3).map(goal => {
                const parentGoal = goal.parentGoalId ? getGoalById(goal.parentGoalId) : undefined;
                const evaluation = evaluateSmartGoal(goal, parentGoal);

                return (
                  <div key={goal.id} className="space-y-2 p-3 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {goal.description}
                        </p>
                      </div>
                      <Badge variant="outline" className={`ml-2 ${getStatusColor(goal.status)}`}>
                        {getStatusIcon(goal.status)}
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span>SMART:</span>
                        <Badge variant="secondary">{evaluation.smartScore}/100</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Alineación:</span>
                        <Badge variant="secondary">{evaluation.alignmentScore}/100</Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {userGoals.length > 3 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/goals">Ver todos los objetivos</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Parent Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Objetivos Superiores
            </CardTitle>
            <CardDescription>
              Objetivos de {parentOrgUnit?.name || 'la organización'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parentGoals.length === 0 ? (
              <>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay objetivos superiores definidos</p>
                </div>
                {/* Sample data to show layout */}
                <div className="space-y-2 p-3 rounded-lg border bg-accent/10 opacity-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">Expansión de mercado regional</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        Alcanzar nuevos mercados en la región para aumentar participación...
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      TRIMESTRAL
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">Crecimiento</Badge>
                    <Badge variant="secondary" className="text-xs">Ventas</Badge>
                  </div>
                </div>
              </>
            ) : (
              parentGoals.slice(0, 3).map(goal => (
                <div key={goal.id} className="space-y-2 p-3 rounded-lg border bg-accent/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {goal.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {goal.period}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {goal.tags?.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Goals Section - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Objetivos de Mi Equipo
          </CardTitle>
          <CardDescription>
            Objetivos aprobados y pendientes de revisión de tu equipo
            <br />
            <br />
            <div className='flex'>
              <input type="checkbox" id='show-pending' className='mr-2' /> <label htmlFor="show-pending">
                Mostrar solo objetivos pendientes de revisión
              </label>
            </div>
          </CardDescription>
          <CardFooter className="pt-0">

          </CardFooter>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamGoalsToReview.length === 0 ? (
            <>
              {/* Sample data to show layout */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">Mejorar satisfacción del cliente</h4>
                      <p className="text-sm text-muted-foreground">
                        Por: María González
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        Implementar sistema de seguimiento para mejorar la experiencia...
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800">
                      <Clock className="w-3 h-3 mr-1" />
                      En Revisión
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      Aprobar
                    </Button>
                    <Button size="sm" variant="outline">
                      Solicitar Cambios
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">Reducir tiempo de respuesta</h4>
                      <p className="text-sm text-muted-foreground">
                        Por: Carlos Ruiz
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        Optimizar procesos internos para responder más rápido...
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aprobado
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      Ver Progreso
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">Capacitación del equipo</h4>
                    <p className="text-sm text-muted-foreground">
                      Por: Ana Torres
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Plan de capacitación para mejorar habilidades técnicas...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline">
                      Aprobar
                    </Button>
                    <Button size="sm" variant="outline">
                      Solicitar Cambios
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamGoalsToReview.map(goal => {
                const goalOwner = useOrganizationStore.getState().users.find(u => u.id === goal.ownerUserId);

                return (
                  <div key={goal.id} className="space-y-2 p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Por: {goalOwner?.name}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {goal.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        <Clock className="w-3 h-3 mr-1" />
                        En Revisión
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        Aprobar
                      </Button>
                      <Button size="sm" variant="outline">
                        Solicitar Cambios
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {teamGoalsToReview.length > 6 && (
            <Button asChild variant="outline" className="w-full">
              <Link to="/goals?filter=team-review">Ver todos los objetivos pendientes</Link>
            </Button>
          )}
        </CardContent>
      </Card>

    </div>
  );
}