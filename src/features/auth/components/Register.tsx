import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
    KronosCard,
    KronosButton,
    KronosInput,
} from '../../../components/kronos';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(email, name, lastName, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary mb-4 shadow-lg shadow-primary/20">
                <span className="text-xl font-bold text-primary-foreground">K</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">KRONOS</h1>
            <p className="text-sm text-muted-foreground mt-2">Plataforma de Monitoreo Industrial</p>
        </div>

        <KronosCard className="p-8 shadow-xl border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">Crear cuenta</h2>
              <p className="text-sm text-muted-foreground mt-1">Completa los datos para registrarte</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                <KronosInput
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartconcrete.com"
                  className="bg-background/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</label>
                  <KronosInput
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Apellido</label>
                  <KronosInput
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Perez"
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contraseña</label>
                <KronosInput
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background/50"
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs text-destructive">
                  {error}
                </div>
              )}

              <KronosButton
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </KronosButton>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary font-medium hover:underline transition-all"
                >
                  Iniciar Sesión
                </button>
              </p>
            </div>
          </div>
        </KronosCard>

        <p className="text-center text-[10px] text-muted-foreground/50 mt-8 uppercase tracking-[0.2em]">
          Smart Concrete © 2026 · Robust Infrastructure
        </p>
      </div>
    </div>
  );
};

export default Register;
