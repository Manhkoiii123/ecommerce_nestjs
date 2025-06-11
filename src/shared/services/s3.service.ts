import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import envConfig from 'src/shared/config';

@Injectable()
export class S3Service {
  private s3: S3;
  constructor() {
    this.s3 = new S3({
      region: envConfig.S3_REGION,
      credentials: {
        accessKeyId: envConfig.S3_ACCESS_KEY,
        secretAccessKey: envConfig.S3_SECRET_KEY,
      },
    });
    // this.s3.listBuckets().then((data) => console.log(data));
  }

  UploadFile({
    filename,
    filepath,
    contentType,
  }: {
    filename: string;
    filepath: string;
    contentType: string;
  }) {
    const parallelUploads3 = new Upload({
      client: this.s3,
      params: {
        Bucket: envConfig.S3_BUCKET_NAME,
        Key: filename,
        Body: readFileSync(filepath),
        ContentType: contentType,
      },
      tags: [],
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });
    parallelUploads3.on('httpUploadProgress', (progress) => {
      console.log(progress);
    });
    return parallelUploads3.done();
  }
}

// const s3Instance = new S3Service();

// s3Instance
//   .UploadFile({
//     filename: 'images/1d472dd4-59e8-4ca3-b47f-30fa814e5994.jpg',
//     filepath:
//       'D:/09_nestJS/ecommerce/upload/1d472dd4-59e8-4ca3-b47f-30fa814e5994.jpg',
//     contentType: 'image/png',
//   })
//   .then(console.log)
//   .catch(console.error);
