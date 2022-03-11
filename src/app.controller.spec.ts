import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService)
  });

  describe('getSitemap', () => {
    describe('when getSitemap is called',  () => {
      
      let params = {url:""}
      let response;

      test('should return invalid url parameter', async() => {
        let res = {
          send : jest.fn().mockReturnValue({status:400, message: `Bad Request: no url parameter found`}),
          status: jest.fn().mockReturnThis()
        };
        response = await appController.getSitemap(res, params)
        expect(response).toEqual({status:400, message: `Bad Request: no url parameter found`})
      });
      
      test('should return valid message', async () => {
        let res = {
          send : jest.fn().mockReturnValue({status:200, message: "Correct"}),
          status: jest.fn().mockReturnThis()
        };
        params.url="http://pcdiga.com"
        jest.spyOn(appService, 'getSitemap').mockResolvedValue({status:200, message: "Correct"});
        response = await appController.getSitemap(res, params)
        expect(response).toEqual({status:200, message: "Correct"})
        expect(appService.getSitemap).toHaveBeenCalled();
      });
    })
    
  });
});
