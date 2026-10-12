import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Calendar } from 'lucide-react';
import { useGetProjects } from '../hooks/useProjects';
import {
  KronosLayout,
  KronosPageHeader,
  KronosCard,
  KronosButton,
} from '../components/kronos';
import CreateProjectModal from './modals/CreateProjectModal';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: projects = [], isLoading, isError, error } = useGetProjects();

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
    </div>
  );

  if (isError) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p className="text-destructive">Error: {error?.message}</p>
    </div>
  );

  return (
    <>
      <KronosLayout title="Proyectos" subtitle="Todos los proyectos">
        <KronosPageHeader
          title="Proyectos"
          description={`${projects.length} proyecto${projects.length !== 1 ? 's' : ''} en total`}
          actions={
            <KronosButton
              size="sm"
              leftIcon={<Plus className="size-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Nuevo Proyecto
            </KronosButton>
          }
        />

        {projects.length === 0 ? (
          <div
            onClick={() => setShowCreateModal(true)}
            className="mt-6 cursor-pointer group"
          >
            <KronosCard className="flex flex-col items-center justify-center gap-3 border-dashed border-muted-foreground/30 py-20 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300">
              <span className="text-3xl text-muted-foreground/40 group-hover:text-primary group-hover:scale-110 transition-all duration-300 select-none">+</span>
              <p className="text-sm font-medium text-muted-foreground/60 group-hover:text-primary transition-colors duration-300">
                Crear primer proyecto
              </p>
            </KronosCard>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <div
                key={project.uuid}
                onClick={() => navigate(`/projects/${project.uuid}`)}
                className="cursor-pointer group"
              >
                <KronosCard className="flex h-full flex-col gap-3 hover:border-primary transition-colors duration-200">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <FolderOpen className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="size-3" />
                    {formatDate(project.createdAt)}
                  </div>
                </KronosCard>
              </div>
            ))}

            {/* Card: crear nuevo */}
            <div
              onClick={() => setShowCreateModal(true)}
              className="cursor-pointer group"
            >
              <KronosCard className="flex h-full min-h-[100px] flex-col items-center justify-center gap-2 border-dashed border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300">
                <span className="text-2xl text-muted-foreground/40 group-hover:text-primary group-hover:scale-110 transition-all duration-300 select-none">+</span>
                <p className="text-xs font-medium text-muted-foreground/60 group-hover:text-primary transition-colors duration-300">
                  Nuevo proyecto
                </p>
              </KronosCard>
            </div>
          </div>
        )}
      </KronosLayout>

      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
};

export default ProjectsPage;
