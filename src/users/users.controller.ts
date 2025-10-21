import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔒 Get all users (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.usersService.getAll();
  }

  // 🔒 Get a single user by ID (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const user = await this.usersService.findById(+id);
    if (!user) throw new BadRequestException(`User with ID ${id} not found`);
    return user;
  }

  // 🟢 Create a new user (open endpoint)
  @Post()
  async create(
    @Body()
    body: { username?: string; password?: string; role?: string },
  ) {
    const { username, password, role } = body;

    // ✅ Validate required fields
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    return this.usersService.createUser(username, password, role);
  }

  // 🔒 Update user (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { username?: string; password?: string; role?: string },
  ) {
    const updated = await this.usersService.updateUser(+id, body);
    if (!updated) throw new BadRequestException(`User with ID ${id} not found`);
    return updated;
  }

  // 🔒 Delete user (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.usersService.deleteUser(+id);
    if (!deleted) throw new BadRequestException(`User with ID ${id} not found`);
    return { message: `User ${id} deleted successfully` };
  }
}
