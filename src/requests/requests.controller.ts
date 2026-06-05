import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createRequestDto: CreateRequestDto,
  ): Promise<Request> {
    return this.requestsService.create(request.user.id, createRequestDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('incoming')
  getIncoming(@Req() request: AuthenticatedRequest): Promise<Request[]> {
    return this.requestsService.getIncoming(request.user.id);
  }
}
