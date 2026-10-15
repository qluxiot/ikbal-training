import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // Default credentials: root / Qwe123##
  private readonly defaultUser = {
    username: 'root',
    password: 'Qwe123##',
    role: 'operator',
  };

  constructor(private readonly jwtService: JwtService) {}

  async validateAndLogin(username?: string, password?: string) {
    if (
      !username ||
      !password ||
      username !== this.defaultUser.username ||
      password !== this.defaultUser.password
    ) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      username: this.defaultUser.username,
      role: this.defaultUser.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        username: this.defaultUser.username,
        role: this.defaultUser.role,
      },
    };
  }
}
