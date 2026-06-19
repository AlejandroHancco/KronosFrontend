import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import apiClient from '../../../api/client';
import { getErrorMessage, type ApiErrorResponse } from '../../../types/api';

interface Task {
  id: number;
  projectId: string;
  name: string;
  startFreq: number;
  stopFreq: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newStartFreq, setNewStartFreq] = useState('');
  const [newStopFreq, setNewStopFreq] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          apiClient.get(`/projects/${id}`),
          apiClient.get('/tasks'),
        ]);
        setProject(projectRes.data);
        const allTasks = tasksRes.data;
        const projectTasks = allTasks.filter((task: Task) => task.projectId === id);
        setTasks(projectTasks);
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        setError(getErrorMessage(axiosError));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectAndTasks();
    }
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await apiClient.post('/tasks', {
        projectId: id,
        name: newTaskName,
        startFreq: parseFloat(newStartFreq),
        stopFreq: parseFloat(newStopFreq),
      });
      setTasks([...tasks, response.data]);
      setNewTaskName('');
      setNewStartFreq('');
      setNewStopFreq('');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setError(getErrorMessage(axiosError));
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!project) return <div>Proyecto no encontrado</div>;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
      <h2 className="text-2xl font-bold text-white mb-4">{project.name}</h2>
      <p className="text-slate-400 mb-6">{project.description}</p>

      <h3 className="text-xl font-semibold text-white mb-4">Tareas</h3>
      <div className="space-y-4 mb-6">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <h4 className="text-lg font-semibold text-white">{task.name}</h4>
            <p className="text-slate-400">
              Frecuencia: {task.startFreq} - {task.stopFreq}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreateTask} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">Nombre de la Tarea</label>
          <input
            type="text"
            required
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-amber-400"
            placeholder="Nombre de la tarea"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Frecuencia de Inicio</label>
          <input
            type="number"
            required
            value={newStartFreq}
            onChange={(e) => setNewStartFreq(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-amber-400"
            placeholder="Frecuencia de inicio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Frecuencia de Parada</label>
          <input
            type="number"
            required
            value={newStopFreq}
            onChange={(e) => setNewStopFreq(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-amber-400"
            placeholder="Frecuencia de parada"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full rounded-xl bg-amber-500 py-3 font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-amber-700"
        >
          {creating ? 'Creando...' : 'Crear Tarea'}
        </button>
      </form>
    </section>
  );
};

export default ProjectDetail;
