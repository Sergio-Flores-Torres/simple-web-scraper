// index.js
// Sergio Flores - sergio@saft.industries
// Reads web addresses from arguments and saves the html and images to file, along with some metadata

import URL from "url";
import fetch from "node-fetch";
import fs from "fs";
import { load } from "cheerio";
import {Buffer} from "buffer"; 

async function main() {
	const version = process.env.npm_package_version;
	console.log(`Simple web Scraper ${version} starting...`);

	// Read addresses
	// TODO: Check for a maximum number of addresses based on processing capacity, and make it configurable.
	if ((process.argv.length < 3) | (process.argv.length > 100)) { // Arbitrary number for safety.
		console.log("Error: Please supply at least 1 website address and no more than 100.");
	}

	const websites = process.argv.splice(2); // first 2 elements in the command line arguments are not relevant (node & index.js)

	// Launch in parallel and have the program wait till all requests return.
	await Promise.all(websites.map(async (website) => {
		// Basic validation on URL and checking only http and https are used.
		if (!stringIsAValidUrl(website, ["http", "https"])) {
			console.log(`Warning: Supplied address "${website}" is not a valid URL or uses an unsupported protocol. Skipping.`);
			return;
		}

		// Download files
		await downloadFiles(website);
	}));

	console.log('Success');
}

async function downloadFiles(website) {
	console.log(`Status: Downloading website ${website}...`); 

	try {
		const response = await fetch(website);
		const body = await response.text();

		const url = new URL.URL(website);	
		const dirName = process.cwd() + "/downloads/" + url.hostname;
		console.log(`Status: Saving website ${website} to folder ${dirName}.`); 

		if (!fs.existsSync(dirName)) {
			fs.mkdirSync(dirName);
		}

		const fileName = dirName + "/index.html";
		fs.writeFileSync(fileName, body);

		console.log(`OK: Downloaded website ${website}`); 

		await extractMetadata(website, dirName, body);
		await downloadAssets(website, dirName, body);
		
	} catch (err) {
		console.log(`Error: Could not download website ${website}.`); 
		console.log(err); 
	}
}

async function extractMetadata(website, dirName, body) {
	console.log(`Status: Saving metadata for website ${website}...`); 

	try {
		const dt = new Date(); // Last fetch
		let metadata = website + "\n";
		metadata += "Last fetch: " + dt.toLocaleDateString() + "\n";

		// Load the HTML in Cheerio
		const $ = load(body);
			
		// Select all anchor tags from the page
		const links = $("a");
		metadata += "Number of Links: " + links.length + "\n";

		// Select all images from the page
		const images = $("img");
		metadata += "Number of Images: " + images.length + "\n";

		const fileName = dirName + "/metadata.txt";
		fs.writeFileSync(fileName, metadata);

		console.log(`OK: Metadata ready for website ${website} and saved to ${fileName}.`); 
		console.log(metadata); 
		
	} catch (err) {
		console.log(`Error: Could not extract or save metadata for website ${website}.`); 
		console.log(err); 
	}
}

async function downloadAssets(website, dirName, body) {
	console.log(`Status: Downloading assets for offline viewing for website ${website}...`); 

	try {
		// Load the HTML in Cheerio
		const $ = load(body);

		console.log(`Status: Downloading IMG for offline viewing for website ${website}...`); 

		// Select all images from the page
		const images = $("img");
		for (let i = 0; i < images.length; i++) {
			const path = $(images[i]).attr().src;
			console.log(path)
			if (path == undefined) continue;

			// Save only if relative path used, otherwise the html links to a hardcoded web address and we'd have to modify the HTML to make it work.
			if (path.substring(0, 4) != "http") 
				downloader(website, path, dirName);
		}

		console.log(`Status: Downloading LINK for offline viewing for website ${website}...`); 

		// Select all stylesheets and fonts from the page
		const links = $("link");
		for (let i = 0; i < links.length; i++) {
			const path = $(links[i]).attr().href;
			console.log(path)
			if (path == undefined) continue;

			// Save only if relative path used, otherwise the html links to a hardcoded web address and we'd have to modify the HTML to make it work.
			if (path.substring(0, 4) != "http") 
				downloader(website, path, dirName);
		}

		console.log(`Status: Downloading SCRIPT for offline viewing for website ${website}...`); 

		// Select all stylesheets and fonts from the page
		const scripts = $("script");
		for (let i = 0; i < scripts.length; i++) {
			const path = $(scripts[i]).attr().src;
			console.log(path)
			if (path == undefined) continue;

			// Save only if relative path used, otherwise the html links to a hardcoded web address and we'd have to modify the HTML to make it work.
			if (path.substring(0, 4) != "http")
				downloader(website, path, dirName);
		}

		console.log(`OK: Assets complete for website ${website} and saved to ${dirName}.`); 
		
	} catch (err) {
		console.log(`Error: Could not download assets for website ${website}.`); 
		console.log(err); 
	}
}

async function downloader(website, path, dirName) {
	try {
		const fullImagePath = URL.resolve(website, path);
		let response = await fetch(fullImagePath);
		let buffer = await response.arrayBuffer();
		buffer = Buffer.from(buffer);

		// Create local folder structure as needed by the assets
		let folder = path.substring(0, path.lastIndexOf('/'));
		if (!fs.existsSync(dirName + "/" + folder)) {
			fs.mkdirSync(dirName + "/" + folder, {recursive: true});
		}

		fs.createWriteStream(dirName + "/" + path).write(buffer);
	} catch (err) {
		console.log(`Error: Could not download assets for website ${website}.`); 
		console.log(err); 
	}
}

// Basic validation for provided URL's. Note: Very basic, a more detailed validation should be used in production
function stringIsAValidUrl(s, protocols) {
    try {
        const url = new URL.URL(s);
        return protocols
            ? url.protocol
                ? protocols.map(x => `${x.toLowerCase()}:`).includes(url.protocol)
                : false
            : true;
    } catch (err) {
        return false;
    }
};

main().then(
	() => process.exit(),
	err => {
		console.error(err);
		process.exit(-1);
	},
);
