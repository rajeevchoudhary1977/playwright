import { test, expect } from '@playwright/test';

import fs from "fs";
import fsPromise from "fs/promises";
import imageToPdf from "image-to-pdf";
import path from "path";
import { pipeline } from 'stream/promises';
//const folderpath: string = '/home/rajeevchoudhary/projects/backup/new_backup/new/playwright_automation/tests';

const config = require('../config.json'); 

//console.log(config);

test.setTimeout(config.testTimeout);
test.use({
  ignoreHTTPSErrors: true,
 // deviceScaleFactor: 2,
});

// async function getUniqueLinks(page, mainUrl) {
//     const links = await page.$$eval('a', links => links.map(link => link.href));
    
//     const url = new URL(mainUrl);
//     const baseUrl = url.href;

//     console.log(baseUrl);

//     const filteredLinks = links.filter(link => {
//         try {
//             new URL(link);
//             return link && 
//                 link.includes(baseUrl) && 
//                 link !== 'javascript:void(0);' && 
//                 link !== 'javascript:void(0)' &&
//                 !link.endsWith('.pdf') &&
//                 !link.endsWith('#') && !link.endsWith('#main-content') ;
//             } catch (_) {
//             return false;
//         }
//     });

//     const uniqueLinks = [...new Set(filteredLinks)];
//     return uniqueLinks.sort();
// }
async function getUniqueLinks(page, mainUrl) {
  try {
    const linksFromAnchors = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
    const linksFromButtons = await page.$$eval('button', buttons => buttons.map(button => button.getAttribute('onclick')));

    const baseUrl = new URL(mainUrl).host;
    console.log("baseUrl", baseUrl);
    

    // Normalize and filter links from <a> tags
    const filteredLinksFromAnchors = linksFromAnchors.filter(link => {
      try {
        const url = new URL(link).href;        
        return url.includes(baseUrl) &&
          !url.endsWith('.pdf') &&
          !url.endsWith('#') &&
          !url.endsWith('#main-content');
      } catch (err) {
        // console.log(err);
        return false;
      }
    });

    // Normalize and filter links from <button> tags
    const filteredLinksFromButtons = linksFromButtons.map(link => {
      if (!link) return null;
      const match = link.match(/location\.href=['"]([^'"]+)['"]/);
      return match ? new URL(match[1]).href : null;
    }).filter(link => {
      return link && 
        link.includes(baseUrl) &&
        !link.endsWith('.pdf') &&
        !link.endsWith('#') &&
        !link.endsWith('#main-content');
    });

    // console.log('filteredLinksFromAnchors',filteredLinksFromAnchors);
    // console.log('filteredLinksFromButtons',filteredLinksFromButtons);

    // Combine and return unique links
    const allLinks = [...filteredLinksFromAnchors, ...filteredLinksFromButtons];
    const uniqueLinks = [...new Set(allLinks)];
    const uniqueLinksFiltered = uniqueLinks.filter((link) => link.trim().length > 0);
    console.log("uniqueLinksFiltered", uniqueLinksFiltered);
    
    return uniqueLinksFiltered.sort();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

const generatePdf = async (): Promise<void> => {
    const imagesDir: string = path.join(__dirname, "mlr.spec.ts-snapshots");
  
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

    await page.goto(Array.isArray(mainUrl) ? mainUrl.at(0) : mainUrl, { timeout: 1000000 });
    
    let uniqueLinks;
    if (config.mlrPageByPage) {
      uniqueLinks = mainUrl;
    } else {
      uniqueLinks = await getUniqueLinks(page, mainUrl);
    }
    
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

    

    let updateduniqueLinks: string[] = [];
    for (let i = 0; i < uniqueLinks.length; i++) {
      const newPage = await context.newPage();
      await newPage.goto(`${uniqueLinks[i]}`);
      let newUniqueLinks;
      if (config.mlrPageByPage) {
        newUniqueLinks = mainUrl;
      } else {
        newUniqueLinks = await getUniqueLinks(newPage, `${uniqueLinks[i]}`) as string[];
      }
      updateduniqueLinks = [...newUniqueLinks,...updateduniqueLinks];
      //console.log('updateduniqueLinks'+i,updateduniqueLinks);
    }
    uniqueLinks = [...new Set(updateduniqueLinks)];
    // console.log('uniqueLinks_new',uniqueLinks);
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

        const newurl = new URL(`${uniqueLinks[i]}`);
        // console.log(newurl);

        let modifiedString: string = strReplace(newurl.href, mainUrl, '');

        // console.log(modifiedString);

        if(modifiedString == '/'){
          modifiedString = 'home';
        }else{
          modifiedString = strReplace(modifiedString, '/', '');
        }

        try {
            await newPage.goto(`${uniqueLinks[i]}`, {waitUntil: 'networkidle'});
            if(config.one_trust_box_dev){
                await newPage.click(config.one_trust_selector);
            }

            if(config.isi_tray_exist){
              await newPage.locator(config.isi_tray_selector).evaluate(element => element.style.display = 'none');
              }

              if(modifiedString == 'home'){

                if(config.home_page_hover_selector) {
                  const componentSelector = await newPage.$(config.home_page_hover_selector);
                // const pinnedIsiBox = await newPage.$('.isi-expand-btn'); // Adjust the selector based on your actual structure
                // const unpinnedIsiBox = await newPage.$('.unpinned .isi_box'); // Adjust the selector based on your actual structure
                  await componentSelector?.hover();
    
                  const hoverBoxPath = `tests/mlr.spec.ts-snapshots/expectedScreenshot${i}hoverBox.png`;
                      
                  
                  await newPage.screenshot({ path: hoverBoxPath });
    
                  await newPage.waitForTimeout(1000);
                }
                
                  // Select the menu items with two classes
                  if(config.dropdown_menu_item_selector) {
                    const menuItemsWithTwoClasses = await newPage.$$(config.dropdown_menu_item_selector);
    
                    for (const menuItem of menuItemsWithTwoClasses) {
                      // Trigger hover on the menu item
                      await menuItem.hover();
    
                      // Capture screenshot of the menu item with the submenu displayed
                      const menuItemTitle = (await menuItem.innerText()).replace(/\s/g, '').toLowerCase();
    
                      const screenshotPath = `tests/mlr.spec.ts-snapshots/expectedScreenshot${i}${menuItemTitle}.png`;
                      await newPage.screenshot({ path: screenshotPath});
    
                      // Optionally, add a delay to ensure the screenshot is captured after the submenu is fully visible
                      await newPage.waitForTimeout(1000);  // Adjust the delay as needed
                    }
                  }
              }

              if(config.accordion_url != ''){

                if(modifiedString == config.accordion_url){
    
                  // console.log(config.accordion_url);
     
                         await newPage.evaluate(() => {
                           const headers = document.querySelectorAll('.accord-content');
                           headers.forEach((header) => {
                             if (header) {
                               (header as HTMLElement).style.display = "block";
                             }
                           });
                         });
     
                         const screenshotPath = `tests/mlr.spec.ts-snapshots/expectedScreenshot${i}${modifiedString}.png`;
                
                         await newPage.screenshot({ path: screenshotPath, fullPage: true  });


                
     
                         // Optionally, you can take a screenshot to verify the changes
                         await newPage.screenshot({ path: 'screenshot.png' });
                 }
     
    
               }

            if(config.isi_tray_exist){
              await newPage.locator(config.isi_tray_selector).evaluate(element => element.style.display = 'none');
            }


await newPage.waitForTimeout(500);

await newPage.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
 

// Remove overlay if present
// await newPage.evaluate(() => {
//   const overlay = document.querySelector('.overlay'); // Adjust selector if needed
//   if (overlay) {
//       overlay.style.display = 'none';
//   }
// });


await newPage.waitForTimeout(500);
const screenshotPath = `tests/mlr.spec.ts-snapshots/expectedScreenshot${i}${modifiedString}.png`;
await newPage.screenshot({ path: screenshotPath, fullPage: true });


        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }
//  if(config.is_pdf_needed){
    await generatePdf();
//  }
    
});

function strReplace(originalString: string, searchString: string, replacementString: string): string {
  return originalString.split(searchString).join(replacementString);
}

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

function generateTimestamp(arg): string {
  const currentDate = new Date();
  const timestamp = currentDate.toISOString().slice(0, 10).replace(/-/g, '') + '-' + currentDate.toTimeString().slice(0, 8).replace(/:/g, '');
  return timestamp;
}