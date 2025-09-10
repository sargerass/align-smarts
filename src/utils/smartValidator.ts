import type { Goal, SmartFeedback, SMARTCriteriaResult } from '@/types';

// Action verbs for Specific criteria
const actionVerbs = [
  'incrementar', 'aumentar', 'mejorar', 'reducir', 'implementar', 'desarrollar',
  'lanzar', 'crear', 'establecer', 'optimizar', 'acelerar', 'expandir',
  'consolidar', 'fortalecer', 'construir', 'diseñar', 'ejecutar', 'alcanzar',
  'generar', 'producir', 'entregar', 'completar', 'finalizar'
];

// Helper function to normalize text for comparison
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ' ')
    .trim();
};

// Helper to count words
const countWords = (text: string): number => {
  return normalizeText(text).split(/\s+/).filter(word => word.length > 0).length;
};

// Helper to find common words between texts
const findCommonWords = (text1: string, text2: string): string[] => {
  const words1 = new Set(normalizeText(text1).split(/\s+/));
  const words2 = new Set(normalizeText(text2).split(/\s+/));
  return Array.from(words1).filter(word => words2.has(word) && word.length > 3);
};

// Evaluate Specific criteria
const evaluateSpecific = (goal: Goal): SMARTCriteriaResult => {
  const titleWords = countWords(goal.title);
  const descWords = countWords(goal.description);
  const normalizedTitle = normalizeText(goal.title);
  
  const hasActionVerb = actionVerbs.some(verb => normalizedTitle.includes(verb));
  
  let score = 0;
  let message = '';
  
  if (hasActionVerb) score += 8;
  if (titleWords >= 5) score += 6;
  if (descWords >= 10) score += 6;
  
  if (score >= 18) {
    message = '✓ Específico: Incluye verbo de acción, objeto claro y contexto detallado';
  } else if (score >= 12) {
    message = '⚠ Mejorar especificidad: Agrega más contexto y detalle en la descripción';
  } else {
    message = '✗ Poco específico: Incluye verbo de acción claro, objeto específico y contexto detallado';
  }
  
  return { ok: score >= 15, message, score };
};

// Evaluate Measurable criteria
const evaluateMeasurable = (goal: Goal): SMARTCriteriaResult => {
  let score = 0;
  let message = '';
  
  if (goal.metrics.length === 0) {
    return { ok: false, message: '✗ Sin métricas: Define al menos una métrica cuantificable', score: 0 };
  }
  
  let validMetrics = 0;
  
  for (const metric of goal.metrics) {
    if (metric.target !== undefined && metric.target !== '' && metric.target !== null) {
      validMetrics++;
      score += 8;
    }
    if (metric.unit && metric.unit.trim() !== '') {
      score += 4;
    }
    if (metric.baseline !== undefined && metric.baseline !== '' && metric.baseline !== null) {
      score += 3;
    }
  }
  
  if (score >= 20) {
    message = `✓ Medible: ${validMetrics} métrica(s) con objetivos y unidades claras`;
  } else if (score >= 12) {
    message = `⚠ Parcialmente medible: Mejorar definición de métricas y unidades`;
  } else {
    message = '✗ No medible: Define métricas con objetivos numéricos y unidades claras';
  }
  
  return { ok: score >= 15, message, score: Math.min(score, 25) };
};

// Evaluate Achievable criteria
const evaluateAchievable = (goal: Goal): SMARTCriteriaResult => {
  let score = 15; // Start optimistic
  let warnings: string[] = [];
  
  const periodInMonths = goal.period === 'ANUAL' ? 12 : goal.period === 'TRIMESTRAL' ? 3 : 1;
  
  for (const metric of goal.metrics) {
    if (typeof metric.baseline === 'number' && typeof metric.target === 'number') {
      if (metric.baseline > 0) {
        const growthRate = (metric.target - metric.baseline) / metric.baseline;
        
        // Check for unrealistic growth rates
        if (growthRate > 2 && periodInMonths <= 3) {
          score -= 5;
          warnings.push(`Crecimiento de ${Math.round(growthRate * 100)}% en período corto podría ser poco realista`);
        } else if (growthRate > 1 && periodInMonths <= 1) {
          score -= 8;
          warnings.push(`Duplicar métricas en un mes es muy ambicioso`);
        }
      }
    }
  }
  
  let message = '';
  if (score >= 12) {
    message = warnings.length > 0 
      ? `⚠ Moderadamente alcanzable: ${warnings[0]}`
      : '✓ Alcanzable: Los objetivos parecen realistas para el período definido';
  } else {
    message = `✗ Poco alcanzable: ${warnings[0] || 'Revisa si los objetivos son realistas'}`;
  }
  
  return { ok: score >= 12, message, score: Math.max(0, Math.min(score, 20)) };
};

// Evaluate Relevant criteria
const evaluateRelevant = (goal: Goal, parentGoal?: Goal): SMARTCriteriaResult => {
  let score = 0;
  let message = '';
  
  if (!parentGoal) {
    // For C-level or goals without parent
    score = 15;
    message = '✓ Relevante: Objetivo estratégico de alto nivel';
    return { ok: true, message, score };
  }
  
  // Check tag alignment
  const goalTags = goal.tags || [];
  const parentTags = parentGoal.tags || [];
  const commonTags = goalTags.filter(tag => parentTags.includes(tag));
  
  if (commonTags.length > 0) score += 8;
  
  // Check keyword alignment in titles and descriptions
  const goalText = `${goal.title} ${goal.description}`;
  const parentText = `${parentGoal.title} ${parentGoal.description}`;
  const commonWords = findCommonWords(goalText, parentText);
  
  if (commonWords.length >= 2) score += 6;
  if (commonWords.length >= 1) score += 3;
  
  // Check metric alignment
  const goalMetricNames = goal.metrics.map(m => normalizeText(m.name));
  const parentMetricNames = parentGoal.metrics.map(m => normalizeText(m.name));
  const commonMetricWords = goalMetricNames.some(gm => 
    parentMetricNames.some(pm => findCommonWords(gm, pm).length > 0)
  );
  
  if (commonMetricWords) score += 3;
  
  if (score >= 15) {
    message = `✓ Relevante: Alineado con objetivo padre (${commonTags.length} tags, ${commonWords.length} palabras clave)`;
  } else if (score >= 10) {
    message = `⚠ Parcialmente relevante: Mejorar alineación con objetivo padre`;
  } else {
    message = '✗ Poca relevancia: Agrega tags o ajusta enfoque para alinear con objetivo padre';
  }
  
  return { ok: score >= 12, message, score: Math.min(score, 20) };
};

// Evaluate Time-bound criteria
const evaluateTimeBound = (goal: Goal): SMARTCriteriaResult => {
  let score = 0;
  let message = '';
  
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  const now = new Date();
  
  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { ok: false, message: '✗ Fechas inválidas: Define fechas de inicio y fin válidas', score: 0 };
  }
  
  if (endDate <= startDate) {
    return { ok: false, message: '✗ Fechas inconsistentes: La fecha de fin debe ser posterior al inicio', score: 0 };
  }
  
  score += 8; // Valid date range
  
  const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const durationInMonths = durationInDays / 30;
  
  // Check period consistency
  let expectedMinMonths = 0;
  let expectedMaxMonths = 0;
  
  switch (goal.period) {
    case 'ANUAL':
      expectedMinMonths = 10;
      expectedMaxMonths = 14;
      break;
    case 'TRIMESTRAL':
      expectedMinMonths = 2;
      expectedMaxMonths = 4;
      break;
    case 'MENSUAL':
      expectedMinMonths = 0.7;
      expectedMaxMonths = 1.5;
      break;
  }
  
  if (durationInMonths >= expectedMinMonths && durationInMonths <= expectedMaxMonths) {
    score += 12;
    message = `✓ Tiempo definido: Período de ${Math.round(durationInMonths)} meses coherente con objetivo ${goal.period}`;
  } else {
    score += 5;
    message = `⚠ Duración inconsistente: ${Math.round(durationInMonths)} meses para período ${goal.period}`;
  }
  
  return { ok: score >= 15, message, score: Math.min(score, 20) };
};

// Calculate overall alignment score
const calculateAlignmentScore = (goal: Goal, parentGoal?: Goal): { score: number; notes: string[] } => {
  if (!parentGoal) {
    return { score: 100, notes: ['Objetivo estratégico de nivel superior'] };
  }
  
  let score = 0;
  const notes: string[] = [];
  
  // Tag alignment (0-40)
  const goalTags = goal.tags || [];
  const parentTags = parentGoal.tags || [];
  const commonTags = goalTags.filter(tag => parentTags.includes(tag));
  const tagScore = Math.min(40, commonTags.length * 20);
  score += tagScore;
  
  if (tagScore >= 20) {
    notes.push(`✓ Excelente alineación de tags: ${commonTags.join(', ')}`);
  } else if (tagScore > 0) {
    notes.push(`⚠ Alineación parcial de tags. Considera agregar: ${parentTags.slice(0, 2).join(', ')}`);
  } else {
    notes.push(`✗ Sin tags compartidos. Agrega tags del objetivo padre: ${parentTags.slice(0, 3).join(', ')}`);
  }
  
  // Temporal alignment (0-20)
  const goalStart = new Date(goal.startDate);
  const goalEnd = new Date(goal.endDate);
  const parentStart = new Date(parentGoal.startDate);
  const parentEnd = new Date(parentGoal.endDate);
  
  const temporalOverlap = goalStart >= parentStart && goalEnd <= parentEnd;
  const temporalScore = temporalOverlap ? 20 : 10;
  score += temporalScore;
  
  if (temporalOverlap) {
    notes.push('✓ Período alineado con objetivo padre');
  } else {
    notes.push('⚠ Período no alineado completamente con objetivo padre');
  }
  
  // Metric alignment (0-20)
  const goalMetrics = goal.metrics.map(m => normalizeText(m.name));
  const parentMetrics = parentGoal.metrics.map(m => normalizeText(m.name));
  const hasMetricAlignment = goalMetrics.some(gm => 
    parentMetrics.some(pm => findCommonWords(gm, pm).length > 0)
  );
  
  const metricScore = hasMetricAlignment ? 20 : 0;
  score += metricScore;
  
  if (hasMetricAlignment) {
    notes.push('✓ Métricas complementarias al objetivo padre');
  } else {
    notes.push('⚠ Las métricas podrían relacionarse mejor con el objetivo padre');
  }
  
  // Contribution clarity (0-20)
  const goalText = normalizeText(`${goal.title} ${goal.description}`);
  const hasContributionKeywords = [
    'region', 'area', 'zona', 'segmento', 'parte', 'contribuir',
    'aportar', 'sumar', 'incrementar', 'mejorar'
  ].some(keyword => goalText.includes(keyword));
  
  const contributionScore = hasContributionKeywords ? 20 : 10;
  score += contributionScore;
  
  if (hasContributionKeywords) {
    notes.push('✓ Clara contribución al objetivo macro');
  } else {
    notes.push('⚠ Especifica mejor cómo contribuye al objetivo padre');
  }
  
  return { score: Math.min(100, score), notes };
};

// Main SMART evaluation function
export const evaluateSmartGoal = (goal: Goal, parentGoal?: Goal): SmartFeedback => {
  const specificResult = evaluateSpecific(goal);
  const measurableResult = evaluateMeasurable(goal);
  const achievableResult = evaluateAchievable(goal);
  const relevantResult = evaluateRelevant(goal, parentGoal);
  const timeBoundResult = evaluateTimeBound(goal);
  
  const smartScore = Math.round(
    specificResult.score + 
    measurableResult.score + 
    achievableResult.score + 
    relevantResult.score + 
    timeBoundResult.score
  );
  
  const alignmentData = calculateAlignmentScore(goal, parentGoal);
  
  let overallGrade: "excellent" | "good" | "needs-work" | "poor";
  if (smartScore >= 85) overallGrade = "excellent";
  else if (smartScore >= 70) overallGrade = "good";
  else if (smartScore >= 50) overallGrade = "needs-work";
  else overallGrade = "poor";
  
  return {
    smartScore,
    breakdown: {
      S: specificResult,
      M: measurableResult,
      A: achievableResult,
      R: relevantResult,
      T: timeBoundResult,
    },
    alignmentScore: alignmentData.score,
    alignmentNotes: alignmentData.notes,
    overallGrade,
  };
};

// Simulate AI processing delay for realistic feedback
export const simulateAIValidation = async (goal: Goal, parentGoal?: Goal): Promise<SmartFeedback> => {
  // Simulate processing time (1-3 seconds)
  const delay = Math.random() * 2000 + 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return evaluateSmartGoal(goal, parentGoal);
};