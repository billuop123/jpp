import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';
import { JobsService } from 'src/jobs/jobs.service';
import { UserDetailsService } from 'src/user-details/user-details.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class MockInterviewsService {
  private readonly logger = new Logger(MockInterviewsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly usersService: UsersService,
    private readonly jobsService: JobsService,
    private readonly userDetailsService: UserDetailsService,
    @Inject('GEMINI') private readonly gemini: GoogleGenerativeAI,
  ) {}

  private async ensureMockInterviewPremium(userId: string) {
    const user = await this.databaseService.users.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        isMockInterviewsPremium: true,
        role: { select: { code: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only candidates are allowed to run mock interviews
    if (user.role?.code !== 'CANDIDATE') {
      throw new ForbiddenException('Only candidates can access mock interviews');
    }

    if (!user.isPremium && !user.isMockInterviewsPremium) {
      throw new ForbiddenException(
        'Mock interviews are available only to users with mock interviews premium',
      );
    }
  }

  async startMockInterview(jobId: string, userId: string) {
    await this.usersService.userExistsById(userId);
    await this.ensureMockInterviewPremium(userId);

    const job = await this.jobsService.findOneJob(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const mockInterview = await this.databaseService.mockInterview.create({
      data: {
        userId,
        jobId,
      },
    });

    return mockInterview;
  }

  async saveConversation(mockInterviewId: string, userId: string, conversationHistory: string) {
    const mockInterview = await this.databaseService.mockInterview.findUnique({
      where: { id: mockInterviewId },
      select: { userId: true },
    });

    if (!mockInterview) {
      throw new NotFoundException('Mock interview not found');
    }

    if (mockInterview.userId !== userId) {
      throw new UnauthorizedException('Not authorized to update this mock interview');
    }

    return await this.databaseService.mockInterview.update({
      where: { id: mockInterviewId },
      data: { conversationHistory },
    });
  }

  async analyzeMockInterview(mockInterviewId: string, userId: string) {
    const mockInterview = await this.databaseService.mockInterview.findUnique({
      where: { id: mockInterviewId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        user: true,
      },
    });

    if (!mockInterview) {
      throw new NotFoundException('Mock interview not found');
    }

    if (mockInterview.userId !== userId) {
      throw new UnauthorizedException('Not authorized to analyze this mock interview');
    }

    if (mockInterview.relevanceScore != null) {
      throw new BadRequestException('Mock interview already analyzed');
    }

    if (!mockInterview.conversationHistory) {
      throw new BadRequestException('No conversation history found for this mock interview');
    }

    // Check if conversation is substantial enough
    const conversationLines = mockInterview.conversationHistory.split('\n').filter(line => line.trim());
    const candidateResponses = conversationLines.filter(line => line.toLowerCase().includes('candidate:')).length;
    
    if (candidateResponses < 3) {
      throw new BadRequestException('Insufficient conversation data for analysis. Please conduct a longer interview.');
    }

    const resumeText = await this.userDetailsService.getResumeText(userId);
    if (!resumeText) {
      throw new BadRequestException('Resume text not found');
    }

    const job = mockInterview.job;

    const prompt = `You are an expert recruiter analyzing a MOCK interview transcript and resume text.

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

Mock Interview Transcript:
${mockInterview.conversationHistory}

Your tasks:
1. Analyze the candidate's performance strictly based on depth and quality of responses.
2. Penalize brief or superficial answers.
3. For each distinct question-answer pair, provide brief, specific feedback for the candidate.

Return your response as JSON in this exact format:
{
  "relevancecomment": "<detailed overall analysis comment>",
  "technicalScore": <int between 0-2>,
  "communicationScore": <int between 0-2>,
  "problemSolvingScore": <int between 0-2>,
  "jobRelevanceScore": <int between 0-2>,
  "depthOfKnowledgeScore": <int between 0-2>,
  "strengths": "<description of strengths>",
  "weaknesses": "<description of weaknesses>",
  "answerFeedback": [
    {
      "question": "<interviewer question text>",
      "answer": "<candidate answer text>",
      "feedback": "<short, actionable feedback for the candidate>",
      "technicalScore": <int between 0-2 or null>,
      "communicationScore": <int between 0-2 or null>,
      "problemSolvingScore": <int between 0-2 or null>,
      "jobRelevanceScore": <int between 0-2 or null>,
      "depthOfKnowledgeScore": <int between 0-2 or null>
    }
  ]
}

Candidate Resume Information:
${resumeText || 'No resume provided'}
`;

    try {
      const model = this.gemini.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction:
          'You are an expert recruiter. Analyze mock interviews and provide scores and feedback strictly in JSON using the specified schema.',
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const analysis = JSON.parse(text || '{}');

      const relevancecomment =
        analysis.relevancecomment || 'No analysis available';
      const technicalScore = Math.max(
        0,
        Math.min(2, parseInt(analysis.technicalScore) || 0),
      );
      const communicationScore = Math.max(
        0,
        Math.min(2, parseInt(analysis.communicationScore) || 0),
      );
      const problemSolvingScore = Math.max(
        0,
        Math.min(2, parseInt(analysis.problemSolvingScore) || 0),
      );
      const jobRelevanceScore = Math.max(
        0,
        Math.min(2, parseInt(analysis.jobRelevanceScore) || 0),
      );
      const depthOfKnowledgeScore = Math.max(
        0,
        Math.min(2, parseInt(analysis.depthOfKnowledgeScore) || 0),
      );
      const strengths = analysis.strengths || 'No strengths available';
      const weaknesses = analysis.weaknesses || 'No weaknesses available';
      const answerFeedback = analysis.answerFeedback || [];

      const updated = await this.databaseService.mockInterview.update({
        where: { id: mockInterviewId },
        data: {
          relevanceScore:
            technicalScore +
            communicationScore +
            problemSolvingScore +
            jobRelevanceScore +
            depthOfKnowledgeScore,
          relevancecomment,
          technicalScore,
          communicationScore,
          problemSolvingScore,
          jobRelevanceScore,
          depthOfKnowledgeScore,
          strengths,
          weaknesses,
          answerFeedback,
        },
      });

      return updated;
    } catch (error) {
      this.logger.error('Error analyzing mock interview:', error);
      throw new BadRequestException('Failed to analyze mock interview');
    }
  }

  async getMockInterview(mockInterviewId: string, userId: string) {
    const mockInterview = await this.databaseService.mockInterview.findUnique({
      where: { id: mockInterviewId },
      include: {
        job: {
          include: {
            company: true,
            jobtype: true,
          },
        },
      },
    });

    if (!mockInterview) {
      throw new NotFoundException('Mock interview not found');
    }

    if (mockInterview.userId !== userId) {
      throw new UnauthorizedException('Not authorized to view this mock interview');
    }

    return mockInterview;
  }

  async listMyMockInterviews(userId: string) {
    await this.usersService.userExistsById(userId);

    const interviews = await this.databaseService.mockInterview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        relevanceScore: true,
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

    return interviews;
  }
}

