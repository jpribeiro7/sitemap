import { Injectable } from '@nestjs/common';
import { rejects } from 'assert';
import { resolve } from 'path/posix';
import Sitemapper from 'sitemapper';
const robotsParser = require('robots-txt-parser');

@Injectable()
export class AppService {
  //common sitemap file names
  private readonly sitemapNames = ['sitemap.xml', 'sitemap_index.xml','sitemap/sitemap.xml','sitemapindex.xml','sitemap/index.xml','sitemap1.xml']

  //This method searches for all the first level links available in different sitemaps
  //Every website can have a specific file where the sitemap is defined (ex: 'https:my_website.com/sitemap.xml')
  //And it can also be defined in robots.txt file. Inside this file, there can also be some sitemap files defined
  //It is also possible that the website has both (ex: https://www.bbc.com/sitemap.xml && https://www.bbc.com/robots.txt)
  async getSitemap(url: string): Promise<Record<string, any>> {

    //extract domain and validate it 
    let final_url;
    try{
      final_url = new URL(url)
    }catch(error){
      return {status:400, message: 'Bad Request: url parameter has no valid domain'}
    }
    //init robot.txt parser
    const robots = robotsParser();

    //search for sitemaps in robot.txt file
    const from_robots = await robots.useRobotsFor(`${url}/robots.txt`)
      .then(async (robots_txt) => {
        //gathers all urls defined in different sitemaps
        let all_urls = new Set();

        //if there are any sitemaps in robots.txt
        robots_txt.sitemaps.forEach((entry)=>{
          //if the sitemap points to another sitemap
          if (entry.includes('.xml')){
            this.sitemapNames.push(entry)
          }else{
            //else we add it directly as a site
            all_urls.add(entry)
          }
          
        })
        
        //array of promises
        let p =[]

        //one website can have multiple sitemaps
        //for every sitemap available
        for(const entry of this.sitemapNames){
          
          //inits promise where the sites are filtered and added to all_urls
          p.push(new Promise((resolve, reject) => {
            //inits sitemapper for each sitemap file
            const sitemapper = new Sitemapper({
              url: entry.includes('http')? entry: `https://${final_url.hostname}/${entry}`,
            });
            
            resolve( sitemapper.fetch()
                   .then((sites)=>
                   
                            sites.sites.forEach((site)=> {
                              //for each site in the sitemap, we filter by domain
                              if (site.includes(final_url.hostname) ){
                                let pathname = new URL(site).pathname;
                                pathname = pathname.slice(0, -1) //some urls end up in '/', so we shouldn't consider that char in the following split
                                //then we filter by link level
                                if (pathname.split('/').length<=2){
                                  all_urls.add(site)
                                }
                              }
                            }) 
                         
                   ).catch((error)=>{ return {status:404, message: 'Could not fetch sites from sitemap file'}})
                   )
            
          }))
        }
        // we solve all promises
        let result = await Promise.all(p).then(()=>{
          return {status:200, message: Array.from(all_urls)}
        }).catch((error)=>{return {status:400, message: 'Error running promise requests'}});
        return {status: result.status, message: result.message}
      }).catch((error)=>{
        return {status:404, message:'Host not found'}
      });
    
      return {status:from_robots.status, message: from_robots.message}
     
  }
}
