import http from "http";
import fs from "fs";
import path from "path";
import { createScriptInjector } from "./script-injector.js";

// handle incoming http requests
const handleRequest = (req, res, targetDir) => {
  // remove slash and build file path
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(targetDir, filePath);

  // check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      console.error("file not found");
      res.end("file not found");
      return;
    }

    // determine mime type
    const ext = path.extname(filePath);
    let contentType = "text/plain";

    if (ext === ".html") contentType = "text/html";
    else if (ext === ".css") contentType = "text/css";
    else if (ext === ".js") contentType = "text/javascript";

    res.writeHead(200, { "Content-Type": contentType });

    // create readable stream
    const readStream = fs.createReadStream(filePath);

    // handle stream errors and server doesnt crash
    readStream.on("error", (streamErr) => {
      console.error("error reading file:", streamErr);

      // avoid sending headers if they were already sent
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        console.error("error reading file");
        res.end("error reading file");
      } else {
        // if headers already sent just terminate the response
        res.end();
      }
    });

    // for html files inject script with websocket connection
    if (ext === ".html") {
      readStream.pipe(createScriptInjector()).pipe(res);
    } else {
      // for other files just pipe directly
      readStream.pipe(res);
    }
  });
};

// create and start http server
export const createHttpServer = (port, targetDir, onReady) => {
  const server = http.createServer((req, res) => {
    handleRequest(req, res, targetDir);
  });

  server.listen(port, () => {
    console.log(`http server running on http://localhost:${port}`);
    console.log(`watching directory: ${targetDir}`);
    if (onReady) onReady();
  });

  return server;
};
