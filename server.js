import express from 'express'
import Scraper from './src/Utils/Scraper.js'

const port = process.env.PORT || 80
const app = express()

app.get('/', async (req, res) => {

  if (!req.query.repository) return res.json({
    tutorial: 'use a get query named \'repository\' to pass the public github repository url(or folder)',
    complete_example: 'http://url.domain/?repository=matheusdf32/spotify-finder',
    examples: [
      '?repository=matheusdf32/spotify-finder',
      '?repository=Rocketseat/react-native-template-rocketseat-basic/tree/master/src'
    ],
    notes: {
      code: "The code was made as simple as possible trying to follow the SOLID principles.",
      parameters: "get query was chosen to be a parameter instead of post for simple use in any browser. Easy testing is happy testing.",
      429: "Because of the nature behind web scraping, github might throw a 429 'too many requests' error. The repository 'microsoft/terminal' was fun to test with, sometimes it works and sometimes it doesn't. The best time scraping this repository was 66.717 seconds.",
      recursive: "The simple approach also means i did not use any sort of pause-timers to avoid the 429 error and used a recursive approach to simplify the code but also making it work in any repository",
      flaws: "There probably are some flaws in this code but there are none that I know that are my fault. Maybe the repository you use to benchmark it will show one of them. Trying to fix every error that you don't even know exists is a heavy task by itself, but that's part of the challenge!",
      cheerio: "I Sent an email, asking about if CheerioJS(basically jQuery for backend nodejs) was considered a web scraping library because I had the intent of using it. I didn't consider it a web scraping library at first but since it's name was always mentioned in web scraping tutorials and documents, I chose to NOT use it.",
      axios_and_nodejs: "I used axios and NodeJS just because I was familiar with them.",
      ES6: "ECMAscript 2015 in NodeJS(v12 LTS) is still an Experimental module, that said, I enabled it.",
      dotNAME: "Some files don't have extensions. They shouldn't show in the response. examples: '.gitignore' and '.editorconfig'",
      thanks: "In or out, I did not had so much fun building an API in months! Thank you for reviewing my resume and giving me this challenge."
    }
  })

  const scraper = new Scraper(req.query.repository)
  let result = await scraper.scrape()

  res.json({
    status: 'Scraping ' + req.query.repository,
    date: new Date(),
    result
  })
})

app.listen(port, () => {
  console.log(`Server up! http://localhost:${port}`) // Rocketseat/react-native-template-rocketseat-basic
})