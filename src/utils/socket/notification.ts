"use strict";

import * as config from "@config/constant";

export const notificationListeners = async function (io, socket) {
	/**
	 * @description send notification unread count
	 */
	socket.on(config.CONSTANT.SOCKET.EVENT.BELL_COUNT, function (data) {
		console.log(io.sockets.adapter.rooms);
		console.log(config.CONSTANT.SOCKET.EVENT.BELL_COUNT + "====================>", JSON.stringify(data));
		bellCount(io, socket, data);
	});
};

/**
 * @function bellCount
 * @author Rajat Maheshwari
 * @params {data: userId}
 */
const bellCount = async (io, socket, data) => {
	try {
		io.in(data.userId).emit(config.CONSTANT.SOCKET.EVENT.BELL_COUNT, { "notificationCount": 1 }); // including me
		// socket.to(data.userId).emit(config.CONSTANT.SOCKET.EVENT.BELL_COUNT, { "notificationCount": 1 }); // excluding me
	} catch (error) {
		socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.SOCKET.ERROR.SOCKET);
	}
};