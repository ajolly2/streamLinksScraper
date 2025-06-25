// index.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://www.mlb.com/live-stream-games';
  const browser = await puppeteer.launch();
  const page    = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for the Live Games table
  await page.waitForSelector('section.MlbTvLiveGames table');

  const games = await page.$$eval(
    'section.MlbTvLiveGames table tbody tr',
    rows => rows.map(r => {
      const tds = r.querySelectorAll('td');
      const timeCell   = tds[0]?.innerText.trim()    || '';
      const matchup    = tds[1]?.innerText.trim()    || '';
      const streamCell = tds[2];
      // grab first link in the MLB.TV cell
      const linkEl = streamCell ? streamCell.querySelector('a[href*="/tv/"]') : null;
      const streamUrl = linkEl ? linkEl.href : '';
      return { time: timeCell, matchup, streamUrl };
    })
  );

  await browser.close();

  // write out json
  const out = path.resolve(process.cwd(), 'WATCH_LINKS.json');
  fs.writeFileSync(out, JSON.stringify(games, null, 2));
  console.log(`→ Wrote ${games.length} games to ${out}`);
})();
