import { useForm } from 'react-hook-form';
import { useCreateProject } from '../../hooks/useProjects';
import type { CreateProjectDto } from '../../types';
import {
  KronosCard,
  KronosButton,
} from '../../components/kronos';
import { X } from 'lucide-react';

const CreateProjectModal = ({ onClose }: { onClose: () => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectDto>();
  const createProjectMutation = useCreateProject();

  const onSubmit = (data: CreateProjectDto) => {
    createProjectMutation.mutate(data, {
      onSuccess: () => onClose(),
    });
  };

  return (
      // Backdrop
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
      >
        {/* Modal */}
        <div
            className="w-full max-w-md"
            onClick={e => e.stopPropagation()}
        >
          <KronosCard className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Nuevo Proyecto</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Completa los datos para crear el proyecto</p>
              </div>
              <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nombre
                </label>
                <input
                    {...register('name', { required: 'El nombre es requerido' })}
                    placeholder="Mi proyecto..."
                    className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Descripción
                </label>
                <textarea
                    {...register('description', { required: 'La descripción es requerida' })}
                    placeholder="Describe el proyecto..."
                    rows={3}
                    className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
                />
                {errors.description && (
                    <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              {createProjectMutation.isError && (
                  <p className="text-xs text-destructive">Error al crear el proyecto. Intenta de nuevo.</p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <KronosButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                >
                  Cancelar
                </KronosButton>
                <KronosButton
                    type="submit"
                    size="sm"
                    disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? 'Creando...' : 'Crear Proyecto'}
                </KronosButton>
              </div>
            </form>
          </KronosCard>
        </div>
      </div>
  );
};

export default CreateProjectModal;