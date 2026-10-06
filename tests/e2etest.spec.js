const {test, expect} = require('@playwright/test');
const { count } = require('node:console');

test('End to end test with product selection', async ({page})=>{
  await page.goto('https://rahulshettyacademy.com/client/#/auth/login');
  await page.getByRole('textbox', { name: 'email@example.com' }).fill('test6991@gmail.com');
  await page.getByRole('textbox', { name: 'email@example.com' }).press('Tab');
  await page.getByRole('textbox', { name: 'enter your passsword' }).fill('Humana@9');
  await page .locator('#login').click()
  await page.locator('.card-body b').first().waitFor()
  const productName =  page.locator('.card-body b')
  const productCount = await productName.count()
  console.log(await productName.allTextContents() , productCount)
  for(let i=0 ; i<productCount ; ++i)
    if(await productName.nth(i).textContent() == "ADIDAS ORIGINAL")
    {
        await page.locator("text= Add To Cart").nth(i).click();
        break;
    }
  await page.locator('[routerlink *= "/dashboard/cart"]').click()
  //Playwright include a number of CSS pseudo-classes to match elements by their text content.:has-text() matches any element containing specified text somewhere inside, possibly in a child or a descendant element.
  await page.locator("button:has-text('Buy Now')").click()
  await page.getByPlaceholder("Select Country").pressSequentially('ind')
  await page.locator('.user__address button').first().waitFor()
  const addrress =  page.locator('.user__address button')
  const countdown = await addrress.count()
  console.log(await addrress.allTextContents());
  for (let i=0 ; i<countdown ; ++i)
  {
    if (await addrress.nth(i).textContent() === ' India')
    {
      await addrress.nth(i).click()
      break;
    }
  }
  await page.locator('.action__submit').click()
  await page.locator('.em-spacer-1 .ng-star-inserted').waitFor()
  const id = (await page.locator('.em-spacer-1 .ng-star-inserted').textContent())
  .replace(/\|/g, '')
  .trim()
  await page.getByRole('button', {name: '  ORDERS'}).click()
  await page.getByText(id).waitFor()
  const roleButton = await page.getByRole('button', {name: 'View'}).count()
  for(let i=0 ; i < roleButton ; ++i)
  {
    console.log(await page.locator('.ng-star-inserted [scope="row"]').nth(i).textContent())
      if(await page.locator('.ng-star-inserted [scope="row"]').nth(i).textContent()===id)
          {
          await page.getByRole('button', {name: 'View'}).nth(i).click()
          break;
          }
}

})

test.only("Java popup and hoverover and frame", async ({page})=>{
  await page.goto("https://rahulshettyacademy.com/AutomationPractice/")
  await page.locator('#mousehover').hover()
  await page.getByRole('link', {name: 'Reload', exact: true}).click()
  page.once('dialog', dialog => dialog.accept())
  await page.locator('#alertbtn').click()
  const frame= page.frameLocator('#courses-iframe')
  //clicks only the visible element even if there is same element is 2 with one is invisible.
  await frame.locator('li a[href*="lifetime-access"]:visible').click()
})