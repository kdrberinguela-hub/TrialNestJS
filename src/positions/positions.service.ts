import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { OkPacket, RowDataPacket } from 'mysql2';

@Injectable()
export class PositionsService {
  constructor(private readonly db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // ✅ Get all positions
  async findAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>('SELECT * FROM positions');
    return rows;
  }

  // ✅ Get one position by ID
  async findById(position_id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM positions WHERE position_id = ?',
      [position_id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Position with ID ${position_id} not found`);
    }
    return rows[0];
  }

  // ✅ Create new position (id auto-increments)
  async createPositions(position_code: string, position_name: string, id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO positions (position_code, position_name, id) VALUES (?, ?, ?)',
      [position_code, position_name, id?? null]
    );

    return {
      position_id: (result as any).insertId,
      position_code,
      position_name,
      id,
    };
  }

  // ✅ Update position
  async update(position_id: number, data: { position_code?: string; position_name?: string }) {
    const { position_code, position_name } = data;
    const [result]: any = await this.pool().execute(
      'UPDATE positions SET position_code = ?, position_name = ? WHERE position_id = ?',
      [position_code, position_name, position_id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Position with ID ${position_id} not found`);
    }

    return { position_id, position_code, position_name };
  }

  // ✅ Delete position
  async delete(position_id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM positions WHERE position_id = ?',
      [position_id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Position with ID ${position_id} not found`);
    }

    return { message: `Position ${position_id} deleted successfully` };
  }
}
