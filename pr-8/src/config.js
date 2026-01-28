import path from "path";
import { fileURLToPath } from "url";

// get current directory in es modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server configuration
const config = {
  httpPort: 3000,
  wsPort: 8080,
  targetDir: path.join(__dirname, "..", "target"),
};

export default config;
