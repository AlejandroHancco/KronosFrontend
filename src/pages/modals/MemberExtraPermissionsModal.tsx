import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { KronosButton } from '../../components/kronos';
import { useGetPermissions, useGetRoles } from '../../hooks/usePermissions';
import { useUpdateProjectMemberPermissions } from '../../hooks/useProjects';
import type { ProjectMember } from '../../types';
import type { Permission, Role } from '../../types/permissions';

interface MemberExtraPermissionsModalProps {
    projectId: string;
    member: ProjectMember;
    onClose: () => void;
}

const MemberExtraPermissionsModal = ({ projectId, member, onClose }: MemberExtraPermissionsModalProps) => {
    const { data: permissions = [] } = useGetPermissions();
    const { data: roles = [] } = useGetRoles();
    const { mutateAsync: updatePermissions, isPending } = useUpdateProjectMemberPermissions();

    const role = roles.find((r: Role) => r.id === member.roleId);
    const basePermIds = new Set((role?.permissions ?? []).map((p: Permission) => p.id));

    const [selected, setSelected] = useState<Set<string>>(new Set(member.extraPermissions ?? []));

    useEffect(() => {
        setSelected(new Set(member.extraPermissions ?? []));
    }, [member.userId]);

    const toggle = (permId: string) => {
        if (basePermIds.has(permId)) return;
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(permId)) next.delete(permId);
            else next.add(permId);
            return next;
        });
    };

    const handleSave = async () => {
        await updatePermissions({ projectId, userId: member.userId, permissions: Array.from(selected) });
        onClose();
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Permisos extra de {member.user?.name ?? member.userId}</DialogTitle>
                    <DialogDescription>
                        Además de los permisos de su rol ({member.roleName}), puedes otorgarle permisos
                        individuales adicionales para este proyecto.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-80 space-y-1 overflow-y-auto py-2">
                    {permissions.map((perm: Permission) => {
                        const fromRole = basePermIds.has(perm.id);
                        const checked = fromRole || selected.has(perm.id);
                        return (
                            <label
                                key={perm.id}
                                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                                    fromRole ? 'opacity-50' : 'cursor-pointer hover:bg-muted/40'
                                }`}
                            >
                                <Checkbox checked={checked} disabled={fromRole} onCheckedChange={() => toggle(perm.id)} />
                                <span className="font-mono text-foreground">{perm.id}</span>
                                {perm.description && (
                                    <span className="text-muted-foreground">— {perm.description}</span>
                                )}
                                {fromRole && (
                                    <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                                        (por rol)
                                    </span>
                                )}
                            </label>
                        );
                    })}
                </div>

                <DialogFooter>
                    <KronosButton variant="outline" onClick={onClose}>
                        Cancelar
                    </KronosButton>
                    <KronosButton variant="primary" onClick={handleSave} loading={isPending}>
                        Guardar
                    </KronosButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MemberExtraPermissionsModal;
