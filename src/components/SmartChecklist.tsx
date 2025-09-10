import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SmartFeedback, SMARTCriteria } from '@/types';

interface SmartChecklistProps {
  feedback?: SmartFeedback;
  isLoading?: boolean;
}

const criteriaLabels: Record<SMARTCriteria, string> = {
  S: 'Específico',
  M: 'Medible',
  A: 'Alcanzable',
  R: 'Relevante',
  T: 'Tiempo definido'
};

const getScoreColor = (score: number) => {
  if (score >= 18) return 'smart-excellent';
  if (score >= 14) return 'smart-good';
  if (score >= 10) return 'smart-needs-work';
  return 'smart-poor';
};

const getOverallColor = (grade: string) => {
  switch (grade) {
    case 'excellent': return 'success';
    case 'good': return 'smart-good';
    case 'needs-work': return 'warning';
    case 'poor': return 'error';
    default: return 'muted';
  }
};

export function SmartChecklist({ feedback, isLoading }: SmartChecklistProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 IA analizando objetivo...
            <div className="animate-pulse flex gap-1">
              <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
              <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
              <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {(['S', 'M', 'A', 'R', 'T'] as SMARTCriteria[]).map((criteria) => (
              <div key={criteria} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feedback) {
    return (
      <Card className="w-full border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">🎯</div>
            <p>Completa los campos para ver la evaluación SMART</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🤖 Evaluación IA SMART</span>
          <Badge variant="secondary" className={`bg-${getOverallColor(feedback.overallGrade)}`}>
            {feedback.smartScore}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Puntuación SMART</span>
            <span className="font-medium">{feedback.smartScore}/100</span>
          </div>
          <Progress value={feedback.smartScore} className="h-3" />
        </div>

        {/* Individual Criteria */}
        <div className="space-y-4">
          {(Object.keys(feedback.breakdown) as SMARTCriteria[]).map((criteria) => {
            const result = feedback.breakdown[criteria];
            const colorClass = getScoreColor(result.score);
            
            return (
              <div key={criteria} className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline"
                    className={`w-8 h-8 rounded-full p-0 flex items-center justify-center font-bold border-2 ${
                      result.ok 
                        ? 'border-success bg-success text-success-foreground' 
                        : 'border-error bg-error text-error-foreground'
                    }`}
                  >
                    {criteria}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{criteriaLabels[criteria]}</span>
                      <span className="text-sm text-muted-foreground">{result.score}/20</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alignment Score */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">🎯 Alineación organizacional</span>
            <Badge variant="outline">{feedback.alignmentScore}/100</Badge>
          </div>
          <Progress value={feedback.alignmentScore} className="h-2" />
          <div className="space-y-2">
            {feedback.alignmentNotes.map((note, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {note}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}