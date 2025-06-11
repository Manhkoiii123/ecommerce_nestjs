import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/shared/services/s3.service';
import { unlink } from 'fs';
@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}
  async uploadFiles(files: Array<Express.Multer.File>) {
    const res = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .UploadFile({
            filename: 'images/' + file.filename,
            filepath: file.path,
            contentType: file.mimetype,
          })
          .then((res) => {
            return {
              url: res.Location,
            };
          });
      }),
    );
    // xóa file sau ki upload xong lên s3
    await Promise.all(
      files.map((file) => {
        unlink(file.path, (err) => {
          if (err) console.log(err);
        });
      }),
    );
    return res;
  }
}
