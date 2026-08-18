import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';

async function testScrapeSingle() {
  const url = 'https://aynirape.com/shop/rape/nukini-sansara';
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);

  console.log('--- Page Title ---');
  console.log($('title').text());

  console.log('--- Headings ---');
  $('h1, h2, h3, h4, h5').each((_, el) => {
    console.log(`${el.tagName}: ${$(el).text().trim()}`);
  });

  console.log('--- .product__text HTML ---');
  const productText = $('.product__text');
  console.log('Count:', productText.length);
  productText.each((i, el) => {
    console.log(`\n=== product__text block ${i} ===`);
    console.log($(el).html());
  });
}

testScrapeSingle().catch(console.error);
