import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @MessagePattern('search')
  @HttpCode(200)
  async search(@Body() searchDto: SearchDto) {
    return await this.searchService.search(searchDto.query);
  }
  @MessagePattern('search-jobs')
  @HttpCode(200)
  async searchJobs(@Body() searchDto: SearchDto) {
    return await this.searchService.searchJobs(searchDto.query);
  }
}
