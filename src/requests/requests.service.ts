import { Injectable } from '@nestjs/common';
import { Request as RequestEntity } from './entities/request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { SkillsService } from '../skills/skills.service';
import { CreateRequestDto } from './dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<RequestEntity>,
    private readonly usersService: UsersService,
    private readonly skillsService: SkillsService,
  ) {}

  async create(
    ownerId: string,
    createRequestDto: CreateRequestDto,
  ): Promise<RequestEntity> {
    const requestedSkill = await this.skillsService.findById(
      createRequestDto.requestedSkill,
    );
    const offeredSkill = await this.skillsService.findById(
      createRequestDto.offeredSkill,
    );
    const sender = await this.usersService.findById(ownerId);

    const request = this.requestsRepository.create({
      sender,
      receiver: requestedSkill.owner,
      requestedSkill,
      offeredSkill,
    });

    return this.requestsRepository.save(request);
  }

  async getIncoming(userId: string): Promise<RequestEntity[]> {
    const user = await this.usersService.findById(userId);

    return user.incomingRequests;
  }

  async getOutgoing(userId: string): Promise<RequestEntity[]> {
    const user = await this.usersService.findById(userId);

    return user.outgoingRequests;
  }
}
