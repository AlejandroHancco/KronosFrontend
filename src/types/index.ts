export interface Project {
  uuid: string;
  name: string;
  description: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  status: string;
  projectId: string;
  createdAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface TeamMember {
  id: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  user?: {
    name: string;
    email: string;
  };
  [key: string]: unknown;
}

export interface TeamProject extends Project {
  status: "active" | "draft" | "inactive" | "archived";
}

export interface TeamActivity {
  memberName: string;
  taskName: string;
  takenAt: string;
  analyzerName: string;
  points: number;
  [key: string]: unknown;
}

export interface ProjectMember {
  userId: string;
  roleId: number;
  roleName?: string;
  user: {
    name: string;
    email: string;
  };
}
