export class User {
  id!: string;
  login!: string;
  accessToken!: string;
  refreshToken!: string;
  roles!: string[];
  tokenExpireDate!: Date;
  refreshTokenExpireDate!: Date;

  public hasRole(role: string): boolean {
    return this.roles.some((s) => s.includes(role));
  }
}
