import { BadRequestException, Injectable, UnauthorizedException, Logger, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ApplicationDto } from './dto/application.dto';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ApplicationsService {
    private readonly logger = new Logger(ApplicationsService.name);
    
    constructor(
        private readonly databaseService:DatabaseService,
        private readonly usersService:UsersService,
        @Inject('GEMINI') private readonly gemini: GoogleGenerativeAI
    ){}
    
    async create(application:ApplicationDto,req:Request){
        const userId = (req as any).userId;
        
        if(!userId){
            this.logger.error('User ID not found in request');
            throw new UnauthorizedException('User ID not found in token');
        }

        if(typeof userId !== 'string'){
            this.logger.error(`Invalid userId type: ${typeof userId}, value: ${userId}`);
            throw new BadRequestException('Invalid user ID format');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if(!uuidRegex.test(userId)){
            this.logger.error(`Invalid UUID format for userId: ${userId}`);
            throw new BadRequestException('Invalid user ID format');
        }

        if(!uuidRegex.test(application.jobId)){
            this.logger.error(`Invalid UUID format for jobId: ${application.jobId}`);
            throw new BadRequestException('Invalid job ID format');
        }
        await this.usersService.userExistsById(userId);

        const job=await this.databaseService.jobs.findUnique({
            where:{
                id:application.jobId,
            },
        })
        if(!job){
            this.logger.error(`Job not found with ID: ${application.jobId}`);
            throw new BadRequestException('Job not found');
        }
        
        const existingApplication=await this.databaseService.applications.findFirst({
            where:{
                jobId:application.jobId,
                userId:userId,
            }
        })

        if(existingApplication){
            throw new BadRequestException('Application already exists');
        }
        
        const applicationStatus=await this.databaseService.applicationstatus.findUnique({
            where:{
                code:'PENDING',
            },
            select:{
                id:true,
            },
        })
        if(!applicationStatus){
            throw new BadRequestException('Application status not found');
        }
        
        try {
            const newApplication=await this.databaseService.applications.create({
                data:{
                    jobId:application.jobId,
                    userId:userId,
                    coverletter:application.coverLetter,
                    notes:application.notes,
                    applicationstatusId:applicationStatus.id,
                }
            })
            return newApplication;
        } catch (error) {
            this.logger.error('Error creating application:', error);
            throw error;
        }
    }
    async analyzeInterview(applicationId: string, userId: string){
        const application = await this.databaseService.applications.findUnique({
            where: { id: applicationId },
            include: {
                job: {
                    include: {
                        company: true
                    }
                }
            }
        });
        if(!application){
            throw new BadRequestException('Application not found');
        }
        if(application.userId !== userId){
            throw new UnauthorizedException('Not authorized to analyze this application');
        }
        if(!application.conversationHistory){
            throw new BadRequestException('No conversation history found');
        }

        const job = application.job;
        const prompt = `You are an expert recruiter analyzing an interview transcript. 

Job Details:
- Title: ${job.title}
- Description: ${job.description || 'Not provided'}
- Requirements: ${job.requirements || 'Not provided'}
- Required Skills: ${job.skills?.join(', ') || 'Not specified'}
- Company: ${job.company.name}

Interview Transcript:
${application.conversationHistory}

Analyze this interview and provide:
1. A relevance score from 0-100 based on how well the candidate's responses match the job requirements
2. A detailed relevance comment explaining the score, highlighting strengths and areas for improvement

Return your response as JSON in this exact format:
{
  "relevanceScore": <number between 0-100>,
  "relevancecomment": "<detailed analysis comment>"
}`;

        try {
            const model = this.gemini.getGenerativeModel({ 
                model: 'gemini-2.5-flash',
                systemInstruction: 'You are an expert recruiter. Analyze interviews and provide scores and feedback in JSON format only. Return your response in this exact format: {"relevanceScore": <number between 0-100>, "relevancecomment": "<detailed analysis comment>"}',
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: 'application/json',
                }
            });

            const result = await model.generateContent(prompt);

            const response = await result.response;
            const text = response.text();

            const analysis = JSON.parse(text || '{}');
            const relevanceScore = Math.max(0, Math.min(100, parseInt(analysis.relevanceScore) || 0));
            const relevancecomment = analysis.relevancecomment || 'No analysis available';

            const updatedApplication = await this.databaseService.applications.update({
                where: { id: applicationId },
                data: {
                    relevanceScore,
                    relevancecomment
                }
            });

            return updatedApplication;
        } catch (error) {
            this.logger.error('Error analyzing interview:', error);
            throw new BadRequestException('Failed to analyze interview');
        }
    }
    async getApplicationWithJob(applicationId: string, userId: string){
        const application = await this.databaseService.applications.findUnique({
            where: { id: applicationId },
            include: {
                job: {
                    include: {
                        company: true,
                        jobtype: true
                    }
                }
            }
        });
        if(!application){
            throw new NotFoundException('Application not found');
        }
        if(application.userId !== userId){
            throw new UnauthorizedException('Not authorized to view this application');
        }
        return application;
    }
}
