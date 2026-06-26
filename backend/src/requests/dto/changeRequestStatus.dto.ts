import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { REQUEST_STATUS } from '../entities/request.enum';

export class ChangeRequestStatusDto {
  @ApiProperty({
    description: 'Новый статус заявки',
    enum: REQUEST_STATUS,
    example: REQUEST_STATUS.ACCEPTED,
  })
  @IsEnum(REQUEST_STATUS)
  status!: REQUEST_STATUS;
}
