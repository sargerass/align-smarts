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
import { ArrowLeft, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import type { Goal, GoalMetric, SmartFeedback, ParentGoalAlignment } from '@/types';

const goalSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  period: z.enum(['ANUAL', 'TRIMESTRAL', 'MENSUAL']),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
});

type FormData = z.infer<typeof goalSchema>;

export default function CreateGoal() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { addGoal, getParentGoals, getGoalById } = useGoalsStore();
  const { getOrgUnitById } = useOrganizationStore();
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<GoalMetric[]>([{ name: '', target: '', unit: '' }]);
  const [parentAlignments, setParentAlignments] = useState<ParentGoalAlignment[]>([]);
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
    },
  });

  const userOrgUnit = currentUser ? getOrgUnitById(currentUser.orgUnitId) : null;
  const parentGoals = currentUser ? getParentGoals(currentUser.orgUnitId) : [];

  // Real-time AI validation
  useEffect(() => {
    const subscription = form.watch(async (value) => {
      if (!value.title || !value.description || value.title.length < 5) {
        setFeedback(undefined);
        return;
      }

      const currentValues = JSON.stringify({ 
        title: value.title, 
        description: value.description,
        metrics,
        tags: selectedTags,
        parentAlignments 
      });

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
          parentGoalAlignments: parentAlignments,
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const aiFeedback = await simulateAIValidation(tempGoal);
        setFeedback(aiFeedback);
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, metrics, selectedTags, parentAlignments, currentUser, lastValidation]);

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

  const addParentAlignment = () => {
    setParentAlignments([...parentAlignments, { parentGoalId: '', relevanceReason: '' }]);
  };

  const updateParentAlignment = (index: number, field: keyof ParentGoalAlignment, value: string) => {
    const newAlignments = [...parentAlignments];
    newAlignments[index] = { ...newAlignments[index], [field]: value };
    setParentAlignments(newAlignments);
  };

  const removeParentAlignment = (index: number) => {
    setParentAlignments(parentAlignments.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const onSubmit = async (data: FormData, status: 'DRAFT' | 'IN_REVIEW' = 'DRAFT') => {
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
      parentGoalAlignments: parentAlignments.filter(a => a.parentGoalId),
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addGoal(newGoal);

    const statusText = status === 'DRAFT' ? 'guardado como borrador' : 'enviado a revisión';
    toast({
      title: "Objetivo creado",
      description: `El objetivo "${data.title}" ha sido ${statusText}`,
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
          <h1 className="text-3xl font-bold">Nuevo Objetivo</h1>
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
              {/* Mi Objetivo */}
              <Card>
                <CardHeader>
                  <CardTitle>Mi Objetivo</CardTitle>
                  <CardDescription>
                    No olvides revistar tu objetivo antes de enviarlo a Borrador
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
                            placeholder="Tu título relaciona tu objetivo para que luzca y se vea como un Borrador."
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
                        <FormLabel>Objetivo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Explícanos de tu idea completamente así te ayudamos con la vinculación, características y funcionalidades que no hemos visto anteriormente..."
                            className="min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-3 gap-4">
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

              {/* Objetivos Padre */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Objetivos Padre
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addParentAlignment}
                      disabled={parentGoals.length === 0}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Objetivo Padre
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Selecciona objetivos superiores con los que se alinea tu objetivo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {parentGoals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay objetivos superiores disponibles para alineación</p>
                    </div>
                  ) : (
                    <>
                      {parentAlignments.map((alignment, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Objetivo Padre</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeParentAlignment(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium">Seleccionar Objetivo (Borrador)</label>
                                <Select 
                                  value={alignment.parentGoalId} 
                                  onValueChange={(value) => updateParentAlignment(index, 'parentGoalId', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar objetivo padre..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {parentGoals.map(goal => (
                                      <SelectItem key={goal.id} value={goal.id}>
                                        {goal.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">(Opcional) Por qué es objetivo es relevante para el objetivo padre?</label>
                                <Textarea
                                  placeholder="Explícanos de tu idea completamente así te ayudamos con la vinculación, características y funcionalidades que no hemos visto anteriormente..."
                                  className="min-h-20 mt-2"
                                  value={alignment.relevanceReason || ''}
                                  onChange={(e) => updateParentAlignment(index, 'relevanceReason', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </>
                  )}
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

              {/* Team Alignment */}
              <Card>
                <CardHeader>
                  <CardTitle>Conectar con mi Equipo</CardTitle>
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
                        {selectedTags.includes(tag) && <X className="w-3 h-3 mr-1" />}
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
                  onClick={form.handleSubmit((data) => onSubmit(data, 'DRAFT'))}
                  disabled={!form.formState.isValid}
                >
                  Guardar Borrador
                </Button>
                <Button 
                  type="button" 
                  onClick={form.handleSubmit((data) => onSubmit(data, 'IN_REVIEW'))}
                  disabled={!form.formState.isValid}
                >
                  Enviar a Aprobación
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