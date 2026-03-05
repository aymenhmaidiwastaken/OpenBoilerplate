export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: "user" | "admin";
  emailVerified: boolean;
  createdAt: Date;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: Date;
}

export interface AuthProvider {
  signUp(email: string, password: string, name?: string): Promise<AuthSession>;
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(token: string): Promise<void>;
  verifySession(token: string): Promise<AuthUser | null>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  getGoogleAuthUrl(): string;
  handleGoogleCallback(code: string): Promise<AuthSession>;
  getUser(id: string): Promise<AuthUser | null>;
  updateUser(id: string, data: Partial<Pick<AuthUser, "name" | "avatar">>): Promise<AuthUser>;
}
