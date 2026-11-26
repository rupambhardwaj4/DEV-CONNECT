import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:5173';
const OUT = 'C:\\Users\\HP\\Desktop\\Devconnect\\report_assets\\screenshots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--window-size=1440,900', '--disable-gpu', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.25 });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function goto(path) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1800);
}

async function shot(name, path) {
  await goto(path);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  const buf = await page.screenshot({ fullPage: true });
  fs.writeFileSync(`${OUT}\\${name}.png`, buf);
  console.log('ok', name);
}

async function login(email, password) {
  await goto('/login');
  await page.type('#login-email', email);
  await page.type('#login-password', password);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 20000 });
  await sleep(1500);
}

async function logoutCleanup() {
  const client = await page.createCDPSession();
  await client.send('Network.clearBrowserCookies');
  await client.send('Network.clearBrowserCache');
  await goto('/landing');
}

// pick a job priya has NOT applied to
const res = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'priya.raman@devconnect.test', password: 'demo1234' }),
});
const cookie = res.headers.get('set-cookie').split(';')[0];
const jobs = await (await fetch('http://localhost:3000/api/v1/jobs', { headers: { cookie } })).json();
const apps = await (await fetch('http://localhost:3000/api/v1/applications', { headers: { cookie } })).json();
const applied = new Set(apps.items.map((a) => a.jobId));
const openJob = jobs.items.find((j) => !applied.has(j.id) && j.status === 'published');
const appliedJob = apps.items[0];
console.log('apply target:', openJob.id, 'detail target:', appliedJob.id);

// --- public screens ---
await shot('01-landing', '/landing');
await shot('02-login', '/login');
await shot('03-register', '/register');

// --- developer ---
await login('priya.raman@devconnect.test', 'demo1234');
await shot('04-dashboard', '/');
await shot('05-jobs', '/jobs');
await shot('06-matches', '/matches');
await shot('07-job-details', `/jobs/${openJob.id}`);
await shot('08-apply', `/jobs/${openJob.id}/apply`);
await shot('09-applications', '/applications');
await shot('10-application-detail', `/applications/${appliedJob.id}`);
await shot('11-saved-jobs', '/saved');
await shot('12-network', '/network');
await shot('13-repositories', '/repositories');
await shot('14-profile', '/profile');
await shot('15-profile-edit', '/profile/edit');
await shot('16-notifications', '/notifications');
await shot('17-settings', '/settings');

// --- recruiter ---
await logoutCleanup();
await login('nathan.boone@devconnect.test', 'demo1234');
await shot('18-recruiter-overview', '/recruiter');
await shot('19-recruiter-jobs', '/recruiter/jobs');
await shot('20-recruiter-job-form', '/recruiter/jobs/new');
await shot('21-recruiter-applicants', '/recruiter/applicants');
await shot('22-saved-candidates', '/recruiter/candidates');
await shot('23-candidate-profile', '/developers/priya-raman');

await browser.close();
console.log('done');
