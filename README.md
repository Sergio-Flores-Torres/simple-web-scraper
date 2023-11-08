# simple-web-scraper
A simple web scraper with Node &amp; Cheerio, using Docker

### Notes
Uses javascript.
App will create a subfolder called "downloads" in the current installation directory, to save web pages and images, each on its own subfolder named as the domain of the website in question.
The retrieved page is assumed to be HTML, and an index.html will be created for its content.
Arbitrarily limited to 100 websites, since for safety reasons there should always be limits to everything.


