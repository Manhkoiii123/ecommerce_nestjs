import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('media')
export class MediaController {
  @Post('images/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 10, // ưu tiên lấy cái này
      },
    }),
  ) // key là file trên formData
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /(jpeg|jpg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(file);
  }
}
