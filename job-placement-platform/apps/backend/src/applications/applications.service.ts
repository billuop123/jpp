import { BadRequestException, Injectable, UnauthorizedException, Logger, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ApplicationDto } from './dto/application.dto';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserDetailsService } from 'src/user-details/user-details.service';

@Injectable()
export class ApplicationsService {
    private readonly logger = new Logger(ApplicationsService.name);
    
    constructor(
        private readonly databaseService:DatabaseService,
        private readonly usersService:UsersService,
        private readonly userDetailsService:UserDetailsService,
        @Inject('GEMINI') private readonly gemini: GoogleGenerativeAI
    ){}
    
    async create(application:ApplicationDto,req:Request){
        const userId = req.userId;
        
        if(!userId){
            this.logger.error('User ID not found in request');
            throw new UnauthorizedException('User ID not found in token');
        }
        const user=await this.databaseService.users.findUnique({
            where:{
                id:userId,
            }
        });
        if(!user){
            throw new BadRequestException('User not found');
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
        if(application?.relevanceScore){
            throw new BadRequestException('Interview already analyzed');
        }
        const resumeText=await this.userDetailsService.getResumeText(userId);
        if(!resumeText){
            throw new BadRequestException('Resume text not found');
        }
        if(application.userId !== userId){
            throw new UnauthorizedException('Not authorized to analyze this application');
        }
        if(!application.conversationHistory){
            throw new BadRequestException('No conversation history found');
        }

        const job = application.job;
        const prompt = `You are an expert recruiter analyzing an interview transcript and resume text matching the job requirements. 

IMPORTANT: Be strict in your evaluation. Short interviews or brief responses should receive lower scores. Each score category (0-2) should reflect:
- 0: Poor/Inadequate - Lacks depth, unclear responses, or insufficient demonstration of skills
- 1: Satisfactory - Shows basic understanding but lacks depth or has some gaps
- 2: Excellent - Demonstrates strong skills, clear communication, and thorough knowledge

Job Details:
- Title: ${job.title}
- Description: ${job.description || 'Not provided'}
- Requirements: ${job.requirements || 'Not provided'}
- Required Skills: ${job.skills?.join(', ') || 'Not specified'}
- Company: ${job.company.name}

Interview Transcript:
${application.conversationHistory}

Analyze this interview and provide:
1. A detailed relevance comment explaining the score, highlighting strengths and areas for improvement
2. Consider the depth and quality of responses, not just their presence
3. Penalize brief or superficial answers

Return your response as JSON in this exact format:
{
  "relevancecomment": "<detailed analysis comment>",
  "technicalScore": <Int between 0-2 this is the score for the technical skills of the candidate>,
  "communicationScore": <int between 0-2 this is the score for the communication skills of the candidate>,
  "problemSolvingScore": <int between 0-2 this is the score for the problem solving skills of the candidate>,
  "jobRelevanceScore": <int between 0-2 this is the score for the job relevance of the candidate>,
  "depthOfKnowledgeScore": <int between 0-2 this is the score for the depth of knowledge of the candidate>,
  "strengths": "<description of strengths>",
  "weaknesses": "<description of weaknesses>"
}

Candidate Resume Information:
${resumeText || 'No resume provided'}
`;

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
            const relevancecomment = analysis.relevancecomment || 'No analysis available';
            const technicalScore = Math.max(0, Math.min(2, parseInt(analysis.technicalScore) || 0));
            const communicationScore = Math.max(0, Math.min(2, parseInt(analysis.communicationScore) || 0));
            const problemSolvingScore = Math.max(0, Math.min(2, parseInt(analysis.problemSolvingScore) || 0));
            const jobRelevanceScore = Math.max(0, Math.min(2, parseInt(analysis.jobRelevanceScore) || 0));
            const depthOfKnowledgeScore = Math.max(0, Math.min(2, parseInt(analysis.depthOfKnowledgeScore) || 0));
            const strengths = analysis.strengths || 'No strengths available';
            const weaknesses = analysis.weaknesses || 'No weaknesses available';
            const updatedApplication = await this.databaseService.applications.update({
                where: { id: applicationId },
                data: {
                    relevanceScore:technicalScore+communicationScore+problemSolvingScore+jobRelevanceScore+depthOfKnowledgeScore,
                    relevancecomment,
                    technicalScore,
                    communicationScore,
                    problemSolvingScore,
                    jobRelevanceScore,
                    depthOfKnowledgeScore,
                    strengths,
                    weaknesses,
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
                },

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
    async interviewExists(applicationId:string){
        const application=await this.databaseService.applications.findUnique({
            where:{
                id:applicationId,
            }
        })
        if(!application){
            throw new NotFoundException('Application not found');
        }
        if(application.relevanceScore==null){
            return {
                status: false,
            };
        }
        return {
            status: true,
        };
    }
    async getRecruiterApplications(jobId:string){
        const job=await this.databaseService.jobs.findUnique({
            where:{
                id:jobId,
            },
        })
        if(!job){
            throw new NotFoundException('Job not found');
        }
        const applications=await this.databaseService.applications.findMany({
            where:{
                jobId
            },
        })
        if(!applications){
            throw new NotFoundException('Applications not found');
        }
        return applications
    }
    async getScoringList(jobId:string){
        const applications=await this.databaseService.applications.findMany({
            where:{
                jobId
            },
            select:{
                id:true,
                relevanceScore:true,
                acceptanceEmailSent:true,
                rejectionEmailSent:true,
                user:{
                    select:{
                        id:true,
                        name:true,
                        email:true,
                    }
                }
            }
        })
        if(!applications){
            throw new NotFoundException('Applications not found');
        }
        return applications
    }
    async getUserApplicationDetails(jobId:string,userId:string){
        await this.usersService.userExistsById(userId);
        const application=await this.databaseService.applications.findFirst({
            where:{
                jobId,
                userId
            },
            select:{
                id:true,
                applicationstatus:{
                    select:{
                        name:true,
                    }
                },
                relevanceScore:true,
                relevancecomment:true,
                technicalScore:true,
                communicationScore:true,
                problemSolvingScore:true,
                jobRelevanceScore:true,
                depthOfKnowledgeScore:true,
                strengths:true,
                weaknesses:true,
                coverletter:true,
                notes:true,
                user:{
                    select:{
                        id:true,
                        name:true,
                        email:true,
                        userDetails:{
                            select:{
                                resumeLink:true,
                            }
                        }
                    }
                }
        }})
        if(!application){
            throw new NotFoundException('Application not found');
        }
        return application
    }
    async getMyApplicationStatus(jobId:string,userId:string){
        await this.usersService.userExistsById(userId);
        const application=await this.databaseService.applications.findFirst({
            where:{
                jobId,
                userId,
            },
            select:{
                id:true,
                applicationstatus:{
                    select:{
                        name:true,
                    }
                }
            }
        })
        if(!application){
            return {
                exists:false,
            }
        }
        return {
            exists:true,
            status:application.applicationstatus.name,
            applicationId:application.id,
        }
    }
    async getUserDetails(userId:string){
        const user=await this.databaseService.users.findUnique({
            where:{
                id:userId,
            },
            select:{
                userDetails:{
                    select:{
                        resumeLink:true,
                        experience:true,
                        location:true,
                        linkedin:true,
                        portfolio:true,
                        github:true,
                        expectedSalary:true,
                        availability:true,
                        skills:true,
                    }
                },
                name:true,
                email:true,
            }
        })
        if(!user){
            throw new NotFoundException('User not found');
        }
        return user
    }
    async listMyInterviews(userId: string) {
        await this.usersService.userExistsById(userId);

        const applications = await this.databaseService.applications.findMany({
            where: {
                userId,
                relevanceScore: {
                    not: null,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                createdAt: true,
                relevanceScore: true,
                applicationstatus: {
                    select: {
                        name: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return applications;
    }
    async listMyApplications(userId: string) {
        await this.usersService.userExistsById(userId);

        const applications = await this.databaseService.applications.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                createdAt: true,
                relevanceScore: true,
                applicationstatus: {
                    select: {
                        name: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return applications;
    }
}
