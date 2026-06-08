import { REQUEST_STATUS } from '../entities/request.enum';
import { IsEnum } from 'class-validator';

export class ChangeRequestStatusDto {
  @IsEnum(REQUEST_STATUS)
  status: REQUEST_STATUS;
}
