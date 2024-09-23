async function getCall(username, password) {
    const browser = await puppeteer.launch({
        headless: false, // Set to true if you don't want to see the browser UI
        product: 'chrome',
        protocol: 'webDriverBiDi'
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto('https://synergy.servicetec.in/#/login');

    // Wait for the username input field to appear and type the username
    await page.waitForSelector('input[name="username"]', { timeout: 30000 });
    await page.type('input[name="username"]', username);

    // Wait for the password input field to appear and type the password
    await page.waitForSelector('input[name="password"]', { timeout: 30000 });
    await page.type('input[name="password"]', password);

    // Wait for the login button and click it
    await page.waitForSelector('button[type="submit"]', { timeout: 30000 });
    await page.click('button[type="submit"]');

    // Optionally wait for navigation or some indication of successful login
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Now you can continue with actions after logging in
    const content = await page.content();
    console.log(content); // Debug: Print the page content after login

    // Close the browser after you're done
    await browser.close();
}

// Call getCall with your credentials
getCall('your_username', 'your_password').catch(console.error);
