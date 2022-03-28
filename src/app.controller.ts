import { Controller, Get, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller("/sitemap")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getSitemap(@Res() res, @Query() params): Promise<string> {
    if (!params.url || params.url===''){
      return res.status(400).send(`Bad Request: no url parameter found`)
    }
    const response  = await this.appService.getSitemap(params.url);
    return res.status(response.status).send(response.message)
  }
}
