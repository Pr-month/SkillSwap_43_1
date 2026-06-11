import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateRequestDto } from './dto';
import { Role } from '../users/entities/user.enums';
import { REQUEST_STATUS } from './entities/request.enum';

describe('RequestsController', () => {
  let controller: RequestsController;
  const requestsService = {
    create: jest.fn(),
    getIncoming: jest.fn(),
    getOutgoing: jest.fn(),
    changeRequestStatus: jest.fn(),
    deleteRequest: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: requestsService,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RequestsController>(RequestsController);
  });
  const user = { id: 'user-id' };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a request', async () => {
    const request = {
      user: { id: user.id, role: Role.USER },
    } as AuthenticatedRequest;
    const dto: CreateRequestDto = {
      offeredSkill: 'skill-1',
      requestedSkill: 'skill-2',
    };
    const createdRequest = { id: 'request-id' };
    requestsService.create.mockResolvedValue(createdRequest);

    const result = await controller.create(request, dto);

    expect(requestsService.create).toHaveBeenCalledWith(user.id, dto);
    expect(result).toBe(createdRequest);
  });

  it('should get incoming requests', async () => {
    const request = {
      user: { id: user.id, role: Role.USER },
    } as AuthenticatedRequest;
    const incoming = [{ id: 'req-1' }];
    requestsService.getIncoming.mockResolvedValue(incoming);

    const result = await controller.getIncoming(request);

    expect(requestsService.getIncoming).toHaveBeenCalledWith(user.id);
    expect(result).toBe(incoming);
  });

  it('should get outgoing requests', async () => {
    const request = {
      user: { id: user.id, role: Role.USER },
    } as AuthenticatedRequest;
    const outgoing = [{ id: 'req-1' }];
    requestsService.getOutgoing.mockResolvedValue(outgoing);

    const result = await controller.getOutgoing(request);

    expect(requestsService.getOutgoing).toHaveBeenCalledWith(user.id);
    expect(result).toBe(outgoing);
  });

  it('should change request status', async () => {
    const request = {
      user: { id: user.id, role: Role.USER },
    } as AuthenticatedRequest;
    const changeStatusDto = { status: REQUEST_STATUS.ACCEPTED };
    const updatedRequest = {
      id: 'request-id',
      status: REQUEST_STATUS.ACCEPTED,
    };
    requestsService.changeRequestStatus.mockResolvedValue(updatedRequest);

    const result = await controller.changeRequestStatus(
      request,
      updatedRequest.id,
      changeStatusDto,
    );

    expect(requestsService.changeRequestStatus).toHaveBeenCalledWith(
      user.id,
      updatedRequest.id,
      changeStatusDto,
    );
    expect(result).toBe(updatedRequest);
  });

  it('should delete request and return 204', async () => {
    const request = {
      user: { id: user.id, role: Role.ADMIN },
    } as AuthenticatedRequest;
    requestsService.deleteRequest.mockResolvedValue(undefined);

    const result = await controller.deleteRequest(request, 'request-id');

    expect(requestsService.deleteRequest).toHaveBeenCalledWith(
      user.id,
      Role.ADMIN,
      'request-id',
    );
    expect(result).toBeUndefined();
  });
});
