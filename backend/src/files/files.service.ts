import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  upload(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.resolve(files.map((file) => `/uploads/${file.filename}`));
  }
}
