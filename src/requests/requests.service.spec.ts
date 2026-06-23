import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestsService } from './requests.service';
import { UsersService } from '../users/users.service';
import { SkillsService } from '../skills/skills.service';
import { Request as RequestEntity } from './entities/request.entity';
import { REQUEST_STATUS } from './entities/request.enum';
import { Role } from '../users/entities/user.enums';
import { CreateRequestDto } from './dto';
import { ChangeRequestStatusDto } from './dto';
import { RequestsGateway } from './requests.gateway';

describe('RequestsService', () => {
  let service: RequestsService;

  const requestsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const usersService = {
    findById: jest.fn(),
  };

  const skillsService = {
    findById: jest.fn(),
  };

  const requestsGateway = {
    notifyRequestCreated: jest.fn(),
    notifyRequestStatusChanged: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(RequestEntity),
          useValue: requestsRepository,
        },
        { provide: UsersService, useValue: usersService },
        { provide: SkillsService, useValue: skillsService },
        { provide: RequestsGateway, useValue: requestsGateway },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  describe('findById', () => {
    it('should return a request when found', async () => {
      const request = { id: 'request-id' };
      requestsRepository.findOne.mockResolvedValue(request);

      const result = await service.findById('request-id');

      expect(requestsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'request-id' },
        relations: { sender: true, receiver: true },
      });
      expect(result).toEqual(request);
    });

    it('should throw NotFoundException when request not found', async () => {
      requestsRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const sender = { id: 'sender-id' };
    const owner = { id: 'owner-id' };
    const offeredSkill = { id: 'offered-skill-id', owner: { id: sender.id } };
    const requestedSkill = {
      id: 'requested-skill-id',
      owner: { id: owner.id },
    };
    const createdRequest = { id: 'request-id', status: REQUEST_STATUS.PENDING };
    const dto: CreateRequestDto = {
      offeredSkill: offeredSkill.id,
      requestedSkill: requestedSkill.id,
    };

    it('should create a request successfully', async () => {
      usersService.findById.mockResolvedValue(sender);
      skillsService.findById
        .mockResolvedValueOnce(offeredSkill)
        .mockResolvedValueOnce(requestedSkill);
      requestsRepository.create.mockReturnValue(createdRequest);
      requestsRepository.save.mockResolvedValue(createdRequest);

      const result = await service.create(sender.id, dto);

      expect(usersService.findById).toHaveBeenCalledWith(sender.id);
      expect(skillsService.findById).toHaveBeenCalledWith(offeredSkill.id);
      expect(skillsService.findById).toHaveBeenCalledWith(requestedSkill.id);
      expect(requestsRepository.create).toHaveBeenCalledWith({
        receiver: requestedSkill.owner,
        requestedSkill,
        offeredSkill,
      });
      expect(requestsRepository.save).toHaveBeenCalledWith(createdRequest);
      expect(result).toEqual(createdRequest);
    });

    it('should throw BadRequestException when offered skill does not belong to user', async () => {
      usersService.findById.mockResolvedValue(sender);
      skillsService.findById.mockResolvedValueOnce({
        ...offeredSkill,
        owner: { id: 'other-user-id' },
      });

      await expect(service.create(sender.id, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(requestsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when sending request to yourself', async () => {
      usersService.findById.mockResolvedValue(sender);
      skillsService.findById
        .mockResolvedValueOnce(offeredSkill)
        .mockResolvedValueOnce({ ...requestedSkill, owner: sender });

      await expect(service.create(sender.id, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(requestsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getIncoming', () => {
    it('should return incoming requests for user', async () => {
      const requests = [{ id: 'req-1' }, { id: 'req-2' }];
      requestsRepository.find.mockResolvedValue(requests);

      const result = await service.getIncoming('user-id');

      expect(requestsRepository.find).toHaveBeenCalledWith({
        where: { receiver: { id: 'user-id' } },
      });
      expect(result).toEqual(requests);
    });
  });

  describe('getOutgoing', () => {
    it('should return outgoing requests for user', async () => {
      const requests = [{ id: 'req-1' }, { id: 'req-2' }];
      requestsRepository.find.mockResolvedValue(requests);

      const result = await service.getOutgoing('user-id');

      expect(requestsRepository.find).toHaveBeenCalledWith({
        where: { sender: { id: 'user-id' } },
      });
      expect(result).toEqual(requests);
    });
  });

  describe('changeRequestStatus', () => {
    const receiver = { id: 'receiver-id' };
    const sender = { id: 'sender-id' };
    const request = {
      id: 'request-id',
      status: REQUEST_STATUS.PENDING,
      receiver,
      sender,
    };
    const dto: ChangeRequestStatusDto = { status: REQUEST_STATUS.ACCEPTED };

    it('should change status when user is receiver', async () => {
      const user = { id: receiver.id };
      usersService.findById.mockResolvedValue(user);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(request as RequestEntity);
      requestsRepository.save.mockResolvedValue({
        ...request,
        status: REQUEST_STATUS.ACCEPTED,
      });

      const result = await service.changeRequestStatus(
        receiver.id,
        request.id,
        dto,
      );

      expect(usersService.findById).toHaveBeenCalledWith(receiver.id);
      expect(service.findById).toHaveBeenCalledWith(request.id);
      expect(requestsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: REQUEST_STATUS.ACCEPTED }),
      );
      expect(result.status).toBe(REQUEST_STATUS.ACCEPTED);
    });

    it('should throw ForbiddenException when user is not the receiver', async () => {
      const otherUser = { id: 'other-id' };
      usersService.findById.mockResolvedValue(otherUser);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(request as RequestEntity);

      await expect(
        service.changeRequestStatus(otherUser.id, request.id, dto),
      ).rejects.toThrow(ForbiddenException);
      expect(requestsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when request does not exist', async () => {
      usersService.findById.mockResolvedValue({ id: receiver.id });
      jest
        .spyOn(service, 'findById')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.changeRequestStatus(receiver.id, 'missing-id', dto),
      ).rejects.toThrow(NotFoundException);
      expect(requestsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteRequest', () => {
    const sender = { id: 'sender-id' };
    const request = { id: 'request-id', sender: { id: sender.id } };

    it('should delete request when user is the sender', async () => {
      usersService.findById.mockResolvedValue(sender);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(request as unknown as RequestEntity);
      requestsRepository.delete.mockResolvedValue(undefined);

      await service.deleteRequest(sender.id, Role.USER, request.id);

      expect(usersService.findById).toHaveBeenCalledWith(sender.id);
      expect(service.findById).toHaveBeenCalledWith(request.id);
      expect(requestsRepository.delete).toHaveBeenCalledWith(request);
    });

    it('should delete request when user is ADMIN', async () => {
      const admin = { id: 'admin-id' };
      usersService.findById.mockResolvedValue(admin);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(request as RequestEntity);
      requestsRepository.delete.mockResolvedValue(undefined);

      await service.deleteRequest(admin.id, Role.ADMIN, request.id);

      expect(requestsRepository.delete).toHaveBeenCalledWith(request);
    });

    it('should throw ForbiddenException when user is not sender or ADMIN', async () => {
      const otherUser = { id: 'other-id' };
      usersService.findById.mockResolvedValue(otherUser);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(request as RequestEntity);

      await expect(
        service.deleteRequest(otherUser.id, Role.USER, request.id),
      ).rejects.toThrow(ForbiddenException);
      expect(requestsRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when request not found', async () => {
      usersService.findById.mockResolvedValue(sender);
      jest
        .spyOn(service, 'findById')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.deleteRequest(sender.id, Role.USER, 'missing-id'),
      ).rejects.toThrow(NotFoundException);
      expect(requestsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
