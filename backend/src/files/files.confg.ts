import { randomUUID } from 'crypto';
import { Request } from 'express';
import { diskStorage, FileFilterCallback, Options } from 'multer';
import { extname } from 'path';

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export const multerOptions: Options = {
  storage: diskStorage({
    destination: './public/uploads',
    filename: (
      _req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),

  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error('Недопустимый тип файла'));
      return;
    }

    callback(null, true);
  },
};
