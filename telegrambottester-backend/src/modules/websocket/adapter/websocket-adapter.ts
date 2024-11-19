import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';

export class WebsocketAdapter extends IoAdapter {
    
    constructor(
        private readonly app: INestApplication,
        private readonly origin: string[],
    ) {
        super(app);
    }

    createIOServer(port: number, options?: ServerOptions) {
        const socketOptions: Partial<ServerOptions> = { 
            path: "/socket.io/",
            cors: {
              origin: this.origin && this.origin.length > 0 ? this.origin : '*', 
              methods: ["GET", "POST"],
              credentials: true
            },
            allowEIO3: true,
        };

        const io = new Server(this.app.getHttpServer(), socketOptions);
        return io;
    }
}