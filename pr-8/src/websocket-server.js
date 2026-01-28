import { WebSocketServer } from "ws";

// store all connected clients
const clients = new Set();

// create websocket server
export const createWsServer = (port, onReady) => {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("new client connected!!!!");

    ws.on("close", () => {
      clients.delete(ws);
      console.log("client disconnected!!");
    });
  });

  wss.on("listening", () => {
    console.log(`websocket server on ws://localhost:${port}`);
    if (onReady) onReady();
  });

  return wss;
};

// notify all connected clients to reload
export const notifyClients = () => {
  clients.forEach((client) => {
    // 1 = OPEN
    if (client.readyState === 1) {
      client.send("reload");
    }
  });
};
