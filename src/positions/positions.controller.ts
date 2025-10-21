import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  //  GET all positions
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.positionsService.findAll();
  }

  //  GET one position
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.findById(id);
  }

  // POST new position
  @UseGuards(JwtAuthGuard)
  @Post()
    async create(
    @Req() req: ExpressRequest, 
    @Body() body: any
    ) {

    const { position_code, position_name } = body;
    const userId = (req.user as any)?.id; 

    return this.positionsService.createPositions(position_code, position_name, userId);
  }

  //  PUT update position
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { position_code?: string; position_name?: string },
  ) {
    return this.positionsService.update(id, data);
  }

  //  DELETE position
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.delete(id);
  }
}
