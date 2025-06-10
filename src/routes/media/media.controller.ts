import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('media')
export class MediaController {
  @Post('images/upload')
  @UseInterceptors(FileInterceptor('file')) // key là file trên formData
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }
}
