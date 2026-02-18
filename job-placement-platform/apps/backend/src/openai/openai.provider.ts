import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
export const OpenaiProvider = {
  provide: 'OPENAI',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new OpenAI({
      apiKey: configService.get<string>('OPENAI_API_KEY'),
    });
  },
};
