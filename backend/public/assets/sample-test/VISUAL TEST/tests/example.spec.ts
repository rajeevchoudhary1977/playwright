import { test, expect } from '@playwright/test';
import { log } from 'console';

import fs from "fs";
import fsPromise from "fs/promises";
import imageToPdf from "image-to-pdf";
import os from 'os';
import path from "path";
import { pipeline } from 'stream/promises';
import sizeOf from 'buffer-image-size';
//const folderpath: string = '/home/rajeevchoudhary/projects/backup/new_backup/new/playwright_automation/tests';

const config = require('../config.json'); 

test.setTimeout(config.testTimeout);
test.use({
  ignoreHTTPSErrors: true,
});

// Function to get the name of the operating system
function getOSName(): string {
    return os.platform();
}

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

    console.log('filteredLinksFromAnchors',filteredLinksFromAnchors);
    console.log('filteredLinksFromButtons',filteredLinksFromButtons);

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

test('Test all unique links', async ({ page, context, browserName, userAgent }) => {
    let mainUrl = config.mainUrl; // Replace with the main URL
    mainUrl = mainUrl.replace(/\/+$/, "");

    await page.goto(mainUrl, { timeout: 1000000 });

    if(config.aem_login_page_main){
      console.log("user-login-main");
      
      await page.waitForSelector(config.username_selector);
      await page.fill(config.username_selector, config.login_usename);
      await page.fill(config.password_selector, config.login_password);
      await page.waitForSelector(config.button_selector);
      await page.click(config.button_selector);
    }
    
    const someFolder = 'ref-images';
    const snapshotsFolder = 'tests/example.spec.ts-snapshots';
    //const browserName = browserName; // Example browser name
    // const platform = 'linux'; // Example server
   
    const osName: string = getOSName();
    const platform = osName; // Example server
    const isMobile = config.isMobile; 


    if (isMobile) {
        if (userAgent.includes('Android')) {
            browserName = 'Mobile-Chrome';
        } else {
            browserName = 'Mobile-Safari';
        }
    }
 //const platform = await page.evaluate(() => navigator.platform);


    console.log(browserName);
    console.log(userAgent);

    // Fetch all images from someFolder
    const files = getFiles(someFolder);
    
    // Create snapshotsFolder if it doesn't exist
    if (!fs.existsSync(snapshotsFolder)) {
        fs.mkdirSync(snapshotsFolder);
    }
    
    const imageSizes = {};
    // Copy images to example.spec.ts-snapshots folder with appended browserName and server
    for(const file of files) {
        const sourcePath = path.join(someFolder, file);
        const destinationFilename = appendBrowserAndOs(file,browserName,platform );
        const destinationPath = path.join(snapshotsFolder, destinationFilename);
        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`Copied ${file} to ${destinationPath}`);

        const imageBuffer = await fsPromise.readFile(destinationPath);
        const imageDimensions = sizeOf(imageBuffer);
        imageSizes[file] = { width: imageDimensions.width, height: imageDimensions.height };
    }

    console.log(imageSizes);
    
    

    
    let uniqueLinks: string[] = [];

    if (config.pageByPage && Array.isArray(config.pageByPageUrls)) {
      // If both conditions are met, assign config.pageByPageUrls to uniqueLinks
      uniqueLinks = config.pageByPageUrls; // Assuming pageByPageUrls is an array of strings
    } else {
      // If any of the conditions is not met, call getUniqueLinks and assign its result to uniqueLinks
      uniqueLinks = await getUniqueLinks(page, mainUrl) as string[]; // Assuming getUniqueLinks returns an array of strings
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

    if (!config.pageByPage) {
      let updateduniqueLinks: string[] = [];
      for (let i = 0; i < uniqueLinks.length; i++) {
        const newPage = await context.newPage();
        await newPage.goto(`${uniqueLinks[i]}`);
        const newUniqueLinks = await getUniqueLinks(newPage, `${uniqueLinks[i]}`) as string[];
        updateduniqueLinks = [...newUniqueLinks,...updateduniqueLinks];
        //console.log('updateduniqueLinks'+i,updateduniqueLinks);
      }
      uniqueLinks = [...new Set(updateduniqueLinks)];
      console.log('uniqueLinks_new',uniqueLinks);
    }
    // Read old links from a file
   // const oldLinks = JSON.parse(fs.readFileSync('oldLinks.json', 'utf8'));


    for (let i = 0; i < uniqueLinks.length; i++) {
        const newPage = await context.newPage();
        console.log(`${uniqueLinks[i]}`);

        const newurl = new URL(`${uniqueLinks[i]}`);

        console.log(newurl);

        //let modifiedString: string = strReplace(newurl.href, mainUrl, '');

        let modifiedString: string = newurl.pathname;

       if(modifiedString == ''){
        modifiedString = appendBrowserAndOs(newurl.pathname,browserName,platform );
        
       }

      console.log("modified string before / comparison", modifiedString);

      if (modifiedString == '/') {
        modifiedString = 'home';
      } else {
        // if(modifiedString.startsWith("/")) {
        //   modifiedString = modifiedString.slice(1);
        // }
        // modifiedString = strReplace(modifiedString, '/', '-');
        // modifiedString = strReplace(modifiedString, '.', '-');
        modifiedString = modifiedString.replace('/', '');
        modifiedString = modifiedString.replace(/\//g, '-').replace('.', '-');
      }

      console.log('str replaced modifiedString', modifiedString);

        try {
            await newPage.goto(`${uniqueLinks[i]}`);
            if(config.one_trust_box_dev){
                await newPage.click(config.one_trust_selector);
            }

          //   if(config.is_ref_url_is_live){
          //     await newPage.click(config.one_trust_selector);
          // }

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

            console.log(config);

            if (config.sticky_header) {
              await newPage.evaluate((config) => {
                const headers = document.querySelectorAll(config.sticky_selector);
                headers.forEach((header) => {
                  if (header instanceof HTMLElement) {
                    header.style.cssText = "position: relative; top: 0; left: 0;";
                  }
                });
                window.scrollBy(0, window.innerHeight);
              }, config);
            }
          

           

            
            // Output information about the state of the page
           // console.log('After scrolling:', await page.content());

            // await newPage.evaluate(() => {
            //   const stickyElement = document.querySelector('.coh-ce-cpt_template_header_hcp-71b0d320');
            //   window.scrollTo(0, stickyElement.offsetTop);
            // });
            
            // Wait for a moment to ensure the page has finished rendering after scrolling
            //await newPage.waitForTimeout(1000);
            const imageName = `${modifiedString}.png`;
            await scrollFullPage(newPage);
            // await newPage.setViewportSize({ width: config.screen_width as number, height: 2300 });            
            await newPage.setViewportSize(imageSizes[imageName]);
            console.log('modifiedString- FINAL IMAGE NAME SHOULD BE', modifiedString);
            await expect(newPage).toHaveScreenshot(imageName, { maxDiffPixels: 100, fullPage: true, timeout: config.testScreenshotTimeout });
            await newPage.close();
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }
 if(config.is_pdf_needed){
    await generatePdf();
 }
    
});


  // Function to get all files in a directory
  function getFiles(dir: string): string[] {
      return fs.readdirSync(dir);
  }
  
  // Function to append browser name and server to filename
  function appendBrowserAndOs(filename: string,browserName: string,platform: string): string {
      const extname = path.extname(filename);
      const basename = path.basename(filename, extname);
      return `${basename}-${browserName}-${platform}${extname}`;
  }

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