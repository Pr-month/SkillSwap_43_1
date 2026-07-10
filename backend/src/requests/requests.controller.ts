import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import {
  ApiRequestsChangeStatus,
  ApiRequestsCreate,
  ApiRequestsDelete,
  ApiRequestsGetIncoming,
  ApiRequestsGetOutgoing,
} from './docs/requests.swagger';
import { ChangeRequestStatusDto, CreateRequestDto } from './dto';
import { Request } from './entities/request.entity';
import { RequestsService } from './requests.service';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @ApiRequestsCreate()
  @UseGuards(AccessTokenGuard)
  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createRequestDto: CreateRequestDto,
  ): Promise<Request> {
    return this.requestsService.create(request.user.id, createRequestDto);
  }

  @ApiRequestsGetIncoming()
  @UseGuards(AccessTokenGuard)
  @Get('incoming')
  getIncoming(@Req() request: AuthenticatedRequest): Promise<Request[]> {
    return this.requestsService.getIncoming(request.user.id);
  }

  @ApiRequestsGetOutgoing()
  @UseGuards(AccessTokenGuard)
  @Get('outgoing')
  getOutgoing(@Req() request: AuthenticatedRequest): Promise<Request[]> {
    return this.requestsService.getOutgoing(request.user.id);
  }

  @ApiRequestsChangeStatus()
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  changeRequestStatus(
    @Req() request: AuthenticatedRequest,
    @Param('id') requestId: string,
    @Body() changeRequestStatusDto: ChangeRequestStatusDto,
  ): Promise<Request> {
    return this.requestsService.changeRequestStatus(
      request.user.id,
      requestId,
      changeRequestStatusDto,
    );
  }

  @ApiRequestsDelete()
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteRequest(
    @Req() request: AuthenticatedRequest,
    @Param('id') requestId: string,
  ): Promise<void> {
    await this.requestsService.deleteRequest(
      request.user.id,
      request.user.role,
      requestId,
    );
  }
}
