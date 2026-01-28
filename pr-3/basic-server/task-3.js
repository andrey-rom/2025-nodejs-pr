const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = 3000;

const STATUS_CODES = {
	OK: 200,
	NOT_FOUND: 404,
	INTERNAL_SERVER_ERROR: 500,
};

const CONTENT_TYPES = {
	HTML: 'text/html',
};


const getCvHtml = async () => {
    const folder = 'files/task-3';
    const fileName = 'cv.html';
    const cvPath = path.join(__dirname, folder, fileName);
    return await fs.readFile(cvPath, 'utf-8');
};

const server = http.createServer(async (req, res) => {
	if (req.url === '/' && req.method === 'GET') {
		try {
			const html = await getCvHtml();
			res.statusCode = STATUS_CODES.OK;
			res.setHeader('Content-Type', CONTENT_TYPES.HTML);
			res.end(html);
		} catch (err) {
			res.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
			res.setHeader('Content-Type', CONTENT_TYPES.HTML);
			res.end(`<h1>Server Error: ${err.message}</h1>`);
		}
	} else {
		res.statusCode = STATUS_CODES.NOT_FOUND;
		res.setHeader('Content-Type', CONTENT_TYPES.HTML);
		res.end('<h1>Not Found</h1>');
	}
});

server.listen(PORT, () => {
	console.log(`Server is running! http://localhost:${PORT}`);
});