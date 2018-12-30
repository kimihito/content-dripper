import * as functions from 'firebase-functions';
const Readability = require('readability');
import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';

exports.contentDripper = functions.runWith({
  timeoutSeconds: 540,
  memory: '512MB'
}).https.onRequest(async (request, response) => {
  const url = request.query.url
  if (request.method !== 'GET') {
    response.status(404).json({"code": "not.found"})
    return
  }

  if (!url) {
    response.status(500).json({"code": "not.url.query"})
    return
  }

  try {
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--lang=ja,en-US,en'
      ]
    });

    const page = await browser.newPage();
    await page.goto(url)
    const html = await page.evaluate(() => {
      return document.body.innerHTML
    });
    const dom = new JSDOM(html)
    const content = new Readability(dom.window.document).parse()
    response.status(200).json(content)

  } catch (e) {
    response.status(500).json({"code": "failed.to.crawl"})
    console.error(e)
  }
  return
});