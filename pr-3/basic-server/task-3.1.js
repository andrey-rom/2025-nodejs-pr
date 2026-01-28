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
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.ico': 'image/x-icon',
};

const STATIC_FOLDER = path.join(__dirname, 'files', 'task-3.1');

const getContentType = (filePath) => {
	const ext = path.extname(filePath);
	if (CONTENT_TYPES[ext]) return CONTENT_TYPES[ext];
	return 'application/octet-stream';
};

const getStaticFile = async (fileName) => {
	const filePath = path.join(STATIC_FOLDER, fileName);
	return await fs.readFile(filePath);
};

const server = http.createServer(async (req, res) => {
	if (req.method === 'GET') {
		try {
			const urlPath = req.url.split('?')[0];
            
			let fileName;
			if (urlPath === '/' || urlPath === '/cv.html' || urlPath === '/index.html') {
				fileName = 'cv.html';
			} else {
				fileName = urlPath.slice(1);
			}

			const data = await getStaticFile(fileName);

			res.statusCode = STATUS_CODES.OK;
			res.setHeader('Content-Type', getContentType(fileName));
			res.end(data);
		} catch (err) {
			res.statusCode = STATUS_CODES.NOT_FOUND;
			res.setHeader('Content-Type', CONTENT_TYPES['.html']);
			res.end('<h1>File Not Found</h1>');
		}
	} else {
		// If the request method is not GET, respond 404
		res.statusCode = STATUS_CODES.NOT_FOUND;
		res.setHeader('Content-Type', CONTENT_TYPES['.html']);
		res.end('<h1>Request method is not GET</h1>');
	}
});

server.listen(PORT, () => {
	console.log(`Server is running! http://localhost:${PORT}`);
});