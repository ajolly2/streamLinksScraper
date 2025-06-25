// index.js
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  // 1) Launch browser with no-sandbox flags for CI
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 2) Open a new page and go to the MLB scores page
    const page = await browser.newPage();
    await page.goto('https://www.mlb.com/scores', { waitUntil: 'networkidle2' });

    // 3) Extract all "Watch" links
    const watchLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .filter(a => a.textContent.trim() === 'Watch')
        .map(a => a.href);
    });

    // 4) Write the results to WATCH_LINKS.json
    fs.writeFileSync('WATCH_LINKS.json', JSON.stringify(watchLinks, null, 2));
    console.log(`✅ Found ${watchLinks.length} watch link(s).`);
  } catch (err) {
    console.error('❌ Error during scrape:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
