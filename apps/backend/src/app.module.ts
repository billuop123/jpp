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
import { QdrantModule } from './qdrant/qdrant.module';
import { ApplicationsModule } from './applications/applications.module';
import { OpenaiModule } from './openai/openai.module';
import { IsCandidate } from './roles/roles.middleware';
import { StripeModule } from './stripe/stripe.module';
import { ResumeTailoringModule } from './resume-tailoring/resume-tailoring.module';
import { VapiModule } from './vapi/vapi.module';

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
    QdrantModule,
    ApplicationsModule,
    OpenaiModule,
    StripeModule,
    ResumeTailoringModule,
    VapiModule,

  ],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule implements NestModule {
  constructor(private readonly authMiddleware: AuthMiddleware) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'user-details', method: RequestMethod.ALL },
        { path: 'upload-pdf', method: RequestMethod.ALL },
        { path: 'company', method: RequestMethod.ALL },
        { path: 'applications', method: RequestMethod.ALL },
        { path: 'user-details/parse-pdf', method: RequestMethod.ALL },
        { path: 'jobs/application-exists', method: RequestMethod.ALL },
        { path: 'company/my-companies', method: RequestMethod.ALL },
        { path: 'company/company-jobs/:companyId', method: RequestMethod.ALL },
        { path: 'stripe/check-session', method: RequestMethod.ALL },
        { path: 'users/is-premium', method: RequestMethod.ALL },
        { path: 'resume-tailoring/:jobId', method: RequestMethod.GET },
        { path: 'vapi/get-assistants', method: RequestMethod.GET },
        { path: 'vapi/call-assistant', method: RequestMethod.POST },
        { path: 'vapi/client-key', method: RequestMethod.GET },
        { path: 'vapi/call-assistant/:applicationId', method: RequestMethod.POST },
        { path: 'vapi/save-conversation/:applicationId', method: RequestMethod.POST },
        { path: 'applications/:applicationId/analyze', method: RequestMethod.PATCH },
        { path: 'applications/:applicationId', method: RequestMethod.GET },
      );
      
  consumer
      .apply(IsCandidate)
      .forRoutes(
        // { path: 'applications', method: RequestMethod.ALL },
        { path: 'resume-tailoring/:jobId', method: RequestMethod.GET },
      );
  }

}
