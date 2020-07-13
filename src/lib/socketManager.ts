"use strict";

const redisAdapter = require("socket.io-redis");

import * as config from "@config/index";
import * as contactSync from "@utils/socket/contactSync";
import * as notification from "@utils/socket/notification";
import { socketLib } from "@utils/socket/socketLib";
import { redisStorage } from "@lib/redis/RedisStorage";
import * as tokenManager from "@lib/tokenManager";

let io = null;

const connections = [];

export const connectSocket = async function (server) {
	io = require("socket.io").listen(server.listener);
	io.adapter(redisAdapter({ host: config.SERVER.SOCKET.HOST, port: config.SERVER.SOCKET.PORT }));

	/**
	 * @description established connection event
	 */
	io.on(config.CONSTANT.SOCKET.DEFAULT.CONNECTION, async function (socket) {
		try {
			console.log("connection established");
			connections.push(socket);
			console.log(" %s sockets is connected", connections.length);
			console.log("socket.id", socket.id);
			// console.log(socket.handshake);
			// console.log(socket.rooms);
			const authorization = socket.handshake.query.authorization;
			if (authorization) {
				const response = await tokenManager.verifySocketToken(socket, authorization);
				socket.user = response;
				// console.log("socket.user", socket.user);
				if (socket.user) {
					socketConnections(io, socket);
					socketDisconnections(io, socket);
					contactSyncing(socket);
					notificationListeners(io, socket);
				}
			} else {
				socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.SOCKET.ERROR.AUTHORIZATION);
			}
		} catch (error) {
			throw error;
		}
	});
};

async function socketConnections(io, socket) {
	socket.emit(config.CONSTANT.SOCKET.DEFAULT.CONNECTED, config.CONSTANT.SOCKET.SUCCESS.CONNECTION_ESTABLISHED);
	const userId = socket.user.userId;
	const socketId = socket.id;
	console.log(userId + " user has this socket id " + socketId);
	if (config.SERVER.SOCKET_TYPE === config.CONSTANT.SOCKET.TYPE.CONTACT_SYNCING) {
		await executer("socketLib", "closeOldConnects", [userId]);
		await redisStorage.insertKeyInRedis(userId, socketId);
	}
	if (config.SERVER.SOCKET_TYPE === config.CONSTANT.SOCKET.TYPE.BELL_COUNT) {
		socket.join(userId);
		console.log(io.sockets.adapter.rooms);
	}
}

/**
 * @function socketDisconnections
 * @description On connection break Event
 */
function socketDisconnections(io, socket) {
	socket.on(config.CONSTANT.SOCKET.DEFAULT.DISCONNECT, function () {
		const userId = socket.user._id;
		const socketId = "";
		console.log("connection disconnected", socket.user._id, socket.id);
		connections.splice(connections.indexOf(socket), 1);
		console.log(" %s socket connection(s) remaining after disconnect", connections.length);
		switch (config.SERVER.SOCKET_TYPE) {
			case config.CONSTANT.SOCKET.TYPE.CONTACT_SYNCING:
				redisStorage.insertKeyInRedis(userId, socketId);
			case config.CONSTANT.SOCKET.TYPE.BELL_COUNT:
				socket.leave(userId);
				console.log(io.sockets.adapter.rooms);
		}
	});
}

/**
 * @function contactSyncing
 * @description Contact syncing
 */
function contactSyncing(socket) {
	contactSync.contactSyncListeners(socket);
}

/**
 * @function notification
 * @description notification listeners
 */
function notificationListeners(io, socket) {
	notification.notificationListeners(io, socket);
}

const socketManager = {
	socketLib: socketLib
};

export const executer = async (type, func, params) => {
	return await new Promise(async (resolve, reject) => {
		try {
			if ((io == null || io === undefined)) {
				resolve(false);
			} else {
				await socketManager[type][func](io, ...params);
				resolve(true);
			}
		} catch (error) {
			reject(false);
		}
	});
};