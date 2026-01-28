import { createHttpServer } from "./src/http-server.js";
import { createWsServer, notifyClients } from "./src/websocket-server.js";
import { watchDirectory } from "./src/file-watcher.js";
import config from "./src/config.js";

// start http server
createHttpServer(config.httpPort, config.targetDir);

// start websocket server
createWsServer(config.wsPort);

// watch target directory for changes
watchDirectory(config.targetDir, (filename) => {
  // notify all connected clients when file changes
  notifyClients();
});
