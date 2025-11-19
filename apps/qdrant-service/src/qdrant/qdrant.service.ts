import { Injectable } from '@nestjs/common';
import {QdrantClient} from '@qdrant/js-client-rest';
@Injectable()
export class QdrantService {
    private client:QdrantClient
    constructor(){
        this.client=new QdrantClient({
            url: 'http://localhost:6333',
        })
    }
    async search(vector:number[],limit=50){
        return await this.client.search(
            'job_recommender', {vector, limit}
        )
    }
}
