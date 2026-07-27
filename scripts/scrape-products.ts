import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import slugify from 'slugify';

const SHOP_URL = 'https://aynirape.com/shop';
const PRODUCTS_DATA_FILE = path.resolve(__dirname, 'products.json');
const IMAGES_DIR = path.resolve(__dirname, 'product_images');

async function downloadImage(url: string, filename: string): Promise<string> {
  const filepath = path.join(IMAGES_DIR, filename);
  await fs.ensureDir(IMAGES_DIR);
  
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });
    
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      let error: Error | null = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(filepath);
        }
      });
    });
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return '';
  }
}

async function scrapeProducts() {
  console.log('Scraping products...');
  await fs.ensureDir(IMAGES_DIR);
  
  const productLinks = new Set<string>();
  
  // Scrape pages 1 to 4
  for (let page = 1; page <= 4; page++) {
    console.log(`Scraping shop page ${page}...`);
    const pageUrl = page === 1 ? SHOP_URL : `${SHOP_URL}?page=${page}`;
    
    try {
      const { data: html } = await axios.get(pageUrl);
      const $ = cheerio.load(html);
      
      $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        
        const isShopLink = href.startsWith('/shop/') || href.startsWith('https://aynirape.com/shop/');
        if (!isShopLink) return;
        
        const urlObj = new URL(href.startsWith('http') ? href : `https://aynirape.com${href}`);
        const pathParts = urlObj.pathname.split('/').filter(Boolean); // ['shop', 'category', 'product']
        
        // Products have 3 parts: shop, category, product-handle
        if (pathParts.length === 3 && pathParts[0] === 'shop') {
          productLinks.add(urlObj.href);
        }
      });
    } catch (e) {
      console.error(`Failed to scrape shop page ${page}`, e);
    }
  }
  
  console.log(`Found ${productLinks.size} products.`);
  
  const products: any[] = [];
  
  for (const link of Array.from(productLinks)) {
    console.log(`Scraping product: ${link}`);
    try {
      const { data: productHtml } = await axios.get(link);
      const $$ = cheerio.load(productHtml);
      
      const title = $$('h1').first().text().trim();
      if (!title) continue;
      
      const handle = slugify(title, { lower: true, strict: true });
      const description = $$('meta[name="description"]').attr('content') || '';
      
      // Price extraction (very naive, assumes standard format like "€25.00")
      // Will adjust based on Medusa's needs (in cents)
      const priceText = $$('.price').first().text().trim() || $$('meta[property="product:price:amount"]').attr('content') || '0';
      const priceVal = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
      
      let imageUrls: string[] = [];
      const ogImage = $$('meta[property="og:image"]').attr('content');
      if (ogImage) {
        imageUrls.push(ogImage);
      }
      
      const localImages: string[] = [];
      for (let i = 0; i < imageUrls.length; i++) {
        const imgUrl = imageUrls[i];
        const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
        const filename = `${handle}-${i}${ext}`;
        const localPath = await downloadImage(imgUrl, filename);
        if (localPath) localImages.push(localPath);
      }
      
      products.push({
        title,
        handle,
        description,
        price: priceVal,
        originalUrl: link,
        images: localImages
      });
      
    } catch (e) {
      console.error(`Failed to scrape ${link}`, e);
    }
  }
  
  await fs.writeJson(PRODUCTS_DATA_FILE, products, { spaces: 2 });
  console.log('Products saved to products.json');
}

scrapeProducts().then(() => console.log('Done'));
