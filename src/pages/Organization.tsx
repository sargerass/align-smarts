import { OrgChart } from '@/components/OrgChart';

export default function Organization() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organigrama</h1>
        <p className="text-muted-foreground">
          Explora la estructura organizacional y visualiza la alineación de objetivos
        </p>
      </div>
      
      <OrgChart />
    </div>
  );
}