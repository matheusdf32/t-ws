import axios from 'axios';

export default class Scraper {

  constructor(repository) {
    this.repository = repository;
    this.extensions = {};
  }

  async getHtml(repository) {
    return await axios.get(`https://github.com/${repository}`)
      .then(r => r.data.toString())
      .catch(({ response }) => { return { error: response.status || response.statusCode || 'response?', message: 'Github says: Too many requests.' } })
  }

  async getHREFS(html) {
    const regex = new RegExp('(?<=<a class="js-navigation-open link-gray-dark"[^>]+ href="/)(.*?)(?=">)', 'g')
    this.hrefs = html.match(regex)
    return this.hrefs
  }

  getSizeInBytes(str = "") {
    let num = str.split(" ")[0]
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

  async scrapeRepository(repository) { // repository = href singular
    const html = await this.getHtml(repository)
    if (html.error === 429) return html // too many requests
    const hrefs = await this.getHREFS(html)
    if (hrefs) {
      for (const href of hrefs) {
        await this.scrapeRepository(href)
      }
    } else {
      const regex = new RegExp('.*/', 'g')
      let fileName = repository.replace(regex, '').split('.')
      const fileExtension = fileName[fileName.length - 1]
      if (!this.extensions[fileExtension])
        this.extensions[fileExtension] = { ...this.getFileInfo(html) }
      else {
        const temp = { ...this.getFileInfo(html) }
        this.extensions[fileExtension].size += temp.size
        this.extensions[fileExtension].lines += temp.lines
      }
    }
    return { ...this.extensions }
  }

  async scrape() {
    return await this.scrapeRepository(this.repository)
  }

  getFileInfo(html) {
    const regex = new RegExp(/(?<=<div class="Box-header py-2 d-flex flex-column flex-shrink-0 flex-md-row flex-md-items-center">\s*)\S.*?(?<=div>)/, 'gs')
    const div = html.match(regex)[0]
    const linesMatch = div.match(/(?<=<div class="text-mono f6 flex-auto pr-3 flex-order-2 flex-md-order-1 mt-2 mt-md-0">.*><\/span>\s*)(\d)*(?= lines)|(?<=<div class="text-mono f6 flex-auto pr-3 flex-order-2 flex-md-order-1 mt-2 mt-md-0">\s*)(\d.*)(?= lines)/gs)
    const lines = Number(linesMatch ? linesMatch[0] : 0);
    const sizeMatch = div.match(/(?<=.*>\s*)(\d|\.)*( .?B)/gs)
    const size = sizeMatch ? this.getSizeInBytes(sizeMatch[0]) : 0;
    return { size, lines }
  } // this function is in the end of the class simply because vscode glitches the colors after the regex and it annoys me

}