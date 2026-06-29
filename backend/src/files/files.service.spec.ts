import { FilesService } from './files.service';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(() => {
    service = new FilesService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return uploaded file urls', async () => {
    const files = [
      { filename: 'file1.jpg' },
      { filename: 'file2.png' },
    ] as Express.Multer.File[];

    const result = await service.upload(files);

    expect(result).toEqual([
      `/uploads/${files[0].filename}`,
      `/uploads/${files[1].filename}`,
    ]);
  });

  it('should return empty array when no files provided', async () => {
    const result = await service.upload([]);

    expect(result).toEqual([]);
  });
});
