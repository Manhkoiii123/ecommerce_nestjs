import { Module, OnModuleInit } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import multer from 'multer';
import { MediaController } from 'src/routes/media/media.controller';
import { MediaService } from 'src/routes/media/media.service';
import { UPLOAD_DIR } from 'src/shared/constants/other.constant';
import { generateRandomFilename } from 'src/shared/helpers';
const storage = multer.diskStorage({
  // quy định đường dẫn file
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const newFilename = generateRandomFilename(file.originalname);
    cb(null, newFilename);
  },
});

@Module({
  imports: [
    MulterModule.register({
      storage: storage,
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [],
})
export class MediaModule implements OnModuleInit {
  onModuleInit() {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
      console.log('📁 Created upload directory at:', UPLOAD_DIR);
    }
  }
}
