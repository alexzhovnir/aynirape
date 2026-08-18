import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import slugify from 'slugify';

const SHOP_URL = 'https://aynirape.com/shop';
const PRODUCTS_DATA_FILE = path.resolve(__dirname, '../apps/storefront/src/lib/data/products.json');
const SCRIPTS_PRODUCTS_DATA_FILE = path.resolve(__dirname, 'products.json');

interface ScrapedProduct {
  title: string;
  handle: string;
  category: string;
  shortDescription: string;
  description: string;
  fullDescriptionHtml: string;
  ingredients?: string;
  keyCharacteristics?: string[];
  sections?: { title: string; content: string }[];
  price: number;
  variants: { title: string; price: number; size: string }[];
  originalUrl: string;
  images: string[];
}

function cleanHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  const $ = cheerio.load(rawHtml, null, false);
  
  // Remove useless style attributes and empty spans
  $('*').each((_, el) => {
    $(el).removeAttr('style');
    $(el).removeAttr('aria-level');
    $(el).removeAttr('class');
    
    // Replace non-breaking spaces with normal spaces
    if ($(el).text()) {
      // keep structure
    }
  });

  // Unwrap redundant empty spans
  $('span').each((_, el) => {
    const spanHtml = $(el).html();
    $(el).replaceWith(spanHtml || '');
  });

  return $.html().trim();
}

function parseSections(cleanHtmlContent: string): {
  ingredients?: string;
  keyCharacteristics: string[];
  sections: { title: string; content: string }[];
  cleanParagraphs: string[];
} {
  const $ = cheerio.load(cleanHtmlContent, null, false);
  const keyCharacteristics: string[] = [];
  const sections: { title: string; content: string }[] = [];
  const cleanParagraphs: string[] = [];
  let ingredients: string | undefined;

  $('li').each((_, el) => {
    const text = $(el).text().replace(/^-\s*/, '').trim();
    if (text) {
      keyCharacteristics.push(text);
    }
  });

  $('p').each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;

    if (text.toLowerCase().startsWith('ingredients:')) {
      ingredients = text.replace(/^ingredients:\s*/i, '').trim();
      return;
    }

    const strongEl = $(el).find('strong, b');
    if (strongEl.length === 1 && strongEl.text().trim() === text) {
      // This is a section title
      const title = text.replace(/:$/, '');
      let nextContent = '';
      let next = $(el).next();
      while (next.length > 0 && !next.find('strong, b').length && next.get(0)?.tagName !== 'ul') {
        if (next.get(0)?.tagName === 'p') {
          const nextText = next.text().trim();
          if (nextText.toLowerCase().startsWith('ingredients:')) {
            ingredients = nextText.replace(/^ingredients:\s*/i, '').trim();
          } else {
            nextContent += (nextContent ? '\n\n' : '') + nextText;
          }
        }
        next = next.next();
      }
      if (title && nextContent) {
        sections.push({ title, content: nextContent });
      }
    } else {
      cleanParagraphs.push(text);
    }
  });

  return { ingredients, keyCharacteristics, sections, cleanParagraphs };
}

async function scrapeAllProducts() {
  console.log('--- Starting Comprehensive Product Scraping with Rich SEO Texts ---');
  
  const productLinks = new Map<string, string>(); // url -> category
  
  const categoryUrls = [
    { url: 'https://aynirape.com/shop/rape', category: 'rape' },
    { url: 'https://aynirape.com/shop/tepi-and-kuripe', category: 'tepi-and-kuripe' },
    { url: 'https://aynirape.com/shop/aromatics', category: 'aromatics' },
    { url: 'https://aynirape.com/shop/supplements', category: 'supplements' },
    { url: 'https://aynirape.com/shop/ornaments-and-decoration', category: 'ornaments-and-decoration' },
  ];

  // Scrape category pages (up to 5 pages each)
  for (const cat of categoryUrls) {
    for (let page = 1; page <= 6; page++) {
      const pageUrl = page === 1 ? cat.url : `${cat.url}?page=${page}`;
      try {
        const { data: html } = await axios.get(pageUrl);
        const $ = cheerio.load(html);
        
        let foundOnPage = 0;
        $('a').each((_, el) => {
          const href = $(el).attr('href');
          if (!href) return;
          
          if (href.startsWith('/shop/') || href.startsWith('https://aynirape.com/shop/')) {
            const urlObj = new URL(href.startsWith('http') ? href : `https://aynirape.com${href}`);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts.length === 3 && pathParts[0] === 'shop') {
              if (!productLinks.has(urlObj.href)) {
                productLinks.set(urlObj.href, cat.category || pathParts[1]);
                foundOnPage++;
              }
            }
          }
        });
        
        if (foundOnPage === 0 && page > 1) break;
      } catch (e) {
        // End of pages for this category
        break;
      }
    }
  }

  // Also scrape main shop pagination
  for (let page = 1; page <= 6; page++) {
    const pageUrl = page === 1 ? SHOP_URL : `${SHOP_URL}?page=${page}`;
    try {
      const { data: html } = await axios.get(pageUrl);
      const $ = cheerio.load(html);
      
      let foundOnPage = 0;
      $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        
        if (href.startsWith('/shop/') || href.startsWith('https://aynirape.com/shop/')) {
          const urlObj = new URL(href.startsWith('http') ? href : `https://aynirape.com${href}`);
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          if (pathParts.length === 3 && pathParts[0] === 'shop') {
            if (!productLinks.has(urlObj.href)) {
              productLinks.set(urlObj.href, pathParts[1]);
              foundOnPage++;
            }
          }
        }
      });
      if (foundOnPage === 0 && page > 1) break;
    } catch (e) {
      break;
    }
  }

  console.log(`Total unique product URLs discovered: ${productLinks.size}`);

  const products: ScrapedProduct[] = [];

  for (const [url, cat] of Array.from(productLinks.entries())) {
    console.log(`Scraping product: ${url} (${cat})`);
    try {
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);

      const title = $('h1').first().text().trim();
      if (!title) {
        console.warn(`No title found for ${url}`);
        continue;
      }

      const pathParts = new URL(url).pathname.split('/').filter(Boolean);
      const urlHandle = pathParts[pathParts.length - 1];
      const handle = urlHandle || slugify(title, { lower: true, strict: true });

      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      // Extract raw product text HTML
      const rawTextHtml = $('.product__text').html() || '';
      const cleanDescriptionHtml = cleanHtml(rawTextHtml);
      const { ingredients, keyCharacteristics, sections } = parseSections(cleanDescriptionHtml);

      // Clean text description
      const fullText = $('.product__text').text().trim().replace(/\s+/g, ' ');
      const shortDescription = metaDescription || fullText.slice(0, 200);

      // Extract price & variants
      let price = 14.95;
      const priceText = $('.price').first().text().trim() || $('meta[property="product:price:amount"]').attr('content') || '';
      const priceNum = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      if (!isNaN(priceNum) && priceNum > 0) {
        price = priceNum;
      }

      // Default variants structure
      let variants: { title: string; price: number; size: string }[] = [];
      if (cat === 'rape') {
        variants = [
          { title: '10g', price: price || 14.95, size: '10g' },
          { title: '20g', price: Math.round((price * 2) * 100) / 100 || 29.95, size: '20g' },
          { title: '50g', price: Math.round((price * 4) * 100) / 100 || 59.80, size: '50g' },
        ];
      } else {
        variants = [
          { title: 'Standard', price: price, size: 'Standard' }
        ];
      }

      // Extract images
      const imageUrls: string[] = [];
      $('.swiper-wrapper img, .product__swiper-image img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.includes('placeholder')) {
          const fullSrc = src.startsWith('http') ? src : `https://aynirape.com${src}`;
          if (!imageUrls.includes(fullSrc)) {
            imageUrls.push(fullSrc);
          }
        }
      });

      if (imageUrls.length === 0) {
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage && !ogImage.endsWith('og.jpg')) {
          imageUrls.push(ogImage);
        }
      }

      products.push({
        title,
        handle,
        category: cat,
        shortDescription,
        description: fullText || metaDescription,
        fullDescriptionHtml: cleanDescriptionHtml,
        ingredients,
        keyCharacteristics: keyCharacteristics.length > 0 ? keyCharacteristics : undefined,
        sections: sections.length > 0 ? sections : undefined,
        price,
        variants,
        originalUrl: url,
        images: imageUrls,
      });

      console.log(`✓ Scraped [${handle}] with ${cleanDescriptionHtml.length} chars of rich HTML, ${sections.length} sections, ${keyCharacteristics.length} characteristics`);
    } catch (e: any) {
      console.error(`Error scraping ${url}:`, e?.message || e);
    }
  }

  // Save to both locations
  await fs.writeJson(PRODUCTS_DATA_FILE, products, { spaces: 2 });
  await fs.writeJson(SCRIPTS_PRODUCTS_DATA_FILE, products, { spaces: 2 });

  console.log(`\nSuccessfully scraped and saved ${products.length} products to:`);
  console.log(`- ${PRODUCTS_DATA_FILE}`);
  console.log(`- ${SCRIPTS_PRODUCTS_DATA_FILE}`);
}

scrapeAllProducts().catch(console.error);
