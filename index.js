// index.js
// Sergio Flores - sergio@saft.industries
// Reads web addresses from arguments and saves the html and images to file, along with some metadata
import URL from "url";
import fetch from "node-fetch";
import fs from "fs";

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
		console.log(`Status: Saving website ${website} to folder ${dirName}`); 

		if (!fs.existsSync(dirName)) {
			fs.mkdirSync(dirName);
		}

		const fileName = dirName + "/index.html";
		console.log(fileName)
		fs.writeFileSync(fileName, body);
		

	} catch (err) {
		console.log(`Error: Could not download website ${website}`); 
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
