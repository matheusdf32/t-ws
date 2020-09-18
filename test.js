import chai from 'chai'
import Scraper from './src/Utils/Scraper.js'

describe('testing matheusdf32/spotify-finder', () => {

  const scraper = new Scraper('matheusdf32/spotify-finder')

  let html = ''
  it('Get the html file from the given repository', async () => {
    const res = await scraper.getHtml('matheusdf32/spotify-finder')
    if(res.error && res.error !== 429) throw Error(res.error+': unknown to this test')
    if(res.error) throw Error(res.error+': '+res.message)
    html = res
  })

  const expectedhrefs = [
    'matheusdf32/spotify-finder/tree/master/images',
    'matheusdf32/spotify-finder/blob/master/README.md',
    'matheusdf32/spotify-finder/blob/master/background.js',
    'matheusdf32/spotify-finder/blob/master/contentscript.js',
    'matheusdf32/spotify-finder/blob/master/manifest.json',
    'matheusdf32/spotify-finder/blob/master/options.html',
    'matheusdf32/spotify-finder/blob/master/options.js',
    'matheusdf32/spotify-finder/blob/master/popup.html',
    'matheusdf32/spotify-finder/blob/master/popup.js'
  ]
  it('Get the list of tokens(folders or files) from the repository', async () => {
    const hrefs = await scraper.getHREFS(html)
    chai.expect(hrefs).to.eql(expectedhrefs)
  })

  const expectedResult = {
    png: { size: 215429.12, lines: 0 },
    jpg: { size: 16179.2, lines: 0 },
    md: { size: 2416.64, lines: 57 },
    js: { size: 6900.52, lines: 191 },
    json: { size: 886, lines: 41 },
    html: { size: 339, lines: 20 }
  }
  it('Finally, use the scrape() function to automatically scrape the repository', async () => {
    const result = await scraper.scrape()
    chai.expect(expectedResult).to.eql(result)
  }).timeout(90000);
  
})