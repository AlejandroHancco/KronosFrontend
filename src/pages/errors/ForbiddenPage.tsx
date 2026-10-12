import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { KronosButton } from '../../components/kronos';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldAlert className="size-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <p className="text-6xl font-bold tracking-tight text-foreground">403</p>
        <h1 className="text-xl font-semibold text-foreground">No tienes permiso</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Tu cuenta no tiene los permisos necesarios para acceder a este recurso.
          Si crees que es un error, contacta al administrador de tu equipo.
        </p>
      </div>
      <div className="flex gap-3">
        <KronosButton
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="size-4" />}
          onClick={() => navigate(-1)}
        >
          Volver
        </KronosButton>
        <KronosButton
          size="sm"
          leftIcon={<LayoutDashboard className="size-4" />}
          onClick={() => navigate('/dashboard')}
        >
          Ir al Dashboard
        </KronosButton>
      </div>
    </div>
  );
};

export default ForbiddenPage;
