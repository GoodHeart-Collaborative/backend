"use strict";

import * as redis from "redis";
import * as util from "util";

let redisClient;

export class RedisStorage {

	init() {
		redisClient = redis.createClient({ disable_resubscribing: true });
	}

	/**
	 * @function insertKeyInRedis
	* @description Insert in redis
	*/
	async insertKeyInRedis(key, value) {
		try {
			const promise = util.promisify(redisClient.set).bind(redisClient);
			const appSocket = await promise(key.toString(), value.toString());
			return {};
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}

	/**
	 * @function getKeyFromRedis
	* @description Get socket ids from redis db stored corresponding to userId
	*/
	async getKeyFromRedis(key) {
		try {
			const promise = util.promisify(redisClient.get).bind(redisClient);
			const value = await promise(key.toString());
			// console.log(key + " user has this socket id " + value);
			return value;
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}

	/**
	 * @function insertSetInRedis
	* @description Update room id one at a time from redis db stored corresponding to userId_room
	*/
	async insertSetInRedis(chatId: string, userId: string) {
		try {
			const promise = util.promisify(redisClient.sadd).bind(redisClient);
			const addRoomToSet = await promise(userId.toString() + "_room", chatId);
			console.log(userId + "_room has updated its new room " + chatId);
			return {};
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}

	/**
	 * @function getSetInRedis
	* @description Get room ids from redis db stored corresponding to userId_room
	*/
	async getSetInRedis(userId: string) {
		try {
			const promise = util.promisify(redisClient.smembers).bind(redisClient);
			const connectedRooms = await promise(userId.toString() + "_room");
			console.log(userId + " user has has to be connected in these rooms " + connectedRooms);
			return connectedRooms;
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}

	/**
	 * @function execMulti
	* @description Execute multi command in redis
	*/
	async execMulti(commands: any) {
		try {
			const promise = util.promisify(redisClient.multi).bind(redisClient);
			const execMultiCommands = await promise.exec(commands);
			console.log("Multi execution on redis with commands", JSON.stringify(commands));
			return {};
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}
}

export const redisStorage = new RedisStorage();