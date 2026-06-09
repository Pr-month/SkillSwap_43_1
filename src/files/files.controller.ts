import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './files.confg';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    return this.filesService.upload(files);
  }
}
