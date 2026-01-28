declare module 'express-status-monitor' {
  import { RequestHandler } from 'express';
  function statusMonitor(config?: any): RequestHandler;
  export = statusMonitor;
}
