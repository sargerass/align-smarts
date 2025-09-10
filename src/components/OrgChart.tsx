import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useOrganizationStore } from '@/stores/organizationStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { Search, ChevronRight, ChevronDown, Building2, Users, Target } from 'lucide-react';
import type { OrgUnit } from '@/types';

interface TreeNode extends OrgUnit {
  children: TreeNode[];
  level: number;
}

export function OrgChart() {
  const { orgUnits, users, getUsersByOrgUnit } = useOrganizationStore();
  const { getGoalsByOrgUnit } = useGoalsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['org-1']));
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // Build tree structure
  const orgTree = useMemo(() => {
    const buildTree = (parentId?: string, level = 0): TreeNode[] => {
      return orgUnits
        .filter(unit => unit.parentId === parentId)
        .map(unit => ({
          ...unit,
          children: buildTree(unit.id, level + 1),
          level,
        }));
    };

    return buildTree();
  }, [orgUnits]);

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchTerm) return orgTree;

    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.reduce((acc: TreeNode[], node) => {
        const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredChildren = filterNodes(node.children);
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren,
          });
        }
        
        return acc;
      }, []);
    };

    return filterNodes(orgTree);
  }, [orgTree, searchTerm]);

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getUnitTypeIcon = (type: OrgUnit['type']) => {
    switch (type) {
      case 'COMPANY': return <Building2 className="w-4 h-4" />;
      case 'C_LEVEL': return <Users className="w-4 h-4 text-brand-gold" />;
      case 'VP': return <Users className="w-4 h-4 text-primary" />;
      case 'GERENCIA': return <Users className="w-4 h-4 text-secondary" />;
      case 'EQUIPO': return <Target className="w-4 h-4 text-muted-foreground" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getUnitTypeColor = (type: OrgUnit['type']) => {
    switch (type) {
      case 'COMPANY': return 'brand-gold';
      case 'C_LEVEL': return 'brand-gold';
      case 'VP': return 'primary';
      case 'GERENCIA': return 'secondary';
      case 'EQUIPO': return 'muted';
      default: return 'secondary';
    }
  };

  const renderTreeNode = (node: TreeNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedUnit === node.id;
    const hasChildren = node.children.length > 0;
    const unitUsers = getUsersByOrgUnit(node.id);
    const unitGoals = getGoalsByOrgUnit(node.id);
    const activeGoals = unitGoals.filter(goal => goal.status === 'ACTIVE');

    return (
      <div key={node.id} className="space-y-2">
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
            isSelected ? 'bg-accent border-primary' : 'hover:bg-accent/50'
          }`}
          style={{ marginLeft: `${node.level * 24}px` }}
          onClick={() => setSelectedUnit(isSelected ? null : node.id)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}
          
          {!hasChildren && <div className="w-6" />}
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getUnitTypeIcon(node.type)}
            <span className="font-medium truncate">{node.name}</span>
            <Badge variant="outline" className={getUnitTypeColor(node.type)}>
              {node.type}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {unitUsers.length}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {activeGoals.length}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const selectedUnitData = selectedUnit ? orgUnits.find(u => u.id === selectedUnit) : null;
  const selectedUnitUsers = selectedUnit ? getUsersByOrgUnit(selectedUnit) : [];
  const selectedUnitGoals = selectedUnit ? getGoalsByOrgUnit(selectedUnit) : [];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Tree View */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organigrama Interactivo
            </CardTitle>
            <CardDescription>
              Explora la estructura organizacional y sus objetivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar unidades organizacionales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tree */}
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredTree.map(node => renderTreeNode(node))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unit Details */}
      <div className="space-y-4">
        {selectedUnitData ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getUnitTypeIcon(selectedUnitData.type)}
                  {selectedUnitData.name}
                </CardTitle>
                <CardDescription>
                  <Badge variant="outline" className={getUnitTypeColor(selectedUnitData.type)}>
                    {selectedUnitData.type}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Team Members */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Miembros ({selectedUnitUsers.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedUnitUsers.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                    {selectedUnitUsers.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{selectedUnitUsers.length - 5} miembros más
                      </p>
                    )}
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Objetivos ({selectedUnitGoals.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedUnitGoals.slice(0, 3).map(goal => (
                      <div key={goal.id} className="p-2 bg-muted/50 rounded">
                        <p className="font-medium text-sm truncate">{goal.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className={
                            goal.status === 'ACTIVE' ? 'success' : 
                            goal.status === 'DRAFT' ? 'warning' : 'secondary'
                          }>
                            {goal.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {goal.period}
                          </span>
                        </div>
                      </div>
                    ))}
                    {selectedUnitGoals.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{selectedUnitGoals.length - 3} objetivos más
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecciona una unidad organizacional para ver sus detalles</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}