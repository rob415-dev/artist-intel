import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const dir = './screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const n = files.length + 1;
const name = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0' });
await page.screenshot({ path: path.join(dir, name), fullPage: false });
await browser.close();
console.log(`Saved: ${path.join(dir, name)}`);
