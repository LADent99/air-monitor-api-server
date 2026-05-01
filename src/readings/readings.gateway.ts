import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Client } from 'pg';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class ReadingsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ReadingsGateway.name);
  private pgListener: Client;

  afterInit() {
    this.pgListener = new Client({ connectionString: process.env.DATABASE_URL });
    this.pgListener.connect().then(() => {
      this.pgListener.query('LISTEN new_reading');
      this.pgListener.on('notification', (msg) => {
        if (msg.channel === 'new_reading' && msg.payload) {
          this.server.emit('reading', JSON.parse(msg.payload));
        }
      });
      this.logger.log('LISTEN new_reading active');
    });
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }
}
