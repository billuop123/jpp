import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Request } from 'express';
import { DatabaseService } from 'src/database/database.service';
import { CloudinaryException } from 'src/common/filters/cloudinary-exception.filter';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly usersService: UsersService,
    @Inject('CLOUDINARY') private cloudinary: any,
  ) {}
  private async uploadOrUpdatePdf(
    file: { buffer: Buffer },
    req: Request,
    { allowExisting }: { allowExisting: boolean },
  ) {
    const userId = (req as any).userId;
    if (!userId) {
      throw new BadRequestException('Authenticated user context not found');
    }
    await this.usersService.userExistsById(userId);
    let existingUserDetails = await this.databaseService.userDetails.findUnique({
      where: { userId },
    });
    if (!existingUserDetails) {
      existingUserDetails = await this.databaseService.userDetails.create({
        data: {
          userId,
        },
      });
    }
    if (existingUserDetails.resumeLink && !allowExisting) {
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
  async uploadPdf(file: { buffer: Buffer }, req: Request) {
    return this.uploadOrUpdatePdf(file, req, { allowExisting: false });
  }

  async updatePdf(file: { buffer: Buffer }, req: Request) {
    return this.uploadOrUpdatePdf(file, req, { allowExisting: true });
  }
  async uploadCompanyIncorporationPdf(file:{buffer:Buffer},req:Request,companyId:string){
    const userId=(req as any).userId;
    if(!userId){
      throw new BadRequestException('Authenticated user context not found');
    }
    await this.usersService.userExistsById(userId);
    const company=await this.databaseService.companies.findUnique({
      where: { id: companyId },
      select: { userId: true },
    });
    if(!company){
      throw new NotFoundException('Company not found');
    }
    if(company.userId!==userId){
      throw new UnauthorizedException('You are not authorized to upload company incorporation pdf');
    }
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'pdfs' },
        async (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            return reject(new CloudinaryException(error));
          }
          try {
            const updated = await this.databaseService.companies.update({
              where: { id: companyId },
              data: { incorporationLink: result.secure_url },
            });
            resolve(updated);
          } catch (dbError) {
            reject(dbError);
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }
  async removeUploadedResume(req: Request) {
    const userId = (req as any).userId;
    if (!userId) {
      throw new BadRequestException('Authenticated user context not found');
    }
    await this.usersService.userExistsById(userId);
    const existingUserDetails = await this.databaseService.userDetails.findUnique({
      where: { userId },
      select: { resumeLink: true },
    });

    if (!existingUserDetails || !existingUserDetails.resumeLink) {
      throw new NotFoundException('No resume found to remove');
    }

    return this.databaseService.userDetails.update({
      where: { userId },
      data: { resumeLink: null },
    });
  }
}
