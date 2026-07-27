import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import slugify from 'slugify';
import TurndownService from 'turndown';

const turndownService = new TurndownService();

const BLOG_URL = 'https://aynirape.com/blog';
const POSTS_DIR = path.resolve(__dirname, '../apps/storefront/src/content/posts');
const IMAGES_DIR = path.resolve(__dirname, '../apps/storefront/public/images/blog');

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
          resolve(`/images/blog/${filename}`);
        }
      });
    });
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return '';
  }
}

async function scrapeBlogs() {
  console.log('Scraping blogs...');
  await fs.ensureDir(POSTS_DIR);
  
  const { data: html } = await axios.get(BLOG_URL);
  const $ = cheerio.load(html);
  
  // Create a map of URL -> Cover Image
  const postInfo: Record<string, string> = {};
  
  $('.blog__item').each((_, el) => {
    let href = $(el).find('.item__title').attr('href');
    let imgSrc = $(el).find('.item__preview img').attr('src');
    
    if (href) {
      const fullUrl = href.startsWith('http') ? href : `https://aynirape.com${href}`;
      if (imgSrc) {
         postInfo[fullUrl] = imgSrc.startsWith('http') ? imgSrc : `https://aynirape.com${imgSrc}`;
      } else {
         postInfo[fullUrl] = '';
      }
    }
  });

  const postLinks = Object.keys(postInfo);
  console.log(`Found ${postLinks.length} posts.`);

  for (const link of postLinks) {
    console.log(`Scraping post: ${link}`);
    try {
      const { data: postHtml } = await axios.get(link);
      const $$ = cheerio.load(postHtml);
      
      const title = $$('h1').first().text().trim() || 'Untitled';
      const slug = slugify(title, { lower: true, strict: true });
      
      let coverImage = '';
      const actualCoverSrc = postInfo[link];
      
      if (actualCoverSrc) {
        const ext = path.extname(new URL(actualCoverSrc).pathname) || '.webp';
        const filename = `${slug}-cover${ext}`;
        coverImage = await downloadImage(actualCoverSrc, filename);
      } else {
        // Fallback
        const ogImage = $$('meta[property="og:image"]').attr('content');
        if (ogImage && !ogImage.endsWith('og.jpg')) {
          const ext = path.extname(new URL(ogImage).pathname) || '.jpg';
          const filename = `${slug}-cover${ext}`;
          coverImage = await downloadImage(ogImage, filename);
        }
      }

      const contentHtml = $$('article').html() || $$('.post-content').html() || $$('main').html() || '';
      const content = turndownService.turndown(contentHtml);

      const mdocContent = `---
title: "${title.replace(/"/g, '\\"')}"
language: "en"
translationKey: "${slug}"
excerpt: "${$$('meta[name="description"]').attr('content')?.replace(/"/g, '\\"') || ''}"
publishedDate: "${new Date().toISOString().split('T')[0]}"
draft: false
category: "Rituals"
author: "Ayni Team"
authorSlug: "ayni-team"
${coverImage ? `coverImage: "${coverImage}"` : ''}
---

${content}
`;

      const mdocPath = path.join(POSTS_DIR, `${slug}.mdoc`);
      await fs.writeFile(mdocPath, mdocContent);
      console.log(`Saved ${slug}.mdoc`);
    } catch (e) {
      console.error(`Failed to scrape ${link}`, e);
    }
  }
}

scrapeBlogs().then(() => console.log('Done'));
