#!/usr/bin/env bun

import { Command } from "commander";
import { scrape } from "./src/scrape";
import { uploadToTrieve } from "./src/upload";
const program = new Command();

program
  .name("@trieve/shopify-scraper")
  .description("CLI to  that scapes shopify and uploads to trieve")
  .version("0.8.0");

program
  .command("scrape")
  .requiredOption("-u, --url <url>", "URL to scrape")
  .requiredOption("-o, --output <output>", "Output file")
  .action(scrape);

program
  .command("upload")
  .requiredOption("-f, --file <file path>", "JSON file to upload to trieve")
  .requiredOption("-a, --api_key <key>", "Your API key")
  .requiredOption("-d, --dataset <key>", "The dataset ID")
  .option("-u, --url <url>", "Trieve URL to send chunks to", "https://api.trieve.ai")
  .action(uploadToTrieve);

program.parse();
