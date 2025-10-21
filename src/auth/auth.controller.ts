import { Controller, Post, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Handles user registration.
   * Accepts a username and password, and delegates user creation to UsersService.
   */
  @Post('register')
  async register(@Body() body: { username?: string; password?: string }) {
    const { username, password } = body;

    // ✅ Input validation
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    return this.usersService.createUser(username, password);
  }

  /**
   * Handles user login.
   * Validates credentials and returns JWT token.
   */
  @Post('login')
  async login(@Body() body: { username?: string; password?: string }) {
    const { username, password } = body;

    // ✅ Input validation
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.authService.login(user);
  }

  /**
   * Handles user logout.
   */
  @Post('logout')
  async logout(@Body() body: { userId?: number }) {
    const { userId } = body;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.authService.logout(userId);
  }

  /**
   * Refreshes authentication tokens.
   */
  @Post('refresh')
  async refresh(@Body() body: { refreshToken?: string }) {
    const { refreshToken } = body;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    return this.authService.refreshTokens(refreshToken);
  }
}
