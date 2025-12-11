const os = require('os');


class Logger {
  static #instance = null;
  #isVerboseModeEnabled = false;
  #isQuietModeEnabled = false;

  constructor(verbose = false, quiet = false) {
    this.#isVerboseModeEnabled = verbose;
    this.#isQuietModeEnabled = quiet;
    Logger.#instance = this;
  }

  static getLogger(verbose = false, quiet = false) {
    if (!this.#instance) {
      this.#instance = new Logger(verbose, quiet);
    }
    return this.#instance;
  }

  log(...data) {
    if (this.#isQuietModeEnabled) {
      return;
    }

    // Print main message first for readability.
    console.log(...data);

    if (this.#isVerboseModeEnabled) {
      const systemInfo = {
        timestamp: new Date().toISOString(),
        platform: os.platform(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpuModel: os.cpus()[0].model,
      };
      console.log('[VERBOSE SYSTEM INFO]', systemInfo);
    }
  }
}

function getLogger(verbose = false, quiet = false) {
  return Logger.getLogger(verbose, quiet);
}

module.exports = { getLogger };
