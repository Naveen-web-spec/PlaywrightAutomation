const {test, expect} = require('@playwright/test');

test('Account creation', async ({ page }) => {
  await page.goto('https://eventhub.rahulshettyacademy.com/login');
  const title = await page.title();
  //toBe compares immediate values so it doesn't require await
  expect(title).toBe('EventHub — Discover & Book Events');
  await page.locator("//*[text()='Register']").click()
  await page.locator("#register-email").fill('nk3033@srmist.edu.com')
  await page.getByTestId("register-password").fill('Humana@9')
  await page.getByPlaceholder("Repeat your password").fill('Humana@9')
  await page.locator("#register-btn").click()
})

test('Login EventHub', async ({page})=>{
  const password =page.locator("#password")
  const signIn = page.locator("#login-btn")
  const event =page.locator("article#event-card a")
  await page.goto('https://eventhub.rahulshettyacademy.com/login');
  const title = await page.title();
  await expect(page).toHaveTitle('EventHub — Discover & Book Events')
  await page.locator("#email").fill('nk3033@srmist.edu.in')
  await password.fill('Humanaasd@9')
  await page.locator("#login-btn").click()
  //Get by text is methods locate the element with the text
  const errorText = await page.getByText('Invalid email or password').textContent()
  expect(errorText).toContain('Invalid email or password')
  await password.fill('')
  await password.fill('Humana@9')
  await signIn.click()
  const diwali =await event.first().textContent()
  console.log(diwali)
  //allTextContents method return array. It doesn't have autowait so it may return [] when it used as first textfetcher(without first().textContent())
  console.log(await event.allTextContents())
})

test('second test', async ({browser})=>{  //browser represent instance available to test. 
  //newContext is similar to have separate profile in browser with it's own cookies, session data.
    const context = await browser.newContext();
    const page= await context.newPage();
    await page.goto("https://google.com")
    //toHaveTitle compare the return promise so await is required.
    await expect(page).toHaveTitle('Google')
})

test('Select event', async ({page})=>{
  const password =page.locator("#password")
  const signIn = page.locator("#login-btn")
  const event =page.locator("article#event-card a")
  await page.goto('https://eventhub.rahulshettyacademy.com');
  const title = await page.title();
  await expect(page).toHaveTitle('EventHub — Discover & Book Events')
  await page.locator("#email").fill('nk3033@srmist.edu.in')
  await password.fill('Humana@9')
  await signIn.click()
  //wait for login to complete (redirect away from /login) before proceeding
  //await page.waitForURL(url => !url.pathname.includes('/login'))
  await page.getByText('Explore All Events').waitFor() // wait until the element is loaded
  await page.getByText('Explore All Events').click()
  await page.waitForLoadState('networkidle'); // Depresiated but can be used to wait for network action on the page to complete.
  const option= page.locator("[class*='w-full']").nth(1)
  console.log(await option.allTextContents())
  await option.selectOption('Sports')
})

test('checkbox' , async ({ page })=>{
  const userElement = page.locator('#usertype')
  const agree = page.locator('#terms')
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
  await userElement.nth(1).check()
  // ischecked return boolean statement so we are verifies it is true. One way of asserting
  expect(await userElement.nth(1).isChecked()).toBeTruthy()
  await page.locator('#okayBtn').first().click()
  await agree.click()
  await expect(agree).toBeChecked()
  await agree.uncheck()
})

test('Child window' , async ({ browser })=>{
  const context = await browser.newContext();
  const page= await context.newPage();
  const userElement = page.locator('#usertype')
  const agree = page.locator('#terms')
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
  // Popup pattern: wait for the 'page' event before clicking, then await both promises.
  // Use Promise.all([...]), not Promise.all[...]; use a locator to click, not getAttribute().getAttribute() is for reading an attribute value from an element
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.locator('.blinkingText').first().click(),
  ])
  const userName= await newPage.locator('.red').textContent()
  const firstName = userName.split('@')[1]
  const realName=firstName.split('.')[0]
  await page.locator('#username').fill(realName)
  //inputvalue capture it from the dom on what we have entered. unless textcontent doesn't get it from dom.
  const inputonUserName= await page.locator('#username').inputValue()
  console.log(inputonUserName)
})