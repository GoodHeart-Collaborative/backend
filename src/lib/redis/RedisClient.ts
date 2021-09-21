// 'use strict';

// import * as redis from 'redis';
// import * as util from 'util';
// import { logger } from '@lib/logger';
// import { consolelog } from '@utils/appUtils';
// import { CONSTANT, SERVER } from '@config/index';
// // import { bookingDaoV1, itemDaoV1 } from '@dao/index';


// // import * as config from "@config/environment";

// const redisPassword = "FLTFDDs63jdd3";

// let client;
// let pub;
// let sub;

// class RedisClient {
//     constructor() {
//         //     const _this = this;
//         const CONF = { db: SERVER.REDIS.DB };

//         //     // Activate "notify-keyspace-events" for expired type events
//         //     pub = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF);
//         //     sub = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF);
//         //     pub.send_command(
//         //         'config',
//         //         ['set', 'notify-keyspace-events', 'Ex'],
//         //         SubscribeExpired
//         //     );
//         //     // Subscribe to the "notify-keyspace-events" channel used for expired type events
//         //     function SubscribeExpired(e, r) {
//         //         const expired_subKey = '__keyevent@' + CONF.db + '__:expired';
//         //         sub.subscribe(expired_subKey, function () {
//         //             logger.info(
//         //                 ' [i] Subscribed to "' +
//         //                 expired_subKey +
//         //                 '" event channel : ' +
//         //                 r
//         //             );
//         //             sub.on('message', function (chan, msg) {
//         //                 console.log('[expired]', msg);
//         //                 _this.listenJobs(msg);
//         //             });
//         //         });
//         //     }
//     }

//     async init() {
//         const CONF = { db: SERVER.REDIS.DB };

//         // client = redis.createClient({
//         //     host: SERVER.REDIS.HOST,
//         //     no_ready_check: true,
//         //     port: SERVER.REDIS.PORT,
//         //     password: SERVER.REDIS.DB,
//         // });

//         client = redis.createClient(
//             SERVER.REDIS.PORT,
//             SERVER.REDIS.HOST,
//             // CONF,
//             // {
//             //     disable_resubscribing: true,
//             // }
//         );
//         // console.log('clientclientclientclientclient', client);

//         client.on('ready', () => {
//             logger.info(
//                 `Redis server listening on ${SERVER.REDIS.HOST}:${SERVER.REDIS.PORT}, in ${SERVER.REDIS.DB} DB`
//             );
//         });
//         client.on('error', error => {
//             logger.error('Error in Redis', error);
//             console.log('Error in Redis');
//         });
//     }

//     getInstance() {
//         return client;
//     }

//     // .: For example (create a key & set to expire in 10 seconds)
//     createJobs(params) {
//         console.log(
//             'createJobs===========================>',
//             params,
//             Math.trunc(params.time / 1000)
//         );
//         switch (params.jobName) {
//             // case CONSTANT.REDIS_KEY_PREFIX.AVAILABILITY: {
//             //     this.setExp(
//             //         `${params.itemId}.${CONSTANT.REDIS_KEY_PREFIX.AVAILABILITY}`,
//             //         Math.trunc(params.time / 1000),
//             //         JSON.stringify(params.data)
//             //     );
//             //     break;
//             // }
//             // case CONSTANT.REDIS_KEY_PREFIX.OVER_DUE: {
//             //     this.setExp(
//             //         `${params.bookingId}.${CONSTANT.REDIS_KEY_PREFIX.OVER_DUE}`,
//             //         Math.trunc(params.time / 1000),
//             //         JSON.stringify(params.data)
//             //     );
//             //     break;
//             // }
//         }
//     }

//     async listenJobs(key) {
//         key = key.split('.');
//         console.log(
//             'listenJobs===========================>',
//             key[key.length - 1],
//             false
//         );
//         switch (key[key.length - 1]) {
//             // case CONSTANT.REDIS_KEY_PREFIX.AVAILABILITY: {
//             //     //const brpop = await this.brpop(CONSTANT.REDIS_KEY_PREFIX.AVAILABILITY + key[0].toString());
//             //     //console.log(brpop)
//             //     //if (brpop) {
//             //     await this.deleteKey(
//             //         `${key[0].toString()}` +
//             //         CONSTANT.REDIS_KEY_PREFIX.AVAILABILITY
//             //     );
//             //     await itemDaoV1.updateItem({
//             //         itemId: key[0],
//             //         unavailableToday: false,
//             //     });
//             //     //};
//             //     break;
//             // }
//             // case CONSTANT.REDIS_KEY_PREFIX.OVER_DUE: {
//             //     await this.deleteKey(
//             //         `${key[0].toString()}` + CONSTANT.REDIS_KEY_PREFIX.OVER_DUE
//             //     );
//             //     await bookingDaoV1.updateBookingStatus({
//             //         bookingId: key[0],
//             //         bookingStatus: CONSTANT.BOOKING_STATUS.OVER_DUE,
//             //     });
//             //     break;
//             // }
//         }
//     }

//     setExp(key, exp, value) {
//         client.setex(key, exp, value);
//     }

//     getKeys(key) {
//         return new Promise((resolve, reject) => {
//             client
//                 .multi()
//                 .keys(key)
//                 .exec(function (error, reply) {
//                     if (error) reject(error);
//                     else resolve(reply[0]);
//                 });
//         });
//     }

//     async storeValue(key, value) {
//         // client.set(['framework', 'AngularJS']);
//         try {
//             const promise = util.promisify(client.set).bind(client);
//             await promise(key.toString(), value.toString());
//             // console.log("storeValue", [key.toString(), value], false);
//             return {};
//         } catch (error) {
//             console.log('storeValue', error, false);
//             return Promise.reject(error);
//         }
//     }

//     mset(values) {
//         client.mset(values, function (error, object) {
//             if (error) {
//                 console.log(error);
//             }
//             return object;
//         });
//     }

//     async getValue(key) {
//         try {
//             const promise = util.promisify(client.get).bind(client);
//             const value = await promise(key.toString());
//             return value;
//         } catch (error) {
//             // consolelog("getValue", error, false);
//             return Promise.reject(error);
//         }
//     }

//     async storeHash(key, value) {
//         // client.hmset("tools", "webserver", "expressjs", "database", "mongoDB", "devops", "jenkins");
//         // 													OR
//         // client.hmset("tools", {"webserver": "expressjs", "database": "mongoDB", "devops": "jenkins"});
//         // {"webserver": "expressjs", "database": "mongoDB", "devops": "jenkins"} // store like this
//         try {
//             const promise = util.promisify(client.hmset).bind(client);
//             const object = await promise(key.toString(), value);
//             // consolelog("storeHash", [key.toString(), value], false);
//             return object;
//         } catch (error) {
//             // consolelog("storeHash", error, false);
//             return Promise.reject(error);
//         }
//     }

//     async getHash(key) {
//         try {
//             const promise = util.promisify(client.hgetall).bind(client);
//             const value = await promise(key.toString());
//             return value;
//         } catch (error) {
//             // consolelog("getHash", error, false);
//             return Promise.reject(error);
//         }
//     }

//     async incrementHashField(key, field, incrementValue) {
//         try {
//             return client.hincrby(key, field, incrementValue, function (
//                 error,
//                 reply
//             ) {
//                 if (error) {
//                     console.log(error);
//                 }
//                 console.log('== incremented Field ==', reply);
//             });
//         } catch (error) {
//             // consolelog("HincrBY", error, false);
//             return Promise.reject(error);
//         }
//     }

//     storeList(key, value) {
//         value.unshift(key);
//         // client.rpush(['frameworks', 'angularjs', 'backbone']); // push the elements to the right.
//         // client.lpush(['frameworks', 'angularjs', 'backbone']); // push the elements to the left.
//         return client.rpush(value, function (error, reply) {
//             if (error) {
//                 console.log(error);
//             }
//             return reply;
//         });
//     }

//     getList(key) {
//         // client.lrange(key, startIndex, endIndex or -1);
//         return new Promise(function (resolve, reject) {
//             client.lrange(key, 0, -1, function (error, reply) {
//                 if (error) {
//                     console.log(error);
//                 }
//                 resolve(reply);
//             });
//         });
//     }

//     async storeSet(key, value) {
//         try {
//             value.unshift(key);
//             // Sets are similar to lists, but the difference is that they don’t allow duplicates
//             // client.sadd(['frameworks', 'angularjs', 'backbone']);
//             const promise = util.promisify(client.sadd).bind(client);
//             await promise(value);
//             return {};
//         } catch (error) {
//             console.log(error);
//             return Promise.reject(error);
//         }
//     }

//     async removeFromSet(key, value) {
//         try {
//             // Redis SREM is used to remove the specified member from the set stored at the key.
//             // client.srem('blocked_set', '5c07c44395a7ee2e99608bc9');
//             // client.srem('blocked_set', ['5c07c44395a7ee2e99608bc9', '5c07c44e95a7ee2e99608bca']);
//             const promise = util.promisify(client.srem).bind(client);
//             await promise(key, value);
//             return {};
//         } catch (error) {
//             console.log(error);
//             return Promise.reject(error);
//         }
//     }

//     getSet(key) {
//         return new Promise(function (resolve, reject) {
//             client.smembers(key, function (error, reply) {
//                 if (error) {
//                     console.log(error);
//                 }
//                 resolve(reply);
//             });
//         });
//     }

//     checkKeyExists(key) {
//         return client.exists(key, function (error, reply) {
//             if (error) {
//                 console.log(error);
//             }
//             return reply;
//         });
//     }

//     deleteKey(key) {
//         return client.del(key, function (error, reply) {
//             if (error) {
//                 console.log(error);
//             }
//             return reply;
//         });
//     }

//     expireKey(key, expiryTime) {
//         // in seconds
//         return client.expireAsync(key, expiryTime, function (error, reply) {
//             if (error) {
//                 console.log(error);
//             }
//             return reply;
//         });
//     }

//     incrementKey(key) {
//         return client.incr(key, function (error, reply) {
//             if (error) {
//                 console.log(error);
//             }
//             console.log('== incremented key ==', reply);
//         });
//     }

//     decrementKey(key, value) {
//         // or decrby()
//         return client.set(key, 10, function () {
//             return client.decr(key, function (error, reply) {
//                 if (error) {
//                     console.log(error);
//                 }
//                 console.log(reply); // 11
//             });
//         });
//     }

//     async addToSortedSet(setname, value, key) {
//         try {
//             return new Promise((resolve, reject) => {
//                 client.zadd(setname, value, key, function (error, reply) {
//                     if (error) reject(error);
//                     else resolve(reply);
//                 });
//             });
//         } catch (error) {
//             console.log(error);
//             return Promise.reject(error);
//         }
//     }

//     async getRankFromSortedSet(setname, key) {
//         try {
//             return new Promise((resolve, reject) => {
//                 client.zrevrank(setname, key, function (error, reply) {
//                     if (error) reject(error);
//                     else resolve(reply);
//                 });
//             });
//         } catch (error) {
//             console.log(error);
//             return Promise.reject(error);
//         }
//     }

//     async removeFromSortedSet(setname, key) {
//         try {
//             return new Promise((resolve, reject) => {
//                 client.zrem(setname, key, function (error, reply) {
//                     if (error) reject(error);
//                     else resolve(reply);
//                 });
//             });
//         } catch (error) {
//             console.log(error);
//             return Promise.reject(error);
//         }
//     }

//     async brpop(key, timeout = 2) {
//         try {
//             return new Promise((resolve, reject) => {
//                 client.brpop(key, timeout, function (error, reply) {
//                     if (error) reject(error);
//                     else resolve(reply);
//                 });
//             });
//         } catch (error) {
//             console.log(error);
//             return Promise.reject(error);
//         }
//     }
// }

// export const redisClient = new RedisClient();

"use strict";

import * as redis from "redis";
import * as util from "util";
import * as config from "@config/index";
import { logger } from "@lib/logger";
import { consolelog } from "@utils/appUtils";

let client, pub, sub;

class RedisClient {

    constructor() {
        const _this = this;
        const CONF = { db: config.SERVER.REDIS.DB };
        // Activate "notify-keyspace-events" for expired type events
        pub = redis.createClient(config.SERVER.REDIS.PORT, config.SERVER.REDIS.HOST, CONF);
        sub = redis.createClient(config.SERVER.REDIS.PORT, config.SERVER.REDIS.HOST, CONF);
        // pub.send_command("config", ["set", "notify-keyspace-events", "Ex"], SubscribeExpired);
        // Subscribe to the "notify-keyspace-events" channel used for expired type events
        // function SubscribeExpired(e, r) {
        //     console.log(e, r);
        //     const expired_subKey = "__keyevent@" + CONF.db + "__:expired";
        //     sub.subscribe(expired_subKey, function () {
        //         sub.on("message", function (channel, msg) {
        //             console.log("[expired]", msg, channel);
        //             _this.listenJobs(msg);
        //         });
        //     });
        // }
    }

    async init() {
        try {
            const CONF = { db: config.SERVER.REDIS.DB };
            let options = {}
            options['db'] = config.SERVER.REDIS.DB
            options['host'] = config.SERVER.REDIS.HOST;
            options['port'] = config.SERVER.REDIS.PORT;
            client = redis.createClient(options);

            client.on("ready", () => {
                console.log(` REDIS CONFIG ========>  ${config.SERVER.REDIS.PORT} ----${config.SERVER.REDIS.HOST}`)
            });
            client.on("error", (error) => {
                console.log("Error in Redis", error);
            });
        } catch (error) {
            return error
        }
    }

    // createJobs(params) {
    // 	console.log("createJobs===========================>", params, Math.trunc(params.time / 1000));
    // 	switch (params.jobName) {
    // 		case config.CONSTANT.REDIS_KEY_PREFIX.EXPIRE_OTP_TIME: {
    // 			this.setExp(`${config.CONSTANT.REDIS_KEY_PREFIX.EXPIRE_OTP_TIME}`,
    // 				Math.trunc(params.time / 1000),
    // 				JSON.stringify(params.data));
    // 			break;
    // 		};
    // 	}
    // }

    async listenJobs(key) {
        console.log(key);
        key = key.split(".")
        console.log(key, typeof (key))
        console.log("listenJobs===========================>", key[key.length - 1], false);

        switch (key[key.length - 1]) {
            case 10: { //config.CONSTANT.REDIS_KEY_PREFIX.EXPIRE_OTP_TIME: {
                try {
                    let data = key[0];
                    break;
                } catch (error) {
                    throw (error);
                }
            };
        }
    }

    getInstance() {
        return client;
    }

    setExp(key, exp, value) {
        client.setex(key, exp, value);
    }

    getKeys(key) {
        return new Promise((resolve, reject) => {
            client.multi().keys(key).exec(function (error, reply) { if (error) reject(error); else resolve(reply[0]) });
        });
    }

    async storeValue(key, value) {
        // client.set(['framework', 'AngularJS']);
        try {
            const promise = util.promisify(client.set).bind(client);
            await promise(key.toString(), value.toString());
            // console.log("storeValue", [key.toString(), value], false);
            return {};
        } catch (error) {
            console.log("storeValue", error, false);
            return Promise.reject(error);
        }

    }

    mset(values) {
        client.mset(values, function (error, object) {
            if (error) {
                console.log(error);
            }
            return object;
        });
    }

    async getValue(key) {
        try {
            const promise = util.promisify(client.get).bind(client);
            const value = await promise(key.toString());
            return value;
        } catch (error) {
            // consolelog("getValue", error, false);
            return Promise.reject(error);
        }
    }

    async storeHash(key, value) {
        // client.hmset("tools", "webserver", "expressjs", "database", "mongoDB", "devops", "jenkins");
        // 													OR
        // client.hmset("tools", {"webserver": "expressjs", "database": "mongoDB", "devops": "jenkins"});
        // {"webserver": "expressjs", "database": "mongoDB", "devops": "jenkins"} // store like this
        try {
            const promise = util.promisify(client.hmset).bind(client);
            const object = await promise(key.toString(), value);
            // consolelog("storeHash", [key.toString(), value], false);
            return object;
        } catch (error) {
            // consolelog("storeHash", error, false);
            return Promise.reject(error);
        }
    }

    async getHash(key) {
        try {
            const promise = util.promisify(client.hgetall).bind(client);
            const value = await promise(key.toString());
            return value;
        } catch (error) {
            // consolelog("getHash", error, false);
            return Promise.reject(error);
        }
    }


    async incrementHashField(key, field, incrementValue) {
        try {
            return client.hincrby(key, field, incrementValue, function (error, reply) {
                if (error) {
                    console.log(error);
                }
                console.log("== incremented Field ==", reply);
            });
        } catch (error) {
            // consolelog("HincrBY", error, false);
            return Promise.reject(error);
        }
    };

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

    async storeSet(key, value) {
        try {
            value.unshift(key);
            // Sets are similar to lists, but the difference is that they don’t allow duplicates
            // client.sadd(['frameworks', 'angularjs', 'backbone']);
            const promise = util.promisify(client.sadd).bind(client);
            await promise(value);
            return {};
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }

    async removeFromSet(key, value) {
        try {
            // Redis SREM is used to remove the specified member from the set stored at the key.
            // client.srem('blocked_set', '5c07c44395a7ee2e99608bc9');
            // client.srem('blocked_set', ['5c07c44395a7ee2e99608bc9', '5c07c44e95a7ee2e99608bca']);
            const promise = util.promisify(client.srem).bind(client);
            await promise(key, value);
            return {};
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
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

    incrementKey(key) {
        return client.incr(key, function (error, reply) {
            if (error) {
                console.log(error);
            }
            console.log("== incremented key ==", reply);
        });
    };

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

    async addToSortedSet(setname, value, key) {
        try {
            return new Promise((resolve, reject) => {
                console.log(setname, value, key, client)
                client.zadd(setname, value, key, function (error, reply) {
                    if (error)
                        reject(error);
                    else
                        resolve(reply)
                });
            });
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    };

    async getRankFromSortedSet(setname, key) {
        try {
            return new Promise((resolve, reject) => {
                client.zrank(setname, key, function (error, reply) {
                    if (error)
                        reject(error);
                    else
                        resolve(reply + 1)
                });
            });
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    };

    async removeFromSortedSet(setname, key) {
        try {
            return new Promise((resolve, reject) => {
                client.zrem(setname, key, function (error, reply) {
                    if (error)
                        reject(error);
                    else
                        resolve(reply)
                });
            });
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    };

    async brpop(key, timeout = 2) {
        try {
            return new Promise((resolve, reject) => {
                client.brpop(key, timeout, function (error, reply) {
                    if (error)
                        reject(error);
                    else
                        resolve(reply)
                });
            });
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }

    async getRangeDataFromSortedSet(setname, start, end) {
        try {
            return new Promise((resolve, reject) => {
                client.zrange(setname, start, end, function (error, reply) {
                    if (error)
                        reject(error);
                    else
                        resolve(reply)
                });
            });
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    };

}

export const redisClient = new RedisClient();