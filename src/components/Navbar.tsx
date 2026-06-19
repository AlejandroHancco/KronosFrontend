import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-700/80 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm font-black tracking-[0.3em] text-amber-400">
            SC
          </div>
          <div>
            <p className="text-lg font-semibold uppercase tracking-[0.25em] text-slate-100">
              Smart Concrete
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Industrial Monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-slate-300">
            {user ? `${user.name} ${user.lastName}` : ''}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-400 hover:text-amber-300"
          >
            Cerrar Sesion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
