const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));
  
  console.log("Going to login...");
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'test_user_123@example.com');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  console.log("Waiting for navigation to home...");
  await page.waitForURL('http://localhost:5173/');
  
  console.log("Going to checkout...");
  await page.goto('http://localhost:5173/checkout');
  await page.waitForTimeout(3000);
  console.log("Done.");
  
  await browser.close();
})();
