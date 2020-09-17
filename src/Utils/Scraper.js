import axios from 'axios';

export default class Scraper {

  constructor(repository) {
    this.repository = repository;
    this.extensions = {};
    this.scrapeList = [];
    this.teste = 0;
  }

  async testee() {
    this.teste += 1;
    return this.teste
  }

  async getHtml(repository) {
    return await axios.get(`https://github.com/${repository}`).then(r => r.data.toString()).catch(console.log)
  }

  async getHREFS(html) {
    // let html = await this.getHtml()
    const regex = new RegExp('(?<=<a class="js-navigation-open link-gray-dark" title=".*" id=".*" href="/)(.*?)(?=">)', 'g')
    this.hrefs = html.match(regex)
    return this.hrefs
  }

  async getTokens(hrefs) { // calling a token because i don't know yet if it is a folder or file
    const regex = new RegExp('.*/', 'g')
    // const hrefs = await this.getHREFS()
    const tokens = hrefs.map(href => {
      return href.replace(regex, "");
    })
    return tokens
  }

  getSizeInBytes(str = "") {
    const num = str.split(" ")[0]
    switch (str.split(" ")[1]) {
      case 'PB':
        num *= 1024
      case 'TB':
        num *= 1024
      case 'GB':
        num *= 1024
      case 'MB':
        num *= 1024
      case 'KB':
        return num * 1024
      default:
        return num
    }
  }

  // async scrapeRecursive(hrefs) {
  //   let result = {}

  //   const regex = new RegExp('.*/', 'g')

  //   if (Array.isArray(hrefs)) {

  //     for (const href of hrefs) {
  //       const temp = await this.scrapeRecursive(href)
  //       Object.keys(result).forEach(function (a) {
  //         result[a].size = result[a].size + temp[a].size
  //         result[a].lines = result[a].lines + temp[a].lines
  //       })
  //     }

  //   } else {
  //     let fileName = hrefs.replace(regex, '').split('.')
  //     const fileExtension = fileName[fileName.length - 1]
  //     const fileInfo = await this.scrapeToken(hrefs)
  //     if (!result[fileExtension]) result[fileExtension] = fileInfo
  //     else {
  //       result[fileExtension].size += fileInfo.size
  //       result[fileExtension].lines += fileInfo.lines
  //     }
  //   }
  //   console.log(result);
  //   return result
  // }

  async scrapeToken(repository) { // repository = href singular
    const html = await this.getHtml(repository)
    const hrefs = await this.getHREFS(html)
    // return {hrefs, repository}
    if (hrefs) {
      return hrefs
    } else {
      const regex = new RegExp('.*/', 'g')
      let fileName = repository.replace(regex, '').split('.')
      const fileExtension = fileName[fileName.length - 1]
      return { ...this.getFileInfo(html), ext: fileExtension } // {ext: 'py', size: 15441, lines: 154}
    }
  }

  // { py: { size: 15441, lines: 154 } }
  // { ext: py, size: 15441, lines: 154 }

  async scrapeRecursive(hrefs) {
    const regex = new RegExp('.*/', 'g')
   
      for (const href of hrefs) {
        const fileInfo = await this.scrapeToken(hrefs)
        if (Array.isArray(fileInfo)) {
          this.scrapeRecursive(href)
        } else {
          this.scrapeList.push({ fileName: fileInfo })
        }
      }
      // let fileName = hrefs.replace(regex, '').split('.')
      // const fileExtension = fileName[fileName.length - 1]
      // const fileInfo = await this.scrapeToken(hrefs)
      // this.scrapeList.push({ fileName: fileInfo })
      // if (!this.extensions[fileExtension]) this.extensions[fileExtension] = fileInfo
      // else {
      //   this.extensions[fileExtension].size += fileInfo.size
      //   this.extensions[fileExtension].lines += fileInfo.lines
      // }
  }

  // async scrapeRecursive(hrefs) {
  //   const regex = new RegExp('.*/', 'g')
  //   if (Array.isArray(hrefs)) {
  //     for (const href of hrefs) {
  //       const fileInfo = await this.scrapeToken(hrefs)
  //       if(fileinfo == '.js'){
  //           this.scrapeList.push({ fileName: fileInfo })
  //       }else{
  //        this.scrapeRecursive(href)
  //       }
  //     }
  //   } else {
  //     let fileName = hrefs.replace(regex, '').split('.')
  //     const fileExtension = fileName[fileName.length - 1]

  //     // if (!this.extensions[fileExtension]) this.extensions[fileExtension] = fileInfo
  //     // else {
  //     //   this.extensions[fileExtension].size += fileInfo.size
  //     //   this.extensions[fileExtension].lines += fileInfo.lines
  //     // }
  //   }
  // }

  async buildScrapeList(repository) { // repository = href singular
    const html = await this.getHtml(repository)
    const hrefs = await this.getHREFS(html)
    // return {hrefs, repository}
    if (hrefs) {
      return hrefs
    } else {
      const regex = new RegExp('.*/', 'g')
      let fileName = repository.replace(regex, '').split('.')
      const fileExtension = fileName[fileName.length - 1]
      return { ...this.getFileInfo(html), ext: fileExtension } // {ext: 'py', size: 15441, lines: 154}
    }
  }

  async scrape() {
    // let scrapeResult = {} // { py: { lines: 12, bytes: 35 } }
    // const html = await this.getHtml(this.repository)
    // const hrefs = await this.getHREFS(html)
    // const tokens = await this.getTokens(hrefs)
    // console.log(hrefs);
    const teste = await this.scrapeRecursive(hrefs)
    return teste
    return this.scrapeList
    return this.extensions
  }

  getFileInfo(html) {
    // let html = await this.getHtml()
    // 92 : /(?<=<div class="text-mono f6 flex-auto pr-3 flex-order-2 flex-md-order-1 mt-2 mt-md-0">\s*)(\S.*?)(?= lines)/
    const regex = new RegExp(/(?<=<div class="Box-header py-2 d-flex flex-column flex-shrink-0 flex-md-row flex-md-items-center">\s*)\S.*?(?<=div>)/, 'gs')
    const div = html.match(regex)[0]
    const lines = Number(div.match(/(?<=<div class="text-mono f6 flex-auto pr-3 flex-order-2 flex-md-order-1 mt-2 mt-md-0">\s*)(\S.*?)(?= lines)/gs)[0]);
    const size = this.getSizeInBytes(div.match(/(?<=.*<span class="file-info-divider"><\/span>\s*)\S.*?(?<=(.B).*)/gs)[0]);
    return { size, lines }
  }

}