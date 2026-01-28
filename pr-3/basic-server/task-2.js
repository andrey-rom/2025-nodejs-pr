const http = require('http');

const PORT = 3000;

const STATUS_CODES = {
	OK: 200,
	NOT_FOUND: 404,
};

const CONTENT_TYPES = {
	HTML: 'text/html',
};

const createHtml = (req) => {
	let headersText = '';
	for (const key in req.headers) {
		headersText += `<div><b>${key}</b>: ${req.headers[key]}</div>`;
	}
	const template = `<!DOCTYPE html>
<html>
  <body>
    <p>--------------------------------</p>
    <div>Method ${req.method}</div>
    <div>URL ${req.url}</div>
    <div>HTTP Version ${req.httpVersion}</div>
    <p>--------------------------------</p>
    <div>Headers</div>
    <p>   </p>
    <div>${headersText}</div>
  </body>
</html>`;

	return template;
};

const server = http.createServer(async (req, res) => {
	if (req.url === '/' && req.method === 'GET') {
		res.statusCode = STATUS_CODES.OK;
		res.setHeader('Content-Type', CONTENT_TYPES.HTML);
		const html = createHtml(req);
		res.end(html);
	}
	else {
		res.statusCode = STATUS_CODES.NOT_FOUND;
		res.setHeader('Content-Type', CONTENT_TYPES.HTML);
		res.end('<h1>Not Found</h1>');
	}
});

server.listen(PORT, () => {
	console.log(`Server is running! http://localhost:${PORT}`);
});