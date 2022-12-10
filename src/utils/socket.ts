import { SOCKET_URL } from "./constants";

export default class SocketServer {

    private static socket: WebSocket;
    private static listeners: Record<string, (data: Record<string, any>) => void> = {};
    static connected = false;

    static async init() {
        await new Promise<void>((resolve, reject) => {
            SocketServer.socket = new WebSocket(SOCKET_URL);

            SocketServer.socket.onopen = () => {
                SocketServer.connected = true;
                this.handleEmitQueue();
                resolve();
            }

            SocketServer.socket.onclose = () => {
                SocketServer.connected = false;
                
                // Reconnect
                setTimeout(() => {
                    SocketServer.init();
                }, 1000);
            }

            SocketServer.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (SocketServer.listeners[data.event]) {
                    SocketServer.listeners[data.event](
                        data.data
                    );
                } else {
                    console.log("unhandled event", data.event, data.data);
                }
            }

        })
    }

    public static on(event: string, callback: (data: any) => void) {
        SocketServer.listeners[event] = callback;
    }

    static emitQueue: Record<string, any>[] = [];

    static async handleEmitQueue() {
        if (SocketServer.socket.readyState === WebSocket.OPEN) {
            SocketServer.emitQueue.forEach((data) => {
                SocketServer.socket.send(JSON.stringify(data));
            });
            SocketServer.emitQueue = [];
        }
    }

    public static emit(event: string, data: any) {
        if (SocketServer.socket.readyState === WebSocket.OPEN) {
            SocketServer.socket.send(JSON.stringify({
                event,
                data
            }));
        } else {
            SocketServer.emitQueue.push({
                event,
                data
            });
        }
    }

}