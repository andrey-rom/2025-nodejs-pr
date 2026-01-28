const http = require('http');

const PORT = 3000;

const STATUS_CODES = {
	OK: 200,
	NOT_FOUND: 404,
};

const CONTENT_TYPES = {
	HTML: 'text/html',
};

const server = http.createServer((req, res) => {
	if (req.url === '/' && req.method === 'GET') {
		res.statusCode = STATUS_CODES.OK;
		res.setHeader('Content-Type', CONTENT_TYPES.HTML);
		res.end('<h1>Hello World</h1>');
	} else {
		res.statusCode = STATUS_CODES.NOT_FOUND;
		res.setHeader('Content-Type', CONTENT_TYPES.HTML);
		res.end('<h1>Not Found</h1>');
	}
});

server.listen(PORT, () => {
	console.log(`Server is running! http://localhost:${PORT}`);
});