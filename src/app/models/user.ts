export class User {
  id!: string;
  login!: string;
  accessToken!: string;
  refreshToken!: string;
  roles!: string[];
  tokenExpireDate!: Date;
  refreshTokenExpireDate!: Date;
}
