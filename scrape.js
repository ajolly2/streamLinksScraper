const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://www.mlb.com/scores', { waitUntil: 'networkidle2' });

  // Wait for the watch icons to appear (adjust selector to match MLB markup)
  await page.waitForSelector('a.watch-link', { timeout: 15000 });

  // Extract all team-abbrev + href
  const links = await page.$$eval('a.watch-link', els =>
    els.map(a => {
      // e.g. the sibling or parent contains "BOS:" text
      const label = a.closest('li')?.querySelector('.team-abbrev')?.textContent?.trim() || '';
      return { team: label.replace(':',''), url: a.href };
    })
  );

  await browser.close();

  // Write out JSON
  fs.writeFileSync('WATCH_LINKS.json', JSON.stringify(links, null, 2));
  console.log(`✅ scraped ${links.length} links`);
})();
