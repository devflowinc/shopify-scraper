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
  products.push(
    ...data.products.map((product) => {
      const images = product.images.map((image) => image.src);

      return {
        tracking_id: product.id,
        image_urls: images,
        tag_set: product.tags,
        chunk_html: `<h1>${product.title}</h1>${product.body_html}
      ${
        // all products have at least one variant
        product.variants.length > 1
          ? `<p>Product variants:</p><ul>${product.variants.map(
              (variant) =>
                `<li><h2>Variant name ${variant.title}</h2><p>Price ${variant.price}</p></li>`
            )}</ul>`
          : `<p>Price ${product.variants[0].price}</p>`
      }
      `,
        metadata: product,
        link: options.url + "products/" + product.handle,
      };
    })
  );
  curPage++;
  if (data.products.length === 0) {
    curPage = -1;
  }
} while (curPage !== -1);

console.clear();
console.info(`Writing to ${options.output}`);

await Bun.write(options.output, JSON.stringify(products, null, 2));
