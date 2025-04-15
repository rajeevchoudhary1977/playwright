import { test, expect } from '@playwright/test';

import fs from "fs";
import fsPromise from "fs/promises";
import imageToPdf from "image-to-pdf";
import path from "path";
import { pipeline } from 'stream/promises';
//const folderpath: string = '/home/rajeevchoudhary/projects/backup/new_backup/new/playwright_automation/tests';

const config = require('../config.json'); 

test.setTimeout(config.testTimeout)

async function getUniqueLinks(page, mainUrl) {
    const links = await page.$$eval('a', links => links.map(link => link.href));
    
    const url = new URL(mainUrl);
    const baseUrl = url.href;

    console.log(baseUrl);

    const filteredLinks = links.filter(link => {
        try {
            new URL(link);
            return link && 
                link.includes(baseUrl) && 
                link !== 'javascript:void(0);' && 
                link !== 'javascript:void(0)' &&
                !link.endsWith('.pdf') &&
                !link.endsWith('#') && !link.endsWith('#main-content') ;
            } catch (_) {
            return false;
        }
    });

    const uniqueLinks = [...new Set(filteredLinks)];
    return uniqueLinks.sort();
}

const generatePdf = async (): Promise<void> => {
    const imagesDir: string = path.join(__dirname, "example.spec.ts-snapshots");
  
    const outputPath: string = path.join(__dirname, "output", "output.pdf");
  
    const images: string[] = await fsPromise.readdir(imagesDir);

    //console.log(images);
    const pngImages: string[] = images.filter((image: string) => image.toLowerCase().endsWith(".png"));

    if (pngImages.length === 0) {
      console.log("-----------No PNG images found. Aborting----------");
      return;
    }
  
    const pngImagesWithPaths: string[] = pngImages.map((imageName: string) => path.join(imagesDir, imageName));
 
    await pipeline(imageToPdf(pngImagesWithPaths, imageToPdf.sizes.A4), fs.createWriteStream(outputPath));

    console.log("------------PDF Generated Successfully!!!-----------");

  };

test('Test all unique links', async ({ page, context }) => {
    const mainUrl = config.mainUrl; // Replace with the main URL

    await page.goto(mainUrl, { timeout: 1000000 });

    

    
    const uniqueLinks = await getUniqueLinks(page, mainUrl);
    
   // await page.click('.select-text');

    if(config.hcp_box){
        await page.click(config.hcp_box_selector);
    }
    if(config.one_trust_box){
        await page.click(config.one_trust_selector);
    }

    if(config.isi_tray_exist){
    await page.locator(config.isi_tray_selector).evaluate(element => element.style.display = 'none');
    }
   // await page.locator('.coh-ce-cpt_template_header_hcp-71b0d320').evaluate(element => element.style.position = 'sticky');
   // await page.locator('.coh-ce-cpt_template_header_hcp-71b0d320').evaluate(element => element.style.top = '0');
   // await page.locator('.coh-ce-cpt_template_header_hcp-71b0d320').evaluate(element => element.style.left = '0');
   // await page.locator('.coh-ce-cpt_template_header_hcp-71b0d320').evaluate(element => element.style.zIndex = '4');
   // await page.locator('.coh-ce-cpt_template_header_hcp-71b0d320').evaluate(element => element.style.borderBottomColor = 'red');
// Scroll to a position where the sticky element is in the middle of the page

    

    console.log(uniqueLinks);
    // Read old links from a file
   // const oldLinks = JSON.parse(fs.readFileSync('oldLinks.json', 'utf8'));

    // Compare old links with unique links
  //  const areLinksEqual = JSON.stringify(oldLinks.sort()) === JSON.stringify(uniqueLinks.sort());
  //  console.log(areLinksEqual); // Will print true or false
 // Inject custom CSS to modify the style of the sticky menu
 const customCss = `
 header {
  position: fixed;
  top:-50;
  left: 0;
  width: 100%;
  z-index: 99;
  background-color: gray;
}
`;
    for (let i = 0; i < uniqueLinks.length; i++) {
        const newPage = await context.newPage();
        console.log(`${uniqueLinks[i]}`);
        try {
            await newPage.goto(`${uniqueLinks[i]}`);
            if(config.one_trust_box_dev){
                await newPage.click(config.one_trust_selector);
            }

            if(config.isi_tray_exist){
              await newPage.locator(config.isi_tray_selector).evaluate(element => element.style.display = 'none');
              }

           // await page.waitForSelector('.coh-ce-cpt_template_header_hcp-71b0d320', { state: 'visible' });
           
            //await newPage. ('.coh-ce-cpt_template_header_hcp-71b0d320');
           // await newPage.hover('.has-children');
          
            // await newPage.evaluate(() => {
            //   window.scrollTo(0, document.body.scrollHeight);
            // });

            //await newPage.addStyleTag({ content: customCss })

            // Wait for scrolling and dynamic content to finish loading
            // await Promise.all([
            //   newPage.waitForTimeout(1000), // Adjust the timeout if needed
            //   newPage.waitForSelector('.coh-ce-cpt_template_header_hcp-71b0d320', { state: 'visible' }),
            //   await newPage.addStyleTag({ content: customCss })
            //   // Add more waitForSelector or other relevant wait conditions if needed
            // ]);

            
            // Output information about the state of the page
           // console.log('After scrolling:', await page.content());

            // await newPage.evaluate(() => {
            //   const stickyElement = document.querySelector('.coh-ce-cpt_template_header_hcp-71b0d320');
            //   window.scrollTo(0, stickyElement.offsetTop);
            // });
            
            // Wait for a moment to ensure the page has finished rendering after scrolling
            //await newPage.waitForTimeout(1000);
            await scrollFullPage(newPage);
            await newPage.setViewportSize({ width: 1320, height: 1500 });
            await expect(newPage).toHaveScreenshot(`expectedScreenshot${i}.png`, { maxDiffPixels: 100, fullPage: true, timeout: config.testScreenshotTimeout });
            await newPage.close();
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }
 if(config.is_pdf_needed){
    await generatePdf();
 }
    
});

async function scrollFullPage(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}