"use strict";

import * as redis from "redis";

import * as config from "@config/index";
import { logger } from "@lib/logger";
import { loginHistoryDao } from "@modules/loginHistory/LoginHistoryDao";

let client;
let pub, sub;

export class RedisClient {

	init() {
		client = redis.createClient(config.SERVER.REDIS.PORT, config.SERVER.REDIS.SERVER, { disable_resubscribing: true });
		client.on("ready", () => {
			logger.info("Redis is ready");
		});

		client.on("error", (error) => {
			logger.error("Error in Redis", error);
			console.log("Error in Redis");
		});

		const CONF = { db: 3 };
		// .: Activate "notify-keyspace-events" for expired type events
		pub = redis.createClient(CONF);
		sub = redis.createClient(CONF);
		pub.send_command("config", ["set", "notify-keyspace-events", "Ex"], SubscribeExpired);
		// .: Subscribe to the "notify-keyspace-events" channel used for expired type events
		function SubscribeExpired(e, r) {
			const expired_subKey = "__keyevent@" + CONF.db + "__:expired";
			sub.subscribe(expired_subKey, function () {
				// console.log(" [i] Subscribed to \"" + expired_subKey + "\" event channel : " + r);
				sub.on("message", function (chan, msg) {
					// console.log("[expired]", msg);
					RedisClient.listenJobs(msg);
				});
			});
		}
	}

	// .: For example (create a key & set to expire in 10 seconds)
	createJobs(params) {
		console.log("createJobs===========================>", params, Math.trunc((params.time - Date.now()) / 1000));
		switch (params.jobName) {
			case config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE:
				pub.set(config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE + "." + params.params.userId + "." + params.params.deviceId, JSON.stringify({ "deviceId": params.params.deviceId, "userId": params.params.userId }));
				pub.expire(config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE + "." + params.params.userId + "." + params.params.deviceId, Math.trunc((params.time - Date.now()) / 1000)); // in secs
		}
	}

	static async listenJobs(key) {
		const jobName = key.split(".")[0];
		console.log("listenJobs===========================>", key, jobName);
		if (jobName === config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE) {
			const userId = key.split(".")[1];
			const deviceId = key.split(".")[2];
			if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
				const step1 = await loginHistoryDao.removeDeviceById({ "userId": userId });
			} else {
				const step1 = await loginHistoryDao.removeDeviceById({ "userId": userId, "deviceId": deviceId });
			}
		}
	}

	setExp(key, exp, value) {
		client.setex(key, exp, value);
	}

	storeValue(key, value) {
		// client.set(['framework', 'AngularJS']);
		return client.set(key, value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	getValue(key) {
		return new Promise(function (resolve, reject) {
			client.get(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	storeHash(key, value) {
		// client.hmset("tools", "webserver", "expressjs", "database", "mongoDB", "devops", "jenkins");
		// 													OR
		// client.hmset("tools", {"webserver": "expressjs", "database": "mongoDB", "devops": "jenkins"});
		// {"webserver": "expressjs", "database": "mongoDB", "devops": "jenkins"} // store like this
		return client.hmset(key, value, function (error, object) {
			if (error) {
				console.log(error);
			}
			return object;
		});
	}

	getHash(key) {
		return new Promise(function (resolve, reject) {
			client.hgetall(key, function (error, object) {
				if (error) {
					console.log(error);
				}
				resolve(object);
			});
		});
	}

	storeList(key, value) {
		value.unshift(key);
		// client.rpush(['frameworks', 'angularjs', 'backbone']); // push the elements to the right.
		// client.lpush(['frameworks', 'angularjs', 'backbone']); // push the elements to the left.
		return client.rpush(value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	getList(key) {
		// client.lrange(key, startIndex, endIndex or -1);
		return new Promise(function (resolve, reject) {
			client.lrange(key, 0, -1, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	storeSet(key, value) {
		value.unshift(key);
		// Sets are similar to lists, but the difference is that they don’t allow duplicates
		// client.sadd(['frameworks', 'angularjs', 'backbone']);
		return client.sadd(value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	removeFromSet(key, value) {
		// Redis SREM is used to remove the specified member from the set stored at the key.
		// client.srem('blocked_set', '5c07c44395a7ee2e99608bc9');
		// client.srem('blocked_set', ['5c07c44395a7ee2e99608bc9', '5c07c44e95a7ee2e99608bca']);
		return client.srem(key, value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	getSet(key) {
		return new Promise(function (resolve, reject) {
			client.smembers(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	checkKeyExists(key) {
		return client.exists(key, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	deleteKey(key) {
		return client.del(key, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	expireKey(key, expiryTime) {
		// in seconds
		return client.expireAsync(key, expiryTime, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	incrementKey(key, value) {
		// or incrby()
		return client.set(key, 10, function () {
			return client.incr(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				console.log(reply); // 11
			});
		});
	}

	decrementKey(key, value) {
		// or decrby()
		return client.set(key, 10, function () {
			return client.decr(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				console.log(reply); // 11
			});
		});
	}
}

export const redisClient = new RedisClient();