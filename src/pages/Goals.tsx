import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { useOrganizationStore } from '@/stores/organizationStore';
import { evaluateSmartGoal } from '@/utils/smartValidator';
import { Plus, Search, Filter, Target, Calendar, User, TrendingUp } from 'lucide-react';
import type { Goal, GoalStatus, GoalPeriod } from '@/types';

export default function Goals() {
  const { currentUser } = useAuthStore();
  const { goals, getGoalsByOrgUnit, getGoalById } = useGoalsStore();
  const { getOrgUnitById, getUsersByOrgUnit } = useOrganizationStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'ALL'>('ALL');
  const [periodFilter, setPeriodFilter] = useState<GoalPeriod | 'ALL'>('ALL');

  // Get goals based on user permissions
  const userGoals = useMemo(() => {
    if (!currentUser) return [];
    
    // Admin sees all goals, others see their own + parent goals
    if (currentUser.role === 'ADMIN') {
      return goals;
    }
    
    const ownGoals = getGoalsByOrgUnit(currentUser.orgUnitId);
    return ownGoals;
  }, [currentUser, goals, getGoalsByOrgUnit]);

  // Apply filters
  const filteredGoals = useMemo(() => {
    let filtered = userGoals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(goal => goal.status === statusFilter);
    }

    // Period filter
    if (periodFilter !== 'ALL') {
      filtered = filtered.filter(goal => goal.period === periodFilter);
    }

    return filtered;
  }, [userGoals, searchTerm, statusFilter, periodFilter]);

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'warning';
      case 'DONE': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'secondary';
    }
  };

  const getPeriodColor = (period: GoalPeriod) => {
    switch (period) {
      case 'ANUAL': return 'brand-gold';
      case 'TRIMESTRAL': return 'primary';
      case 'MENSUAL': return 'secondary';
      default: return 'muted';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Objetivos</h1>
          <p className="text-muted-foreground">
            Gestiona y evalúa objetivos SMART de la organización
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/goals/new">
            <Plus className="w-4 h-4" />
            Nuevo Objetivo
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar objetivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as GoalStatus | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="DONE">Completado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as GoalPeriod | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los períodos</SelectItem>
                  <SelectItem value="ANUAL">Anual</SelectItem>
                  <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                  <SelectItem value="MENSUAL">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay objetivos</h3>
                <p className="mb-4">
                  {searchTerm || statusFilter !== 'ALL' || periodFilter !== 'ALL' 
                    ? 'No se encontraron objetivos con los filtros aplicados'
                    : 'Aún no tienes objetivos definidos'
                  }
                </p>
                <Button asChild>
                  <Link to="/goals/new">Crear primer objetivo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map(goal => {
            const orgUnit = getOrgUnitById(goal.orgUnitId);
            const owner = getUsersByOrgUnit(goal.orgUnitId).find(u => u.id === goal.ownerUserId);
            const parentGoal = goal.parentGoalId ? getGoalById(goal.parentGoalId) : undefined;
            const evaluation = evaluateSmartGoal(goal, parentGoal);
            
            return (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{goal.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {goal.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Badge variant="outline" className={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                      <Badge variant="outline" className={getPeriodColor(goal.period)}>
                        {goal.period}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {owner?.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {orgUnit?.name}
                    </div>
                  </div>

                  {/* Metrics */}
                  {goal.metrics.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Métricas</h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {goal.metrics.slice(0, 2).map((metric, index) => (
                          <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                            <span className="font-medium">{metric.name}:</span>
                            {' '}
                            {metric.baseline !== undefined && `${metric.baseline} → `}
                            {metric.target} {metric.unit}
                          </div>
                        ))}
                      </div>
                      {goal.metrics.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{goal.metrics.length - 2} métricas más
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {goal.tags && goal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {goal.tags.slice(0, 5).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {goal.tags.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{goal.tags.length - 5} más
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* SMART Scores */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>SMART:</span>
                        <Badge 
                          variant="secondary"
                          className={evaluation.smartScore >= 70 ? 'bg-success text-success-foreground' : 
                                   evaluation.smartScore >= 50 ? 'bg-warning text-warning-foreground' : 
                                   'bg-error text-error-foreground'}
                        >
                          {evaluation.smartScore}/100
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Alineación:</span>
                        <Badge 
                          variant="secondary"
                          className={evaluation.alignmentScore >= 70 ? 'bg-success text-success-foreground' : 
                                   evaluation.alignmentScore >= 50 ? 'bg-warning text-warning-foreground' : 
                                   'bg-error text-error-foreground'}
                        >
                          {evaluation.alignmentScore}/100
                        </Badge>
                      </div>
                    </div>
                    
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/goals/${goal.id}`}>Ver detalle</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}