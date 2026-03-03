import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { id: string; email: string }) {
    // Use withDeleted lookup so deactivated accounts are not silently treated as "not found"
    const user = await this.usersService.findByIdWithDeleted(payload.id);
    // Reject tokens for deleted/deactivated accounts
    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Account is deactivated');
    }
    return { id: payload.id, email: payload.email };
  }
}
