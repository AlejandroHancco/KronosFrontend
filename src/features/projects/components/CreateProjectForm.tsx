import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import apiClient from '../../../api/client';
import { getErrorMessage, type ApiErrorResponse } from '../../../types/api';

const CreateProjectForm: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/projects', { name, description });
      setName('');
      setDescription('');
      navigate('/projects');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
      <h2 className="text-2xl font-bold text-white mb-4">Crear Proyecto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">Nombre</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-amber-400"
            placeholder="Nombre del proyecto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Descripción</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-amber-400"
            placeholder="Descripción del proyecto"
            rows={3}
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
          {loading ? 'Creando...' : 'Crear Proyecto'}
        </button>
      </form>
    </section>
  );
};

export default CreateProjectForm;
