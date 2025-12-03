import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VapiClient } from "@vapi-ai/server-sdk";
import { JobsService } from 'src/jobs/jobs.service';
import { DatabaseService } from 'src/database/database.service';
import { UserDetailsService } from 'src/user-details/user-details.service';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class VapiService {
    private vapi: VapiClient;
    constructor(
        private readonly jobsService: JobsService,
        private readonly config:ConfigService,
        private readonly databaseService: DatabaseService,
        private readonly userDetailsService: UserDetailsService,
        private readonly usersService: UsersService
    ) {
        this.vapi = new VapiClient({
            token: this.config.get<string>('VAPIAPI_KEY')!
          });
    }
    async assistantCall(jobId:string,userId:string){
        const job=await this.jobsService.findOneJob(jobId);
        await this.usersService.userExistsById(userId);
        const resumeText=await this.userDetailsService.getResumeText(userId);
        const assistant = await this.vapi.assistants.create({
            name: "Job Interview Assistant",
            firstMessage: "Hi, I'm your job interviewer. Let's start the interview. Please start the interview by introducing yourself and why do you think you fit this role?",
            model: {
              provider: "openai",
              model: "gpt-4o",
              temperature: 0.7,
              messages: [{
                role: "system",
                content: `You are a professional job interviewer conducting a 5-minute interview. 

IMPORTANT RULES:
1. Ask ONE question at a time - wait for the candidate's response before asking the next question
2. Do NOT provide feedback, scores, or evaluations during the interview
3. Do NOT tell the candidate how they're doing or rate their answers
4. Keep questions concise and professional
5. After each answer, move to the next question smoothly
6. The interview should last approximately 5 minutes
7.Ask the question such that it becomes easier to track the technicalScore, communicationScore, problemSolvingScore, jobRelevanceScore, depthOfKnowledgeScore of the candidate.

Job Information:
- Job Title: ${job.title}
- Job Description: ${job.description || 'Not provided'}
- Job Requirements: ${job.requirements || 'Not provided'}
- Job Responsibilities: ${job.responsibilities || 'Not provided'}
- Job Benefits: ${job.benefits || 'Not provided'}
- Job Location: ${job.location || 'Not provided'}
- Salary Range: ${job.salaryMin || 'N/A'} - ${job.salaryMax || 'N/A'} ${job.salaryCurrency}
- Experience Level Required: ${job.experienceLevel || 'Not specified'} years
- Required Skills: ${job.skills?.join(', ') || 'Not specified'}
- Company: ${job.company.name}

Candidate Resume Information:
${resumeText || 'No resume provided'}

Start the interview by introducing yourself and asking the first question. Focus on understanding the candidate's experience, skills, and fit for this role.`
              }]
            },
            voice: {
              provider: "11labs",
              voiceId: "21m00Tcm4TlvDq8ikWAM"
            }
          });
          return assistant
    }
    async callAssistant(assistant:any,jobid:string,userId:string){  
        if(!jobid){
            throw new BadRequestException('Job ID is required');
        }
        const assistantResult=await this.assistantCall(jobid,userId)
        return {assistantId:assistantResult.id,assistant:assistantResult}
    }
    async callAssistantByApplicationId(applicationId: string, assistant: any,userId:string){
        const application = await this.databaseService.applications.findUnique({
            where: { id: applicationId },
            select: { jobId: true }
        });
        if(!application){
            throw new NotFoundException('Application not found');
        }
        return await this.callAssistant(assistant, application.jobId,userId);
    }
    async getAssistants(){
        const assistants=await this.vapi.assistants.list()
        const assistantsList = Array.isArray(assistants) 
        ? assistants 
        : ((assistants as any).data || (assistants as any).assistants || []);
      return assistantsList;
    }
    async getClientKey(userId:string){
        await this.usersService.userExistsById(userId);
        return { key: this.config.get<string>('VAPIPUBLIC_KEY') };
    }
    async saveConversationHistory(applicationId: string, conversationHistory: string, userId: string){
        const application = await this.databaseService.applications.findUnique({
            where: { id: applicationId },
            select: { userId: true }
        });
        if(!application){
            throw new NotFoundException('Application not found');
        }
        if(application.userId !== userId){
            throw new UnauthorizedException('Not authorized to update this application');
        }
        return await this.databaseService.applications.update({
            where: { id: applicationId },
            data: { conversationHistory }
        });
    }
}
