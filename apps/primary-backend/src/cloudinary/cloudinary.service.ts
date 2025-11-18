import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Request } from 'express';
import { DatabaseService } from 'src/database/database.service';
import { CloudinaryException } from 'src/common/filters/cloudinary-exception.filter';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject('CLOUDINARY') private cloudinary: any,
  ) {}

  async uploadPdf(file: { buffer: Buffer }, req: Request) {
    const userId = (req as any).userId;
    if (!userId) {
      throw new BadRequestException('Authenticated user context not found');
    }
    const existingUserDetails = await this.databaseService.userDetails.findUnique({
      where: { userId },
    });
    if (existingUserDetails.resumeLink) {
      throw new BadRequestException('Resume already uploaded');
    }
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'pdfs' },
        async (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            return reject(new CloudinaryException(error));
          }
          try {
            const saved = await this.databaseService.userDetails.update({
              where: { userId },
              data: { resumeLink: result.secure_url },
            });
            if (!saved) {
              return reject(new Error('Failed to update user details'));
            }
            resolve(saved);
          } catch (dbError) {
            reject(dbError);
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
