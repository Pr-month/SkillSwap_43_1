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
import { RequestsService } from './requests.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Request } from './entities/request.entity';
import { CreateRequestStatusDto } from './dto';
import { ChangeRequestStatusDto } from './dto/changeRequest.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createRequestDto: CreateRequestStatusDto,
  ): Promise<Request> {
    return this.requestsService.create(request.user.id, createRequestDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('incoming')
  getIncoming(@Req() request: AuthenticatedRequest): Promise<Request[]> {
    return this.requestsService.getIncoming(request.user.id);
  }

  @UseGuards(AccessTokenGuard)
  @Get('outgoing')
  getOutgoing(@Req() request: AuthenticatedRequest): Promise<Request[]> {
    return this.requestsService.getOutgoing(request.user.id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  changeRequestStatus(
    @Req() request: AuthenticatedRequest,
    @Param(':id') requestId: string,
    @Body() changeRequestStatusDto: ChangeRequestStatusDto,
  ): Promise<Request> {
    return this.requestsService.changeRequestStatus(
      request.user.id,
      requestId,
      changeRequestStatusDto,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteRequest(
    @Req() request: AuthenticatedRequest,
    @Param(':id') requestId: string,
  ): Promise<void> {
    await this.requestsService.deleteRequest(
      request.user.id,
      request.user.role,
      requestId,
    );
  }
}
