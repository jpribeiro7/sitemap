import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "./app.service";
import Sitemapper from 'sitemapper';
const robotsParser = require('robots-txt-parser');

describe('AppService', () => {
    let appService: AppService;
    
    let mailchimApiResponseNoMembers = {data: {members:[], list_id: "1a2d7ebf82"}}
    


    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            providers: [AppService],
        }).compile();
        appService = app.get<AppService>(AppService)
    });
    

        describe('getSitemap', () => {
            describe('when getSitemap is called',  () => {

                test('should run', async () => {
                    let host = "https://pcdiga.com/";
                    let response;
                    response = await appService.getSitemap(host)
                    expect(response.status).toBe(200)
                });
            
                test('should return error for bad url', async () => {
                    let host = "http://";
                    let response;
                    response = await appService.getSitemap(host)
                    expect(response).toEqual({ status: 400 , message: 'Bad Request: url parameter has no valid domain'})
                });

                test('should return host not found', async () => {
                    let host = "https://pcdiga";
                    let response;
                    let robot = robotsParser()
                    jest.spyOn(robot, 'useRobotsFor').mockResolvedValue({status:404, message:'Host not found'});
                    response = await appService.getSitemap(host)
                    expect(response).toEqual({status:404, message:'Host not found'})
                });

                test('should return error on failing to run promises', async () => {
                    let host = "https://pcdiga.com";
                    let response;
                    jest.spyOn(Promise, 'all').mockRejectedValue({status:400, message: 'Error running promise requests'});
                    response = await appService.getSitemap(host)
                    expect(response).toEqual({status:400, message: 'Error running promise requests'})
                });

                
            
            }); 
            
        });

})