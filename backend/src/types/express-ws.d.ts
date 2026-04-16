declare module 'express-ws' {
  import express from 'express';
  import * as ws from 'ws';

  interface WebSocketApp extends express.Application {
    ws(route: string, callback: (ws: ws, req: express.Request) => void): void;
  }

  function expressWs(
    app: express.Application,
    server?: unknown,
    options?: unknown
  ): {
    app: WebSocketApp;
    getWss: () => ws.Server;
    applyTo: (target: express.Router) => void;
  };

  export = expressWs;
}

declare module 'smartapi-javascript';
declare module 'speakeasy';
