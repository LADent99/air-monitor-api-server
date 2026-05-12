import { Logger, OnModuleDestroy } from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Client } from "pg";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class ReadingsGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ReadingsGateway.name);
  private pgListener!: Client;
  private connectPromise: Promise<void> | null = null;

  afterInit() {
    this.pgListener = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    this.pgListener.on("error", (err) => {
      this.logger.error(`pg listener error: ${err.message}`);
    });
    this.connectPromise = this.pgListener
      .connect()
      .then(() => this.pgListener.query("LISTEN new_reading"))
      .then(() => {
        this.pgListener.on("notification", (msg) => {
          if (msg.channel === "new_reading" && msg.payload) {
            this.server.emit("reading", JSON.parse(msg.payload));
          }
        });
        this.logger.log("LISTEN new_reading active");
      });
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  async onModuleDestroy() {
    try {
      await this.connectPromise;
    } catch {
      /* empty */
    }
    await this.pgListener?.end();
  }
}
