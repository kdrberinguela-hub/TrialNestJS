import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;

    const valid = await bcrypt.compare(pass, user.password);
    if (valid) {
      return { id: user.id, username: user.username, role: user.role };
    }
    return null;
  }

  async login(user: { id: number; username: string; role: string }) {
    const payload = { sub: user.id, username: user.username, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'access_secret',
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || '900s') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as any,
    });

    await this.usersService.setRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(userId: number) {
    await this.usersService.setRefreshToken(userId, null);
    return { ok: true };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      }) as any;

      const user = await this.usersService.findById(decoded.sub);
      if (!user) throw new UnauthorizedException('Invalid refresh token');

      const found = await this.usersService.findByRefreshToken(refreshToken);
      if (!found) throw new UnauthorizedException('Invalid refresh token (not found)');

      const payload = {
        sub: found.id,
        username: found.username,
        role: found.role,
      };

      // ✅ Create new tokens
      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'access_secret',
        expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || '900s') as any,
      });

      const newRefresh = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as any,
      });

      await this.usersService.setRefreshToken(found.id, newRefresh);

      return { accessToken, refreshToken: newRefresh };
    } catch (err) {
      throw new UnauthorizedException('Could not refresh tokens');
    }
  }
}
