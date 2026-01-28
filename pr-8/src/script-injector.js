import { Transform } from "stream";

// create transform stream that injects websocket script before body
export const createScriptInjector = () => {
  let injected = false;

  return new Transform({
    transform(chunk, encoding, callback) {
      let data = chunk.toString();

      // find closing body tag and insert script before it
      if (!injected && data.includes("</body>")) {
        const script = `
                    <script>
                      const ws = new WebSocket('ws://localhost:8080');
                      ws.onmessage = (event) => {
                        if (event.data === 'reload') {
                          location.reload();
                        }
                      };
                      console.log('live reload connected');
                    </script>
`;
        data = data.replace("</body>", script + "</body>");
        injected = true;
      }

      callback(null, data);
    },
  });
};
