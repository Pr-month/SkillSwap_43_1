import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request as RequestEntity } from './entities/request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { SkillsService } from '../skills/skills.service';
import { ChangeRequestStatusDto, CreateRequestDto } from './dto';
import { Role } from '../users/entities/user.enums';
import { RequestsGateway } from './requests.gateway';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<RequestEntity>,
    private readonly usersService: UsersService,
    private readonly skillsService: SkillsService,
    private readonly requestsGateway: RequestsGateway,
  ) {}

  async findById(requestId: string): Promise<RequestEntity> {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
      relations: { sender: true, receiver: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async create(
    ownerId: string,
    createRequestDto: CreateRequestDto,
  ): Promise<RequestEntity> {
    const sender = await this.usersService.findById(ownerId);
    const offeredSkill = await this.skillsService.findById(
      createRequestDto.offeredSkill,
    );

    if (offeredSkill.owner.id !== sender.id)
      throw new BadRequestException("Cannot offer someone else's skill");

    const requestedSkill = await this.skillsService.findById(
      createRequestDto.requestedSkill,
    );

    if (requestedSkill.owner.id === sender.id)
      throw new BadRequestException('Cannot send request to yourself');

    const request = this.requestsRepository.create({
      receiver: requestedSkill.owner,
      requestedSkill,
      offeredSkill,
    });

    const savedRequest = await this.requestsRepository.save(request);

    this.requestsGateway.notifyRequestCreated(
      requestedSkill.owner.id,
      savedRequest,
    );

    return savedRequest;
  }

  async getIncoming(userId: string): Promise<RequestEntity[]> {
    return await this.requestsRepository.find({
      where: {
        receiver: { id: userId },
      },
    });
  }

  async getOutgoing(userId: string): Promise<RequestEntity[]> {
    return await this.requestsRepository.find({
      where: {
        sender: { id: userId },
      },
    });
  }

  async changeRequestStatus(
    userId: string,
    requestId: string,
    changeRequestStatusDto: ChangeRequestStatusDto,
  ): Promise<RequestEntity> {
    const user = await this.usersService.findById(userId);
    const request = await this.findById(requestId);

    if (request.receiver.id !== user.id) {
      throw new ForbiddenException('Forbidden for you');
    }

    request.status = changeRequestStatusDto.status;

    const updatedRequest = await this.requestsRepository.save(request);

    this.requestsGateway.notifyRequestStatusChanged(
      request.sender.id,
      updatedRequest,
    );

    return updatedRequest;
  }

  async deleteRequest(
    userId: string,
    userRole: Role,
    requestId: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    const request = await this.findById(requestId);

    if (request.sender.id !== user.id && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Forbidden for you');
    }

    await this.requestsRepository.delete(request);
  }
}
