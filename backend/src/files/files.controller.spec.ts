import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;
  const filesService = { upload: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [{ provide: FilesService, useValue: filesService }],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service upload with files and return result', async () => {
    const files = [{ filename: 'img.jpg' }] as Express.Multer.File[];
    const expected = ['/uploads/img.jpg'];
    filesService.upload.mockResolvedValue(expected);

    const result = await controller.upload(files);

    expect(filesService.upload).toHaveBeenCalledWith(files);
    expect(result).toBe(expected);
  });
});
