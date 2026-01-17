// import socket from "./socket";

import socket from "./Socket";

const joinedLocations = new Set();

export const SocketManager = {
    connect() {
        if (!socket.connected) {
            socket.connect();
        }
    },

    disconnect() {
        joinedLocations.clear();
        if (socket.connected) {
            socket.disconnect();
        }
    },

    joinLocation(locationId) {
        if (!locationId) return;
        if (joinedLocations.has(locationId)) return;

        socket.emit("joinLocation", locationId);
        joinedLocations.add(locationId);
    },

    on(event, handler) {
        socket.on(event, handler);
    },

    off(event, handler) {
        socket.off(event, handler);
    },
};
