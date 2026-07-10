import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ApiFilesUpload } from './docs/files.swagger';
import { multerOptions } from './files.confg';
import { FilesService } from './files.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiFilesUpload()
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    return this.filesService.upload(files);
  }
}
