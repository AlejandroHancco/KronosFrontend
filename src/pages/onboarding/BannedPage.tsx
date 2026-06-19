import Breadcrumb from '../../components/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';

const BannedPage = () => {
  const { logout } = useAuth();

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <Breadcrumb items={[{ label: 'Onboarding' }, { label: 'Suspendido' }]} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tu cuenta ha sido suspendida</h1>
      </div>

      <div className="border p-6 rounded bg-slate-800 max-w-md">
        <p className="mb-4">Contacta al administrador para más información</p>

        <div>
          <button onClick={() => logout()} className="bg-blue-500 text-white px-4 py-2 rounded">Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
};

export default BannedPage;

