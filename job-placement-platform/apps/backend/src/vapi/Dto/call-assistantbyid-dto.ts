import { PickType } from '@nestjs/mapped-types';
import { CallAssistantDto } from './call-assistant-dto';

export class AssistantJobDto extends PickType(
    CallAssistantDto,
  ['assistant', 'mode'] as const,
) {}