// index.js
// Sergio Flores - sergio@saft.industries
// Reads web addresses from arguments and saves the html and images to file, along with some metadata

async function main() {
	const version = process.env.npm_package_version;
	console.log(`Simple web Scraper ${version} starting...`);

	// Read addresses
	if (process.argv.length < 3) {
		console.log("Error: Please supply at least 1 website address.");
	}

  
	// Establish connection to the cluster
	//await establishConnection();
  
	console.log('Success');
}
  
if (require.main === module) {
	main().then(
		() => process.exit(),
		err => {
		  console.error(err);
		  process.exit(-1);
		},
	);
}