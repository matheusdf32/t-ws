import express from 'express'
import Scraper from './src/Utils/Scraper.js'
const port = 3000
const app = express()

app.get('/', async (req, res) => {

  if (!req.query.repository) return res.json({
    tutorial: 'use a get query named repository to pass the public github repository url',
    example: '?repository=matheusdf32/spotify-finder'
  })
  const scraper = new Scraper(req.query.repository)
  let result = await scraper.scrape()
  // scr.print()
  res.json({
    status: 'Scraping ' + req.query.repository,
    date: new Date(),
    ...result
  })
})

app.listen(port, () => {
  console.log(`Server up! http://localhost:${port}`) // Rocketseat/react-native-template-rocketseat-basic
})