import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
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

@Module({
  imports: [ConfigModule, DatabaseModule, UsersModule, LoggerModule, UserDetailsModule, CloudinaryModule, RolesModule, CompanyModule, JobsModule],
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
        {path: 'company', method: RequestMethod.ALL},
      );
  }
}

