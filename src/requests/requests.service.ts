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

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<RequestEntity>,
    private readonly usersService: UsersService,
    private readonly skillsService: SkillsService,
  ) {}

  async findById(requestId: string): Promise<RequestEntity> {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
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

    return this.requestsRepository.save(request);
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

    if (request.receiver !== user) {
      throw new ForbiddenException('Forbidden for you');
    }

    request.status = changeRequestStatusDto.status;

    return this.requestsRepository.save(request);
  }

  async deleteRequest(
    userId: string,
    userRole: Role,
    requestId: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    const request = await this.findById(requestId);

    if (request.sender !== user || userRole !== Role.ADMIN) {
      throw new ForbiddenException('Forbidden for you');
    }

    await this.requestsRepository.delete(request);
  }
}
