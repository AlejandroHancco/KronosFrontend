export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role?: string;
  permissions?: string[];
  roleNames?: string[];
  provider?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, lastName: string, password: string) => Promise<boolean>;
  logout: () => void;
  signInWithGoogle: () => Promise<void>;
  /** Reemite el JWT con una expiración fresca. Devuelve true si funcionó. */
  refreshToken: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
}
