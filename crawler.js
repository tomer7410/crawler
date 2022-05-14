

const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const scanner=async (currentDepth,maxDepth,results,currentUrl,urlReg)=>{
   
 imgUrlsList=await scrapper('img',currentUrl)
 imgUrlsList.forEach((imageUrl)=>{
     results.push({imageUrl:imageUrl,sourceUrl:currentUrl,depth:currentDepth})
 })
 if(currentDepth==maxDepth)
    return;
 linksUrl=await scrapper("a",currentUrl,urlReg)
 linksUrl.concat(await scrapper("link",currentUrl,urlReg))
 linksUrl.forEach(async (linkUrl)=>{
     await scanner(currentDepth+1,maxDepth,results,linkUrl)
 })
}
const isValid=(regObj,str)=>{
    if (regObj.test(str)) {
       return true
    } else {
        return false
    }
}
const scrapper=async (tagName,url,urlReg=null)=>{// get tag name and return list of urls: img/aRef
    let urlsList=[]
    try {
        let res=await got(url)
        let dom=cheerio.load(res.body);
        let list=dom(tagName)
        console.log(list[0]);
        list.each((element)=>{
            isLink=tagName=="a"||tagName=="link"
            let url=isLink?list[element].attribs.href:list[element].attribs.src
            if(isLink){
                if(isValid(urlReg,url))
                    urlsList.push(url)
            }
            else{
                urlsList.push(url)
            }
            
            
        })
    } catch (error) {
        console.log("error with scrapping: "+url);
    }
   finally{
    return urlsList
   }
  
   
}
const crewler=(url,maxDepth)=>{
    var urlReg =  new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i');
    let results=[]
    scanner(1,maxDepth,results,url,urlReg).
    then((res)=>{
        fs.writeFile('./images.json', JSON.stringify(results), function(err) {
            if (err)
                throw err;
            console.log('Done!')
        });
    })
    .catch((er)=>console.log(er))
}

const myArgs = process.argv.slice(2);
const url=myArgs[0].slice(4)
const depth=myArgs[1].slice(6)
crewler(url,depth)



