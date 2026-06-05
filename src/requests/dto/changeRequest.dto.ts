import { REQUEST_STATUS } from '../entities/request.enum';

export interface ChangeRequestStatusDto {
  status: REQUEST_STATUS;
}
