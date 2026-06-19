import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import apiClient from '../../../api/client';
import { getErrorMessage, type ApiErrorResponse } from '../../../types/api';

interface Project {
  id: string;
  name: string;
  description: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(getErrorMessage(axiosError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return <div>Cargando proyectos...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Lista de Proyectos</h2>
        <button
          onClick={() => navigate('/create-project')}
          className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
        >
          Crear Proyecto
        </button>
      </div>
      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 cursor-pointer hover:border-amber-400"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
            <p className="text-slate-400">{project.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectList;
