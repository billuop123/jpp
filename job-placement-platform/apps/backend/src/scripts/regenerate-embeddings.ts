import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseService } from '../database/database.service';
import { EmbedService } from '../embed/embed.service';

async function regenerateEmbeddings() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const databaseService = app.get(DatabaseService);
  const embedService = app.get(EmbedService);

  const jobs = await databaseService.jobs.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      requirements: true,
      responsibilities: true,
    },
  });

  console.log(`Found ${jobs.length} jobs to process`);

  for (const job of jobs) {
    const textToEmbed = [
      job.title,
      job.title,
      job.title,
      job.description || '',
      job.requirements || '',
      job.responsibilities || '',
    ].join(' ').trim();

    if (textToEmbed) {
      try {
        const embedding = await embedService.embed(textToEmbed);
        await databaseService.jobs.update({
          where: { id: job.id },
          data: { embedding } as any,
        });
        console.log(`✓ Updated embedding for: ${job.title}`);
      } catch (e) {
        console.error(`✗ Failed to embed job ${job.id}:`, e);
      }
    }
  }

  console.log('Done!');
  await app.close();
}

regenerateEmbeddings();
