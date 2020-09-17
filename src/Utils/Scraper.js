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
        return Number(num)
    }
  }

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
      return { ...this.getFileInfo(html), ext: fileExtension } 
    }
  }

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
  }

  async buildScrapeList(repository) { // repository = href singular
    const html = await this.getHtml(repository)
    const hrefs = await this.getHREFS(html)
    // return {hrefs, repository}
    if (hrefs) {
      for (const href of hrefs) {
        this.scrapeList.push(await this.buildScrapeList(href))
      }
    } else {
      console.log(repository)
      const regex = new RegExp('.*/', 'g')
      let fileName = repository.replace(regex, '').split('.')
      const fileExtension = fileName[fileName.length - 1]
      this.scrapeList.push({ [fileExtension]: { ...this.getFileInfo(html) } })  // {ext: 'py', size: 15441, lines: 154}
    }
    return [...this.scrapeList]
  }

  async buildScrapeExtensions(repository) { // repository = href singular
    const html = await this.getHtml(repository)
    const hrefs = await this.getHREFS(html)
    // return {hrefs, repository}
    if (hrefs) {
      for (const href of hrefs) {
        await this.buildScrapeExtensions(href)
      }
    } else {
      // console.log(repository)
      const regex = new RegExp('.*/', 'g')
      let fileName = repository.replace(regex, '').split('.')
      const fileExtension = fileName[fileName.length - 1]
      if (!this.extensions[fileExtension])
        this.extensions[fileExtension] = { ...this.getFileInfo(html) }
      else {
        const temp = { ...this.getFileInfo(html) }
        this.extensions[fileExtension].size = temp.size
        this.extensions[fileExtension].lines = temp.lines
      }
      // this.scrapeList.push({ [fileExtension]: { ...this.getFileInfo(html) } })  // {ext: 'py', size: 15441, lines: 154}
    }
    return {...this.extensions}
  }

  async scrape() {
    console.log("teste iniciado");
    // const teste = await this.buildScrapeList(this.repository)
    return await this.buildScrapeExtensions(this.repository)
    // return teste
    // return this.scrapeList
  }

  getFileInfo(html) {
    // let html = await this.getHtml()
    // 92 : /(?<=<div class="text-mono f6 flex-auto pr-3 flex-order-2 flex-md-order-1 mt-2 mt-md-0">\s*)(\S.*?)(?= lines)/
    const regex = new RegExp(/(?<=<div class="Box-header py-2 d-flex flex-column flex-shrink-0 flex-md-row flex-md-items-center">\s*)\S.*?(?<=div>)/, 'gs')
    const div = html.match(regex)[0]
    const linesMatch = div.match(/(?<=<div class="text-mono f6 flex-auto pr-3 flex-order-2 flex-md-order-1 mt-2 mt-md-0">\s*)(\S.*?)(?= lines)/gs)
    const lines = Number(linesMatch ? linesMatch[0] : 0);
    const sizeMatch = div.match(/(?<=.*<span class="file-info-divider"><\/span>\s*)\S.*?(?<=(.B).*)/gs)
    const size = sizeMatch ? this.getSizeInBytes(sizeMatch[0]) : 0;
    return { size, lines }
  }

}