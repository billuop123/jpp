import { Injectable } from '@nestjs/common';
import { EmbedService } from 'src/embed/embed.service';
import { QdrantService } from 'src/qdrant/qdrant.service';

@Injectable()
export class InsertService {
    constructor(private readonly qdrantService: QdrantService, private readonly embedService: EmbedService) {}
    async insert(payload:any){
        let jobData = payload.data || payload;
        if (typeof jobData === 'string') {
            try {
                jobData = JSON.parse(jobData);
            } catch (e) {
                jobData = payload;
            }
        }
        const textToEmbed = [
            jobData.title || '',
            jobData.description || '',
            jobData.requirements || '',
            jobData.responsibilities || '',
        ].filter(Boolean).join(' ');
        
        if (!textToEmbed.trim()) {
            throw new Error('No text content found to embed');
        }
        const id = jobData.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const vector = await this.embedService.embed(textToEmbed);
        await this.qdrantService.upsertPoint(id, vector, jobData);
        
        return { id, success: true };
    }
}
