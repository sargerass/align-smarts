import type { OrgUnit, User, Goal } from '@/types';

export const seedOrgUnits: OrgUnit[] = [
  {
    id: 'org-1',
    name: 'Acelera Corp',
    type: 'COMPANY',
  },
  {
    id: 'org-2',
    name: 'Comité de Gerencia',
    type: 'C_LEVEL',
    parentId: 'org-1',
  },
  {
    id: 'org-3',
    name: 'VP Comercial',
    type: 'VP',
    parentId: 'org-2',
    leaderUserId: 'user-4',
  },
  {
    id: 'org-4',
    name: 'Ventas Norte',
    type: 'EQUIPO',
    parentId: 'org-3',
    leaderUserId: 'user-7',
  },
  {
    id: 'org-5',
    name: 'Ventas Sur',
    type: 'EQUIPO',
    parentId: 'org-3',
    leaderUserId: 'user-8',
  },
  {
    id: 'org-6',
    name: 'VP Tecnología',
    type: 'VP',
    parentId: 'org-2',
    leaderUserId: 'user-5',
  },
  {
    id: 'org-7',
    name: 'Desarrollo',
    type: 'GERENCIA',
    parentId: 'org-6',
    leaderUserId: 'user-9',
  },
  {
    id: 'org-8',
    name: 'Data & Analytics',
    type: 'GERENCIA',
    parentId: 'org-6',
    leaderUserId: 'user-10',
  },
  {
    id: 'org-9',
    name: 'VP Operaciones',
    type: 'VP',
    parentId: 'org-2',
    leaderUserId: 'user-6',
  },
];

export const seedUsers: User[] = [
  // Admin
  {
    id: 'user-1',
    name: 'Carlos Rodriguez',
    email: 'admin@aceleracorp.com',
    role: 'ADMIN',
    orgUnitId: 'org-1',
  },
  // C-Level
  {
    id: 'user-2',
    name: 'María González',
    email: 'maria.gonzalez@aceleracorp.com',
    role: 'C_LEVEL',
    orgUnitId: 'org-2',
  },
  {
    id: 'user-3',
    name: 'Roberto Silva',
    email: 'roberto.silva@aceleracorp.com',
    role: 'C_LEVEL',
    orgUnitId: 'org-2',
  },
  // VPs
  {
    id: 'user-4',
    name: 'Ana Martínez',
    email: 'ana.martinez@aceleracorp.com',
    role: 'VP',
    orgUnitId: 'org-3',
  },
  {
    id: 'user-5',
    name: 'Diego López',
    email: 'diego.lopez@aceleracorp.com',
    role: 'VP',
    orgUnitId: 'org-6',
  },
  {
    id: 'user-6',
    name: 'Patricia Moreno',
    email: 'patricia.moreno@aceleracorp.com',
    role: 'VP',
    orgUnitId: 'org-9',
  },
  // Team Leaders & Managers
  {
    id: 'user-7',
    name: 'Luis Herrera',
    email: 'luis.herrera@aceleracorp.com',
    role: 'LIDER_EQUIPO',
    orgUnitId: 'org-4',
  },
  {
    id: 'user-8',
    name: 'Carmen Ruiz',
    email: 'carmen.ruiz@aceleracorp.com',
    role: 'LIDER_EQUIPO',
    orgUnitId: 'org-5',
  },
  {
    id: 'user-9',
    name: 'Fernando Castro',
    email: 'fernando.castro@aceleracorp.com',
    role: 'GERENTE',
    orgUnitId: 'org-7',
  },
  {
    id: 'user-10',
    name: 'Isabella Torres',
    email: 'isabella.torres@aceleracorp.com',
    role: 'GERENTE',
    orgUnitId: 'org-8',
  },
  // Colaborators
  {
    id: 'user-11',
    name: 'Andrés Jiménez',
    email: 'andres.jimenez@aceleracorp.com',
    role: 'COLABORADOR',
    orgUnitId: 'org-4',
  },
  {
    id: 'user-12',
    name: 'Sofía Vargas',
    email: 'sofia.vargas@aceleracorp.com',
    role: 'COLABORADOR',
    orgUnitId: 'org-5',
  },
  {
    id: 'user-13',
    name: 'Miguel Ángel Pérez',
    email: 'miguel.perez@aceleracorp.com',
    role: 'COLABORADOR',
    orgUnitId: 'org-7',
  },
  {
    id: 'user-14',
    name: 'Daniela Ramírez',
    email: 'daniela.ramirez@aceleracorp.com',
    role: 'COLABORADOR',
    orgUnitId: 'org-7',
  },
  {
    id: 'user-15',
    name: 'Alejandro Mendoza',
    email: 'alejandro.mendoza@aceleracorp.com',
    role: 'COLABORADOR',
    orgUnitId: 'org-8',
  },
  {
    id: 'user-16',
    name: 'Valentina Cruz',
    email: 'valentina.cruz@aceleracorp.com',
    role: 'COLABORADOR',
    orgUnitId: 'org-8',
  },
];

export const seedGoals: Goal[] = [
  // C-Level Goals (Annual)
  {
    id: 'goal-1',
    orgUnitId: 'org-2',
    title: 'Incrementar ingresos anuales en un 25%',
    description: 'Alcanzar 125M USD en ingresos totales mediante la expansión de mercados existentes y la introducción de nuevas líneas de productos para el año fiscal 2024.',
    ownerUserId: 'user-2',
    period: 'ANUAL',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.999Z',
    metrics: [
      { name: 'Ingresos totales', baseline: 100, target: 125, unit: 'millones USD' },
      { name: 'Crecimiento', baseline: 0, target: 25, unit: '%' }
    ],
    tags: ['ingresos', 'crecimiento', 'expansion'],
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'goal-2',
    orgUnitId: 'org-2',
    title: 'Mejorar satisfacción del cliente a 90% NPS',
    description: 'Implementar programa de excelencia en servicio al cliente para alcanzar un Net Promoter Score de 90 puntos, mejorando la retención y recomendaciones.',
    ownerUserId: 'user-3',
    period: 'ANUAL',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.999Z',
    metrics: [
      { name: 'Net Promoter Score', baseline: 65, target: 90, unit: 'puntos' },
      { name: 'Retención de clientes', baseline: 80, target: 95, unit: '%' }
    ],
    tags: ['satisfaccion', 'nps', 'retencion', 'clientes'],
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'goal-3',
    orgUnitId: 'org-2',
    title: 'Optimizar eficiencia operativa reduciendo costos en 15%',
    description: 'Implementar iniciativas de automatización y mejora de procesos para reducir costos operativos en 15% manteniendo la calidad del servicio.',
    ownerUserId: 'user-6',
    period: 'ANUAL',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.999Z',
    metrics: [
      { name: 'Reducción de costos', baseline: 0, target: 15, unit: '%' },
      { name: 'Tiempo de procesamiento', baseline: 48, target: 36, unit: 'horas' }
    ],
    tags: ['eficiencia', 'costos', 'automatizacion', 'procesos'],
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  // VP Goals aligned to C-Level
  {
    id: 'goal-4',
    orgUnitId: 'org-3',
    title: 'Aumentar ventas en mercados existentes por 30%',
    description: 'Incrementar ventas en territorios Norte y Sur mediante estrategias de penetración de mercado y cross-selling para contribuir al objetivo de crecimiento corporativo.',
    ownerUserId: 'user-4',
    period: 'ANUAL',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.999Z',
    metrics: [
      { name: 'Ventas totales', baseline: 50, target: 65, unit: 'millones USD' },
      { name: 'Crecimiento ventas', baseline: 0, target: 30, unit: '%' }
    ],
    parentGoalId: 'goal-1',
    tags: ['ingresos', 'ventas', 'crecimiento', 'mercados'],
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'goal-5',
    orgUnitId: 'org-6',
    title: 'Acelerar desarrollo de productos digitales en 40%',
    description: 'Implementar metodologías ágiles y herramientas de automatización para reducir time-to-market de nuevos productos digitales en 40%.',
    ownerUserId: 'user-5',
    period: 'ANUAL',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.999Z',
    metrics: [
      { name: 'Time to market', baseline: 6, target: 3.6, unit: 'meses' },
      { name: 'Productos lanzados', baseline: 4, target: 8, unit: 'productos' }
    ],
    parentGoalId: 'goal-1',
    tags: ['productos', 'desarrollo', 'velocidad', 'digitalizacion'],
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const commonTags = [
  'ingresos', 'retencion', 'adquisicion', 'nps', 'tiempo_entrega',
  'defectos', 'velocidad', 'costos', 'productividad', 'satisfaccion',
  'crecimiento', 'expansion', 'automatizacion', 'procesos', 'clientes',
  'ventas', 'mercados', 'productos', 'desarrollo', 'digitalizacion'
];