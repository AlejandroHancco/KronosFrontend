export interface Permission {
  id: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}
