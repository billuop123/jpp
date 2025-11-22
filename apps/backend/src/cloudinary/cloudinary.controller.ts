import { BadRequestException, Controller, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
const pdfFileFilter=(req,file,cb)=>{
    if (!file.mimetype || !file.mimetype.includes('pdf')) {
        cb(new BadRequestException('Only PDF files are allowed'), false);
      } else {
        cb(null, true);
      }
}
@Controller()
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) {}
    @Put('upload-pdf')
    @UseInterceptors(
        FileInterceptor('file', {
          storage: memoryStorage(),
          fileFilter: pdfFileFilter,
          limits: { fileSize: 20 * 1024 * 1024 }, 
        }),
      )
    async uploadPdf(@Req() req: Request,@UploadedFile() file: any) {
        if(!file) throw new BadRequestException('No file uploaded');
        return await this.cloudinaryService.uploadPdf(file,req as any);
    }
}
