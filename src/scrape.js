import { omit } from "lodash-es";

export const scrape = async (options) => {
  const products = [];
  let curPage = 1;

  do {
    console.clear();
    console.log(`Scraping page ${curPage}`);

    const response = await fetch(
      `${options.url}/products.json?page=${curPage}`
    );
    const data = await response.json();
    const productsAndVariantsDivided = data.products.reduce((acc, curr) => {
      if (curr.variants.length === 1) {
        acc.push({ ...curr, price: curr.variants[0].price });
        return acc;
      }

      acc.push(
        ...curr.variants.map((variant) => ({
          ...curr,
          ...variant,
          id: variant.product_id || curr.id,
          title: `${curr.title} ${variant.title}`,
          variant_id: variant.id,
        }))
      );

      return acc;
    }, []);
    products.push(
      ...productsAndVariantsDivided.map((product) => {
        const images = [
          product?.featured_image?.src,
          ...product.images.map((image) => image.src),
        ].filter((exists) => exists);

        return {
          tracking_id: product.id.toString(),
          image_urls: images,
          tag_set: product.tags,
          chunk_html: `<h1>${product.title}</h1>${product.body_html}`,
          metadata:
            product.variants.length > 1 ? product : omit(product, "variants"),
          link: `${options.url}/products/${product.handle}${
            product.variant_id ? `?variant=${product.variant_id}` : ""
          }`,
          num_value: parseFloat(product.price),
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
};
