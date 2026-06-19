import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_28%),linear-gradient(135deg,_rgba(15,23,42,1),_rgba(2,6,23,1))]" />
      <div className="relative min-h-screen">
        <Navbar />

        <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
          <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-400">
                Sistema en linea
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
                Panel de Control
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Aquí puedes gestionar tus proyectos y tareas.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
                Resumen
              </p>
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                  <p className="text-sm text-slate-400">Proyectos activos</p>
                  <p className="mt-2 text-3xl font-black text-white">0</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                  <p className="text-sm text-slate-400">Tareas pendientes</p>
                  <p className="mt-2 text-xl font-semibold text-slate-200">0</p>
                </div>
              </div>
            </div>
          </section>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
