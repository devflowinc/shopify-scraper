#!/usr/bin/env bun

import { Command } from "commander";
const program = new Command();

program
  .requiredOption("-u, --url <url>", "URL to scrape")
  .requiredOption("-o, --output <output>", "Output file")
  .parse(process.argv);

const options = program.opts();

const products = [];
let curPage = 1;

do {
  console.clear();
  console.log(`Scraping page ${curPage}`);

  const response = await fetch(`${options.url}/products.json?page=${curPage}`);
  const data = await response.json();
  products.push(...data.products);
  curPage++;
  if (data.products.length === 0) {
    curPage = -1;
  }
} while (curPage !== -1);

console.clear();
console.info(`Writing to ${options.output}`);

await Bun.write(options.output, JSON.stringify(products, null, 2));
