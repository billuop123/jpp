import { Injectable } from '@nestjs/common';
import { pipeline } from '@xenova/transformers';
@Injectable()
export class EmbedService {
    private embedder:any
    private initialized=false;
    private async init(){
        if(!this.initialized){
            this.embedder=await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
        this.initialized=true
    }
    async embed(text:string){
        await this.init()
        const output = await this.embedder(text);
        // Extract the data array from the tensor output
        const embeddingArray = Array.from(output.data) as number[];
        
        // The model outputs token-level embeddings: [num_tokens, 384]
        // We need to pool them into a single 384-dimensional vector
        if (embeddingArray.length > 384) {
            // Calculate number of tokens
            const numTokens = embeddingArray.length / 384;
            
            // Mean pooling: average across all tokens for each dimension
            const pooled = new Array(384).fill(0);
            for (let dim = 0; dim < 384; dim++) {
                let sum = 0;
                // For each token, get the value at this dimension
                for (let token = 0; token < numTokens; token++) {
                    sum += embeddingArray[token * 384 + dim];
                }
                pooled[dim] = sum / numTokens;
            }
            return pooled;
        }
        
        // If we have exactly 384, return as is (already pooled)
        return embeddingArray;
    }
}
