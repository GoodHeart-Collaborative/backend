"use strict";

import * as util from "util";

import * as config from "@config/constant";
import { redisStorage } from "@lib/redis/RedisStorage";

/**
 * @function closeOldConnects
 * @description Close all old connects
 */
const closeOldConnects = async function (io, userId) {
	const socketId = await redisStorage.getKeyFromRedis(userId);
	if (socketId && socketId !== "") {
		console.log("closeOldConnects==================>", userId, socketId);
		setTimeout(function () {
			io.to(socketId).emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.SOCKET.ERROR.AUTHORIZATION);
		}, 1000);
		await remoteDisconnect(io, socketId);
	}
	return;
};

/**
 * @function remoteDisconnect
 * @description remotely disconnect from socket
 */
const remoteDisconnect = async (io, socketId) => {
	return new Promise((resolve, reject) => {
		try {
			io.of("/").adapter.remoteDisconnect(socketId, true);
			resolve();
		} catch (error) {
			console.log(error);
			resolve();
		}
	});
};

/**
 * @function waitingJoin
 * @description wait function for clients joining a room
 */
const waitingJoin = async (io, socket, data) => {
	const promise = util.promisify(socket.join).bind(socket);
	return await promise(data);
};

/**
 * @function remoteJoinRoom
 * @description globally joining a room from anywher using socket-redis-adapter
 */
const remoteJoinRoom = async (io, userId, room) => {
	const socketId = await redisStorage.getKeyFromRedis(userId);
	const joinApp = await joinRoomPromise(io, socketId, room);
	console.log(socketId + " with userId " + userId + " has remotely joined in this room via app " + room);
	return;
};

/**
 * @function joinRoomPromise
 * @description remotely join a room
 */
const joinRoomPromise = async (io, socketId, room) => {
	return new Promise((resolve, reject) => {
		io.of("/").adapter.remoteJoin(socketId, room);
		resolve();
	});
};

/**
 * @function remoteLeaveRoom
 * @description globally leave a room from anywher using socket-redis-adapter
 */
const remoteLeaveRoom = async (io, socket, userId, room) => {
	const socketId = await redisStorage.getKeyFromRedis(userId);
	const promise = util.promisify(io.of("/").adapter.remoteLeave).bind(io.of("/").adapter);
	const leaveApp = await promise(socketId, room);
	console.log(socketId + " with userId " + userId + " has remotely left from this room via app " + room);
	return;
};

/**
 * @function getRooms
 * @description get connected socket rooms for any client
 */
const getRooms = async (io, socket, userId) => {
	const socketId = await redisStorage.getKeyFromRedis(userId);
	const roomsPromise = util.promisify(io.of("/").adapter.clientRooms).bind(io.of("/").adapter);
	const connectedRoom = await roomsPromise(socketId);
	console.log(socketId + " is present in rooms " + connectedRoom);
	return;
};

/**
 * @function getClients
 * @description get active clients in socket room
 */
const getClients = async (io, socket, room) => {
	const clientsPromise = util.promisify(io.of("/").adapter.clients).bind(io.of("/").adapter);
	const clients = await clientsPromise([room]);
	console.log(room + " has these clients " + clients);
	return;
};

export const socketLib = {
	closeOldConnects: closeOldConnects,
	remoteDisconnect: remoteDisconnect,
	waitingJoin: waitingJoin,
	remoteJoinRoom: remoteJoinRoom,
	joinRoomPromise: joinRoomPromise,
	remoteLeaveRoom: remoteLeaveRoom,
	getRooms: getRooms,
	getClients: getClients
};