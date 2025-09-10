import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SmartChecklist } from '@/components/SmartChecklist';
import { useAuthStore } from '@/stores/authStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { useOrganizationStore } from '@/stores/organizationStore';
import { simulateAIValidation } from '@/utils/smartValidator';
import { useToast } from '@/hooks/use-toast';
import { commonTags } from '@/data/seedData';
import { ArrowLeft, Plus, X, Loader2, Sparkles } from 'lucide-react';
import type { Goal, GoalMetric, SmartFeedback } from '@/types';

const goalSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  period: z.enum(['ANUAL', 'TRIMESTRAL', 'MENSUAL']),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
  parentGoalId: z.string().optional(),
});

type FormData = z.infer<typeof goalSchema>;

export default function CreateGoal() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { addGoal, getParentGoals, getGoalById } = useGoalsStore();
  const { getOrgUnitById } = useOrganizationStore();
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<GoalMetric[]>([{ name: '', target: '', unit: '' }]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<SmartFeedback | undefined>();
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      period: 'TRIMESTRAL',
      startDate: '',
      endDate: '',
      parentGoalId: undefined,
    },
  });

  const userOrgUnit = currentUser ? getOrgUnitById(currentUser.orgUnitId) : null;
  const parentGoals = currentUser ? getParentGoals(currentUser.orgUnitId) : [];

  // Real-time AI validation
  useEffect(() => {
    const subscription = form.watch(async (value) => {
      // Only validate if we have minimum required data
      if (!value.title || !value.description || value.title.length < 5) {
        setFeedback(undefined);
        return;
      }

      const currentValues = JSON.stringify({ 
        title: value.title, 
        description: value.description,
        metrics,
        tags: selectedTags,
        parentGoalId: value.parentGoalId 
      });

      // Avoid re-validating the same content
      if (currentValues === lastValidation) return;
      
      setLastValidation(currentValues);
      setIsValidating(true);

      try {
        const tempGoal: Goal = {
          id: 'temp',
          orgUnitId: currentUser!.orgUnitId,
          title: value.title || '',
          description: value.description || '',
          ownerUserId: currentUser!.id,
          period: value.period || 'TRIMESTRAL',
          startDate: value.startDate || new Date().toISOString(),
          endDate: value.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          metrics: metrics.filter(m => m.name.trim() !== ''),
          tags: selectedTags,
          parentGoalId: value.parentGoalId,
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const parentGoal = value.parentGoalId ? getGoalById(value.parentGoalId) : undefined;
        const aiFeedback = await simulateAIValidation(tempGoal, parentGoal);
        setFeedback(aiFeedback);
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, metrics, selectedTags, currentUser, getGoalById, lastValidation]);

  const addMetric = () => {
    setMetrics([...metrics, { name: '', target: '', unit: '' }]);
  };

  const updateMetric = (index: number, field: keyof GoalMetric, value: string) => {
    const newMetrics = [...metrics];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    setMetrics(newMetrics);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const onSubmit = async (data: FormData) => {
    if (!currentUser) return;

    const validMetrics = metrics.filter(m => m.name.trim() !== '');
    
    if (validMetrics.length === 0) {
      toast({
        title: "Métrica requerida",
        description: "Define al menos una métrica para el objetivo",
        variant: "destructive",
      });
      return;
    }

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      orgUnitId: currentUser.orgUnitId,
      title: data.title,
      description: data.description,
      ownerUserId: currentUser.id,
      period: data.period,
      startDate: data.startDate,
      endDate: data.endDate,
      metrics: validMetrics,
      tags: selectedTags,
      parentGoalId: data.parentGoalId,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addGoal(newGoal);

    toast({
      title: "Objetivo creado",
      description: `El objetivo "${data.title}" ha sido creado exitosamente`,
    });

    navigate('/goals');
  };

  const activateGoal = async (data: FormData) => {
    if (!feedback || feedback.smartScore < 50) {
      toast({
        title: "Calidad insuficiente",
        description: "El objetivo necesita un score SMART mínimo de 50/100 para ser activado",
        variant: "destructive",
      });
      return;
    }

    // Create and activate goal directly
    if (!currentUser) return;

    const validMetrics = metrics.filter(m => m.name.trim() !== '');
    
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      orgUnitId: currentUser.orgUnitId,
      title: data.title,
      description: data.description,
      ownerUserId: currentUser.id,
      period: data.period,
      startDate: data.startDate,
      endDate: data.endDate,
      metrics: validMetrics,
      tags: selectedTags,
      parentGoalId: data.parentGoalId,
      status: 'ACTIVE', // Directly activate
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addGoal(newGoal);

    toast({
      title: "Objetivo activado",
      description: `El objetivo "${data.title}" ha sido creado y activado exitosamente`,
    });

    navigate('/goals');
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Objetivo SMART</h1>
          <p className="text-muted-foreground">
            Crea un objetivo para {userOrgUnit?.name}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <Form {...form}>
            <form className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información básica</CardTitle>
                  <CardDescription>
                    Define los aspectos fundamentales de tu objetivo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del objetivo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Incrementar ventas del equipo en 25%..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción detallada</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe el contexto, metodología y beneficios esperados..."
                            className="min-h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="period"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Período</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MENSUAL">Mensual</SelectItem>
                                <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                                <SelectItem value="ANUAL">Anual</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {parentGoals.length > 0 && (
                      <FormField
                        control={form.control}
                        name="parentGoalId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Objetivo padre</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {parentGoals.map(goal => (
                                    <SelectItem key={goal.id} value={goal.id}>
                                      {goal.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de inicio</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de fin</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Métricas
                    <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                      <Plus className="w-4 h-4" />
                      Agregar
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Define las métricas cuantificables para el objetivo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics.map((metric, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Input
                          placeholder="Nombre de métrica"
                          value={metric.name}
                          onChange={(e) => updateMetric(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Objetivo"
                          value={metric.target}
                          onChange={(e) => updateMetric(index, 'target', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Unidad"
                          value={metric.unit}
                          onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        {metrics.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMetric(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags de alineación</CardTitle>
                  <CardDescription>
                    Selecciona tags que conecten con objetivos superiores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={!form.formState.isValid}
                >
                  Guardar borrador
                </Button>
                <Button 
                  type="button" 
                  onClick={form.handleSubmit(activateGoal)}
                  disabled={!form.formState.isValid || !feedback || feedback.smartScore < 50}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Activar objetivo
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* AI Feedback Panel */}
        <div className="space-y-6">
          <SmartChecklist feedback={feedback} isLoading={isValidating} />
        </div>
      </div>
    </div>
  );
}