// index.js
// Sergio Flores - sergio@saft.industries
// Reads web addresses from arguments and saves the html and images to file, along with some metadata
import * as url from "url";
import fetch from "node-fetch";

async function main() {
	const version = process.env.npm_package_version;
	console.log(`Simple web Scraper ${version} starting...`);

	// Read addresses
	if (process.argv.length < 3) {
		console.log("Error: Please supply at least 1 website address.");
	}

	for (let i = 2; i < process.argv.length; i++) { // first 2 elements are not relevant (node & index.js)

		if (!stringIsAValidUrl(process.argv[i])) {
			console.log(`Warn: Supplied address ${process.argv[i]} is not a valid URL. Skipping.`);
			continue;
		}

		// Download files
		await downloadFiles(process.argv[i]);
 
	} 
 
	console.log('Success');
}

async function downloadFiles(website) {
	const response = await fetch(website);
	const body = await response.text();
	console.log(body); // prints a chock full of HTML richness
	return body;
}

// Basic validation for provided URL's. Note: Very basic, a more detailed validation should be used in production
function stringIsAValidUrl(s) {
    try {
		new url.URL(s);
		return true;
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
