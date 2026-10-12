import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KronosLayout, KronosPageHeader } from '../../components/kronos/kronos-layout';
import { useGetRoles, useGetPermissions, useUpdateRolePermissions } from '../../hooks/usePermissions';
import { useHasPermission } from '../../hooks/useHasPermission';
import { useIsSuperAdmin } from '../../hooks/useIsSuperAdmin';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { cn } from '../../lib/utils';
import type { Permission, Role } from '../../types/permissions';

const PERMISSION_GROUPS: Record<string, string[]> = {
  EQUIPOS: ['team:'],
  MIEMBROS: ['member:'],
  PROYECTOS: ['project:'],
  TAREAS: ['task:'],
  MEDICIONES: ['measurement:'],
  DISPOSITIVOS: ['device:'],
  REPORTES: ['report:'],
  SISTEMA: ['system:', 'permission:', 'role:'],
};

const GROUP_ORDER = Object.keys(PERMISSION_GROUPS);

// Permisos de administración del propio sistema de roles: solo un Super Administrador puede otorgarlos.
const SYSTEM_PERMISSIONS = new Set(['permission:edit', 'role:edit']);

// Roles que un editor no-Super-Administrador puede modificar (coincide con la restricción del backend).
const EDITABLE_BY_NON_SUPER_ADMIN = new Set(['Operario']);

function getPermissionGroup(permId: string): string {
  for (const [group, prefixes] of Object.entries(PERMISSION_GROUPS)) {
    if (prefixes.some((p) => permId.startsWith(p))) return group;
  }
  return 'OTROS';
}

export default function PermissionsPage() {
  const canEdit = useHasPermission('permission:edit');
  const isSuperAdmin = useIsSuperAdmin();
  const navigate = useNavigate();

  const canEditRole = (role: Role): boolean => isSuperAdmin || EDITABLE_BY_NON_SUPER_ADMIN.has(role.name);

  const { data: roles = [], isLoading: rolesLoading } = useGetRoles();
  const { data: permissions = [], isLoading: permsLoading } = useGetPermissions();
  const { mutateAsync: updatePermissions } = useUpdateRolePermissions();

  const [localPerms, setLocalPerms] = useState<Record<number, Set<string>>>({});
  const [originalPerms, setOriginalPerms] = useState<Record<number, Set<string>>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [saveResult, setSaveResult] = useState<{ roleId: number; success: boolean } | null>(null);

  useEffect(() => {
    if (!roles.length) return;
    const initial: Record<number, Set<string>> = {};
    roles.forEach((role: Role) => {
      initial[role.id] = new Set(role.permissions.map((p: Permission) => p.id));
    });
    setLocalPerms(initial);
    setOriginalPerms(initial);
  }, [roles]);

  useEffect(() => {
    if (!rolesLoading && !canEdit) {
      navigate('/dashboard');
    }
  }, [canEdit, rolesLoading, navigate]);

  const toggle = (role: Role, permId: string) => {
    if (!canEditRole(role)) return;
    if (!isSuperAdmin && SYSTEM_PERMISSIONS.has(permId)) return;
    const roleId = role.id;
    setLocalPerms((prev) => {
      const current = new Set(prev[roleId] || []);
      if (current.has(permId)) current.delete(permId);
      else current.add(permId);
      return { ...prev, [roleId]: current };
    });
  };

  const isPending = (roleId: number, permId: string): boolean => {
    const orig = originalPerms[roleId];
    const local = localPerms[roleId];
    if (!orig || !local) return false;
    return orig.has(permId) !== local.has(permId);
  };

  const hasChanges = (roleId: number): boolean => {
    const orig = originalPerms[roleId];
    const local = localPerms[roleId];
    if (!orig || !local) return false;
    if (orig.size !== local.size) return true;
    for (const p of orig) if (!local.has(p)) return true;
    return false;
  };

  const handleSave = async (roleId: number) => {
    setSaving(roleId);
    setSaveResult(null);
    try {
      const perms = Array.from(localPerms[roleId] || []);
      await updatePermissions({ roleId, permissions: perms });
      setOriginalPerms((prev) => ({ ...prev, [roleId]: new Set(localPerms[roleId]) }));
      setSaveResult({ roleId, success: true });
    } catch {
      setSaveResult({ roleId, success: false });
    } finally {
      setSaving(null);
      setTimeout(() => setSaveResult(null), 3000);
    }
  };

  if (rolesLoading || permsLoading) {
    return (
      <KronosLayout title="Permisos">
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Cargando permisos...
        </div>
      </KronosLayout>
    );
  }

  // Group permissions by category
  const grouped: Record<string, Permission[]> = {};
  permissions.forEach((perm: Permission) => {
    const group = getPermissionGroup(perm.id);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(perm);
  });

  const sortedGroups = Object.entries(grouped).sort(
    (a, b) => {
      const ai = GROUP_ORDER.indexOf(a[0]);
      const bi = GROUP_ORDER.indexOf(b[0]);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    }
  );

  return (
    <KronosLayout title="Gestión de Permisos" subtitle={isSuperAdmin ? 'Super Administrador' : 'Gestión de Operario'}>
      <KronosPageHeader
        title="Permisos y Roles"
        description={
          isSuperAdmin
            ? 'Define qué puede hacer cada rol en el sistema. Los cambios no guardados se resaltan en amarillo.'
            : 'Puedes ver todos los roles, pero solo editar los permisos del rol Operario. Los cambios no guardados se resaltan en amarillo.'
        }
      />

      {permissions.length === 0 ? (
        <div className="flex items-center justify-center rounded-md border border-border py-16 text-sm text-muted-foreground">
          No hay permisos definidos en el sistema.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-64 px-4 py-3 text-left font-medium text-muted-foreground">
                  Permiso
                </th>
                {roles.map((role: Role) => (
                  <th key={role.id} className="min-w-[140px] px-4 py-3 text-center font-medium text-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs uppercase tracking-wide">{role.name}</span>
                      {canEditRole(role) ? (
                        <Button
                          size="sm"
                          variant={hasChanges(role.id) ? 'default' : 'outline'}
                          disabled={!hasChanges(role.id) || saving === role.id}
                          onClick={() => handleSave(role.id)}
                          className="h-6 px-3 text-[10px]"
                        >
                          {saving === role.id ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Solo lectura</span>
                      )}
                      {saveResult?.roleId === role.id && (
                        <span
                          className={cn(
                            'text-[10px] font-medium',
                            saveResult.success ? 'text-green-400' : 'text-red-400'
                          )}
                        >
                          {saveResult.success ? '✓ Guardado' : '✗ Error al guardar'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedGroups.map(([group, perms]) => (
                <>
                  <tr key={`group-${group}`}>
                    <td
                      colSpan={roles.length + 1}
                      className="bg-muted/20 px-4 py-2"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {group}
                      </span>
                    </td>
                  </tr>
                  {perms.map((perm: Permission) => (
                    <tr
                      key={perm.id}
                      className="border-b border-border/40 transition-colors hover:bg-muted/10"
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-xs text-foreground">{perm.id}</span>
                        {perm.description && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {perm.description}
                          </p>
                        )}
                      </td>
                      {roles.map((role: Role) => {
                        const isChecked = localPerms[role.id]?.has(perm.id) ?? false;
                        const pending = isPending(role.id, perm.id);
                        const editable = canEditRole(role) && (isSuperAdmin || !SYSTEM_PERMISSIONS.has(perm.id));
                        return (
                          <td
                            key={role.id}
                            className={cn(
                              'px-4 py-2.5 text-center transition-colors',
                              pending && 'bg-yellow-500/10'
                            )}
                          >
                            <Checkbox
                              checked={isChecked}
                              disabled={!editable}
                              onCheckedChange={() => toggle(role, perm.id)}
                              className={cn(
                                pending && 'border-yellow-400 data-[state=checked]:border-yellow-400 data-[state=checked]:bg-yellow-500/80'
                              )}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </KronosLayout>
  );
}
