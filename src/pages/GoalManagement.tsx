import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGoalsStore } from '@/stores/goalsStore';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus,
  Target,
  TrendingUp,
  FileText,
  ArrowLeft
} from 'lucide-react';
import type { GoalPlan, GoalReview } from '@/types';

export default function GoalManagement() {
  const { goalId } = useParams<{ goalId: string }>();
  const { getGoalById } = useGoalsStore();
  const [activeTab, setActiveTab] = useState('overview');
  
  const goal = goalId ? getGoalById(goalId) : undefined;

  if (!goal) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Objetivo no encontrado</h1>
          <Button asChild>
            <Link to="/goals">Volver a objetivos</Link>
          </Button>
        </div>
      </div>
    );
  }

  const plans = goal.plans || [];
  const reviews = goal.reviews || [];
  
  const completedPlans = plans.filter(p => p.status === 'COMPLETED').length;
  const totalPlans = plans.length;
  const planProgress = totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0;

  const latestReview = reviews.sort((a, b) => 
    new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()
  )[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': case 'ON_TRACK': return 'success';
      case 'IN_PROGRESS': case 'AHEAD': return 'primary';
      case 'PENDING': case 'AT_RISK': return 'warning';
      case 'BLOCKED': case 'BEHIND': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'primary';
      case 'LOW': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/goals">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{goal.title}</h1>
            <p className="text-muted-foreground">Gestión de objetivo</p>
          </div>
        </div>
        <Badge variant="outline" className={getStatusColor(goal.status)}>
          {goal.status}
        </Badge>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Progreso de planes</p>
                <p className="text-2xl font-bold">{Math.round(planProgress)}%</p>
              </div>
            </div>
            <Progress value={planProgress} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Planes completados</p>
                <p className="text-2xl font-bold">{completedPlans}/{totalPlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Revisiones</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Última revisión</p>
                <p className="text-sm font-medium">
                  {latestReview ? (
                    <Badge variant="outline" className={getStatusColor(latestReview.status)}>
                      {latestReview.status}
                    </Badge>
                  ) : 'Sin revisiones'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="plans">Planes ({plans.length})</TabsTrigger>
          <TabsTrigger value="reviews">Revisiones ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción del Objetivo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{goal.description}</p>
              
              {goal.metrics.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Métricas</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {goal.metrics.map((metric, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{metric.name}:</span>
                        {' '}
                        {metric.baseline !== undefined && `${metric.baseline} → `}
                        {metric.target} {metric.unit}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {latestReview && (
            <Card>
              <CardHeader>
                <CardTitle>Última Revisión</CardTitle>
                <CardDescription>
                  {new Date(latestReview.reviewDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Progreso:</span>
                    <Badge variant="secondary">{latestReview.progress}%</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge variant="outline" className={getStatusColor(latestReview.status)}>
                      {latestReview.status}
                    </Badge>
                  </div>
                </div>
                
                <Progress value={latestReview.progress} />
                
                {latestReview.achievements.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Logros recientes</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {latestReview.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Planes de Acción</h3>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Plan
            </Button>
          </div>

          {plans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay planes definidos</h3>
                <p className="text-muted-foreground mb-4">
                  Crea planes de acción para estructurar el logro de este objetivo
                </p>
                <Button>Crear primer plan</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{plan.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Vence: {new Date(plan.dueDate).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge variant="outline" className={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(plan.priority)}>
                          {plan.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Revisiones Periódicas</h3>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Revisión
            </Button>
          </div>

          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay revisiones registradas</h3>
                <p className="text-muted-foreground mb-4">
                  Las revisiones periódicas te ayudan a hacer seguimiento del progreso
                </p>
                <Button>Crear primera revisión</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Revisión del {new Date(review.reviewDate).toLocaleDateString('es-ES')}
                      </CardTitle>
                      <Badge variant="outline" className={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Progreso: {review.progress}%</span>
                      <Progress value={review.progress} className="flex-1" />
                    </div>

                    {review.achievements.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Logros</h5>
                        <ul className="text-sm space-y-1">
                          {review.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {review.challenges.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Desafíos</h5>
                        <ul className="text-sm space-y-1">
                          {review.challenges.map((challenge, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {review.nextActions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Próximas acciones</h5>
                        <ul className="text-sm space-y-1">
                          {review.nextActions.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Clock className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {review.notes && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Notas adicionales</h5>
                        <p className="text-sm text-muted-foreground">{review.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}