const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Logo configurations
const logoConfigs = [
  {
    selector: '#icon-standard .foy-lekke-logo-icon',
    filename: 'foylekke-icon-40x40.png',
    width: 80,
    height: 80
  },
  {
    selector: '#icon-large .foy-lekke-logo-icon',
    filename: 'foylekke-icon-64x64.png',
    width: 120,
    height: 120
  },
  {
    selector: '#full-standard .foy-lekke-logo',
    filename: 'foylekke-full-standard.png',
    width: 400,
    height: 100
  },
  {
    selector: '#full-large .foy-lekke-logo',
    filename: 'foylekke-full-large.png',
    width: 600,
    height: 150
  },
  {
    selector: '#text-standard .foy-lekke-logo-text',
    filename: 'foylekke-text-standard.png',
    width: 300,
    height: 80
  },
  {
    selector: '#text-large .foy-lekke-logo-text',
    filename: 'foylekke-text-large.png',
    width: 450,
    height: 120
  }
];

async function generateLogos() {
  console.log('🎨 Starting logo generation...');
  
  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../public/images/logos');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Load the logo export HTML file
    const htmlPath = path.join(__dirname, '../logo-export.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    // Generate each logo
    for (const config of logoConfigs) {
      console.log(`📸 Generating ${config.filename}...`);
      
      try {
        // Wait for element to be ready
        await page.waitForSelector(config.selector, { timeout: 5000 });
        
        // Get element
        const element = await page.$(config.selector);
        if (!element) {
          console.error(`❌ Element not found: ${config.selector}`);
          continue;
        }

        // Take screenshot
        const screenshot = await element.screenshot({
          type: 'png',
          omitBackground: true, // Transparent background
          clip: {
            x: 0,
            y: 0,
            width: config.width,
            height: config.height
          }
        });

        // Save file
        const outputPath = path.join(outputDir, config.filename);
        fs.writeFileSync(outputPath, screenshot);
        
        console.log(`✅ Generated: ${config.filename}`);
      } catch (error) {
        console.error(`❌ Failed to generate ${config.filename}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error during logo generation:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log('🎉 Logo generation complete!');
}

// Run if called directly
if (require.main === module) {
  generateLogos().catch(console.error);
}

module.exports = { generateLogos }; 