// app.cjs

const PORT = 80;
const http = require('node:http');
const fsp = require('node:fs').promises;
const url = require('node:url');
const querystring = require('node:querystring');
const path = require('node:path');
const ContentTypes = require('./content_types.cjs');


const requestListener = (req, res) => {
	const inURL = url.parse(req.url);
	switch(inURL.pathname){
		case '/':
			console.log(querystring.parse(inURL.query));
			fsp.readFile(`${__dirname}/index.html`)
				.then(contents => {
					res.setHeader('Content-Type', 'text/html');
					res.setHeader('Cache-Control', 'no-store, max-age=0');
					res.writeHead(200);
					res.end(contents);
				});
			break;
		default:
			console.log('url:', req.url);
			{
				let filePath = '.' + req.url;
				let extname = path.extname(filePath);
				let contentType = ContentTypes[extname] || 'text/html';

				res.setHeader('Content-Type', contentType);

				fsp.readFile(filePath)
					.then(contents => {
						res.writeHead(200);
						res.end(contents);
					}, err => {
						res.writeHead(404);
						res.end();
					});
			}
	}
}


const server = http.createServer(requestListener);

server.on('error', err => {
	console.log('error:', err);
});

server.listen(PORT); console.log('Listening on port', PORT);
