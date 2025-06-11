import {
  BadRequestException,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import path from 'path';
import { MediaService } from 'src/routes/media/media.service';
import { UPLOAD_DIR } from 'src/shared/constants/other.constant';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { S3Service } from 'src/shared/services/s3.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly mediaService: MediaService,
  ) {}

  @Post('images/upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 1024 * 1024 * 10,
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `File type ${file.mimetype} not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }))
        .build(),
    )
    files: Array<Express.Multer.File>,
  ) {
    const res = await this.mediaService.uploadFiles(files);
    return res;
    // return files.map((file) => ({
    //   url: `${envConfig.PREFIX_STATIC_ENDPOINT}/${file.filename}`,
    // }));
  }

  @Get('static/:filename')
  @IsPublic()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
      if (error) {
        res.status(404).json({ message: 'File not found', statusCode: 404 });
      }
    });
  }
}
