import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from './config/config.module';
import { UserDetailsModule } from './user-details/user-details.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RolesModule } from './roles/roles.module';
import { CompanyModule } from './company/company.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { OpenaiModule } from './openai/openai.module';
import { IsCandidate } from './roles/roles.middleware';
import { StripeModule } from './stripe/stripe.module';
import { ResumeTailoringModule } from './resume-tailoring/resume-tailoring.module';
import { VapiModule } from './vapi/vapi.module';
import { GeminiModule } from './gemini/gemini.module';
import { AdminModule } from './admin/admin.module';
import { MockInterviewsModule } from './mock-interviews/mock-interviews.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    LoggerModule,
    UserDetailsModule,
    CloudinaryModule,
    RolesModule,
    CompanyModule,
    JobsModule,
    ApplicationsModule,
    OpenaiModule,
    StripeModule,
    ResumeTailoringModule,
    VapiModule,
    AppModule,
    GeminiModule,
    AdminModule,
    MockInterviewsModule,
    EmailModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule implements NestModule {
  constructor() {}
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(AuthMiddleware)
    //   .forRoutes(
    //     { path: 'user-details', method: RequestMethod.ALL },
    //     { path: 'upload-pdf', method: RequestMethod.ALL },
    //     { path: 'upload-pdf/update', method: RequestMethod.ALL },
    //     { path: 'company', method: RequestMethod.ALL },
    //     { path: 'company/types', method: RequestMethod.ALL },
    //     { path: 'applications', method: RequestMethod.ALL },
    //     { path: 'user-details/parse-pdf', method: RequestMethod.ALL },
    //     { path: 'jobs/application-exists', method: RequestMethod.ALL },
    //     { path: 'jobs/types', method: RequestMethod.ALL },
    //     { path: 'company/my-companies', method: RequestMethod.ALL },
    //     { path: 'company/company-jobs/:companyId', method: RequestMethod.ALL },
    //     { path: 'company/:companyId', method: RequestMethod.ALL },
    //     { path: 'stripe/check-session', method: RequestMethod.ALL },
    //     { path: 'users/is-premium', method: RequestMethod.ALL },
    //     { path: 'resume-tailoring/:jobId', method: RequestMethod.GET },
    //     { path: 'vapi/get-assistants', method: RequestMethod.GET },
    //     { path: 'vapi/call-assistant', method: RequestMethod.POST },
    //     { path: 'vapi/client-key', method: RequestMethod.GET },
    //     { path: 'vapi/call-assistant/:applicationId', method: RequestMethod.POST },
    //     { path: 'vapi/save-conversation/:applicationId', method: RequestMethod.POST },
    //     { path: 'applications/:applicationId/analyze', method: RequestMethod.PATCH },
    //     { path: 'applications/:applicationId', method: RequestMethod.GET },
    //     { path: 'applications/user-details/:userId', method: RequestMethod.GET },
    //     { path: 'applications/my-status/:jobId', method: RequestMethod.GET },
    //     { path: 'jobs/:companyId', method: RequestMethod.POST },
    //     { path: 'jobs/pending-requests/:jobId', method: RequestMethod.GET },
    //     { path: 'jobs/update-request-status/:applicationId', method: RequestMethod.PATCH },
    //     { path: 'jobs/types', method: RequestMethod.ALL },
    //     { path: 'gemini/resume-text-extraction', method: RequestMethod.POST },
    //     { path: 'company/upload-incorporation-pdf/:companyId', method: RequestMethod.PUT },
    //     { path: 'company/is-recruiter/:companyId', method: RequestMethod.GET },
    //     { path: 'mock-interviews', method: RequestMethod.ALL },
    //     { path: 'mock-interviews/:mockInterviewId', method: RequestMethod.ALL },
    //     { path: 'mock-interviews/:mockInterviewId/conversation', method: RequestMethod.POST },
    //     { path: 'mock-interviews/:mockInterviewId/analyze', method: RequestMethod.PATCH },

    //   );
      
  consumer
      .apply(IsCandidate)
      .forRoutes(
        // { path: 'applications', method: RequestMethod.ALL },
        {path:'applications/',method:RequestMethod.POST},
        { path: 'resume-tailoring/:jobId', method: RequestMethod.GET },
      );    
  }

}
