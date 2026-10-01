const {test, expect} = require('@playwright/test');
const { TIMEOUT } = require('node:dns');

test('Account creation', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/angularpractice/');
  await page.getByLabel('Check me out if you Love IceCreams!').click()
  await page.getByLabel('Gender').selectOption('Male')
  await page.getByPlaceholder('Password').fill('name')
  await page.getByRole('button', {name: 'Submit'} ).click()
  const lable=await page.getByText('The Form has been submitted successfully!').isVisible()
  // wait is for specific element(sligtly higher then the global wait)
  expect(page.getByText('The Form has been submitted successfully!')).toBeVisible({ timeout : 7000})
  await page.getByRole('link', {name: 'Shop' }).click()
  // Use filter on app-card; chaining from the Nokia Edge link would search for Add inside that link.
  await page.locator('app-card').filter({hasText: 'Nokia Edge'}).getByRole('button', { name: 'Add' }).click();
})

test('waits', async({ page })=>{
  /* Important notes:
  An explicit timeout (step or config) only shortens or lengthens that specific operation's own wait.
  It can never push execution beyond the overall Test Timeout. If the Test Timeout hits first, 
  everything stops — regardless of what any action/assertion timeout was set to*/
  test.setTimeout(60000)
  //Test level timout for expect
  const delayexpect = expect.configure({timeout: 20000})
  //For this specific Navigation wait for 30sec to happen. Instead of relay on global Navigation wait.
  await page.goto('https://rahulshettyacademy.com/angularpractice/' , { timeout: 30000 });
  //For this specific action wait for 10sec to happen. Instead of relay on global action wait.
  await page.getByRole('link', {name:'Shop'}).click({ timeout: 10000 })
  await delayexpect(page.getByRole('link', {name:'Category 3'})).toHaveText('Category 3' , {timeout :4_000})
 // Heirarchy of waits Elementlevel ->testlevel -> global level event (action, expect ..) -> global overall wait
   
})

test('Excersie', async ({page })=>{
  await page.goto('https://rahulshettyacademy.com/client')
  await page.getByPlaceholder("email@example.com").fill('nk3033@srmist.edu.in')
  await page.getByPlaceholder("enter your passsword").fill('Humana@9')
  await page.getByRole('button',{name: 'Login'}).click()
  //await page.locator(".card-body b").first().waitFor();
  await page.locator('.card-body').filter({hasText: 'ZARA COAT 3'}).getByRole('button' , {name: 'Add To Cart'}).click()
  await page.getByRole('listitem').getByRole("button",{name :"Cart"}).click();
  await page.getByRole("button",{name :"Checkout"}).click();
  await page.getByPlaceholder('Select Country').pressSequentially('ind')
  await page.getByRole('button',{name: "India"}).nth(1).click()
  await page.getByText("PLACE ORDER").click()
  await expect(page.getByText('Thankyou for the order.')).toBeVisible()
})

test('codegen created test', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/angularpractice/');
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'Shop' }).click();
  await page.locator('app-card').filter({ hasText: 'Blackberry $24.99 Lorem ipsum' }).getByRole('button').click();
  await page.getByText('Checkout ( 1 ) (current)').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByRole('textbox', { name: 'Please choose your delivery' }).click();
  await page.getByRole('textbox', { name: 'Please choose your delivery' }).fill('chennai');
  await page.getByText('I agree with the term &').click();
  await page.getByRole('checkbox', { name: 'I agree with the term &' }).check();
  await expect(page.getByRole('button', { name: 'Purchase' })).toBeVisible();
  await page.getByRole('button', { name: 'Purchase' }).click();
  await expect(page.getByRole('textbox', { name: 'Please choose your delivery' })).toHaveValue('chennai');
  await expect(page.locator('app-checkout')).toContainText('× Success! Thank you! Your order will be delivered in next few weeks :-).');
});

