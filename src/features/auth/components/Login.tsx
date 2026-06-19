import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    console.log('[Login] login() returned:', success);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden bg-[linear-gradient(160deg,_rgba(245,158,11,0.14),_rgba(15,23,42,0.98)_42%,_rgba(2,6,23,1))] p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-400">
                Smart Concrete
              </p>
              <h1 className="mt-6 max-w-md text-5xl font-black uppercase leading-none text-white">
                Monitoreo robusto para operaciones industriales
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
                Accede al sistema de supervision con una interfaz limpia, sobria y enfocada en continuidad operativa.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Seguridad</p>
                <p className="mt-2 text-lg font-semibold text-white">Acceso controlado</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Disponibilidad</p>
                <p className="mt-2 text-lg font-semibold text-white">Operacion continua</p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mx-auto max-w-md space-y-6">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-400">Acceso</p>
                <h1 className="mt-3 text-3xl font-extrabold text-slate-50">Iniciar sesion</h1>
                <p className="mt-2 text-slate-400">Panel de monitoreo industrial</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Usuario</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-amber-400"
                    placeholder="admin@smartconcrete.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300">Contrasena</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-amber-400"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-center text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-amber-500 py-3 font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-amber-700"
                >
                  {loading ? 'Verificando...' : 'Iniciar Sesion'}
                </button>
              </form>

              <div className="text-center">
                <p className="text-sm text-slate-400">
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    Registrarse
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
