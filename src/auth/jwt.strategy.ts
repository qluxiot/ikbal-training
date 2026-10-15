import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'iot_super_secret_jwt_key_2026_x!',
      ),
    });
  }

  async validate(payload: any) {
    if (!payload || payload.username !== 'root') {
      throw new UnauthorizedException();
    }
    return { username: payload.username, role: payload.role };
  }
}
