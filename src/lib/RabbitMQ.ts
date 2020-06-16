"use strict";

const amqp = require("amqplib/callback_api");

let amqpConn = null;
let offlinePubQueue = [];

export class RabbitMQ {

	// if the connection is closed or fails to be established at all, we will reconnect
	init() {
		amqp.connect("amqp://localhost" + "?heartbeat=60", (error, connection) => {
			if (error) {
				console.error("[AMQP]", error.message);
				return setTimeout(() => this.init(), 1000);
			}
			connection.on("error", function (err) {
				if (err.message !== "Connection closing") {
					console.error("[AMQP] conn error", err.message);
				}
			});
			connection.on("close", function () {
				console.error("[AMQP] reconnecting");
				return setTimeout(() => this.init(), 1000);
			});

			console.log("[AMQP] connected");
			amqpConn = connection;

			const queue = "hello";
			const msg = "Hello World!";

			this.startPublisher(queue, msg);
			this.startConsumer();
		});
	}

	// Publisher
	startPublisher(queue, msg) {
		amqpConn.createChannel((error, channel) => {
			if (error) {
				console.error("[AMQP] error", error);
				offlinePubQueue.push([queue, msg]);
				amqpConn.close();
			}
			channel.on("error", function (error) {
				console.error("[AMQP] channel error", error.message);
			});
			channel.on("close", function () {
				console.log("[AMQP] channel closed");
			});

			while (true) {
				let m = offlinePubQueue.shift();
				if (!m) break;
				this.startPublisher(queue, msg);
			}

			channel.assertQueue(queue, {
				durable: false
			});
			channel.sendToQueue(queue, Buffer.from(msg));

			console.log(" [x] Sent %s", msg);
		});
	}

	// Consumer
	startConsumer() {
		amqpConn.createChannel(function (error, channel) {
			if (error) {
				console.error("[AMQP] error", error);
				amqpConn.close();
			}

			const queue = "hello";

			channel.assertQueue(queue, {
				durable: false
			});

			console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

			channel.consume(queue, function (msg) {
				console.log(" [x] Received %s", msg.content.toString());
				// channel.ack(msg);
			}, {
				noAck: true
			});
		});
	}

	sendNotiToOne(data) {
		// let msg = JSON.stringify(data);
		// _publish("", appConstants.QUEUES_NAME.SEND_NOTI_ONE, new Buffer(msg));
	}
}

export const rabbitMQ = new RabbitMQ();