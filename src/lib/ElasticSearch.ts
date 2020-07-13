"use strict";

import * as _ from "lodash";
import * as elasticsearch from "elasticsearch";

import * as config from "@config/environment";
import { logger } from "@lib/logger";
// require the array of cities that was downloaded
import * as users from "../json/users.json"; // just for reference

// instantiate an Elasticsearch client
const client = new elasticsearch.Client({
	host: config.SERVER.ELASTIC_SEARCH.HOST,
	// log: "trace"
});

export class ElasticSearch {

	constructor() { }

	init() {
		// ping the client to be sure Elasticsearch is up
		client.ping({
			// ping usually has a 3000ms timeout
			requestTimeout: 1000
		}, function (error) {
			// at this point, eastic search is down, please check your Elasticsearch service
			if (error) {
				console.error("Elasticsearch cluster is down!");
				logger.error("Elasticsearch cluster is down!", error);
			} else {
				logger.info("Elasticsearch is ready");
			}
		});
	}

	/**
	 * @description create a new index. If the index has already been created, this function fails safely.
	 */
	// Create Index
	initIndex(indexName) {
		client.indices.create({
			index: indexName
		}, function (error, response, status) {
			if (error) {
				console.log(error);
			} else {
				return response;
			}
		});
	}

	// Check if index exists
	indexExists(indexName) {
		client.indices.exists({
			index: indexName
		}, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				return response;
			}
		});
	}

	// Preparing index and its mapping
	initMapping(indexName, docType, payload) {
		client.indices.putMapping({
			index: indexName,
			type: docType,
			body: payload
		}, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				return response;
			}
		});
	}

	/**
	 * @description add a data to the index that has already been created
	 * @note if the id key is omitted, Elasticsearch will auto-generate one.
	 */
	// Add/Update a document
	addDocument(indexName, _id, docType, payload) {
		client.index({
			index: indexName,
			id: String(_id),
			type: docType,
			body: payload
		}, function (error, response, status) {
			if (error) {
				console.log(error);
			} else {
				return response;
			}
		});
	}

	// Update a document
	updateDocument(indexName, _id, docType, payload) {
		client.update({
			index: indexName,
			id: String(_id),
			type: docType,
			body: { doc: payload }
		}, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				return response;
			}
		});
	}

	// Search
	search(indexName, docType, payload) {
		client.search({
			index: indexName,
			type: docType,
			body: payload
			// q: 'PostName:Node.js'
		}, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				return response;
			}
		});
	}

	// Search using DSL
	searchWithDSL(indexName, docType, payload) {
		return new Promise((resolve, reject) => {
			client.search({
				index: indexName,
				type: docType,
				body: payload
			}, function (error, response) {
				if (error) {
					console.log(error);
				} else {
					resolve(response);
				}
			});
		});
	}

	// Delete a document from an index
	deleteDocument(indexName, _id, docType) {
		return new Promise((resolve, reject) => {
			client.delete({
				index: indexName,
				id: String(_id),
				type: docType
			}, function (error, response) {
				if (error) {
					console.log(error);
				} else {
					resolve(response);
				}
			});
		});
	}

	// Delete all
	deleteAll(indexName) {
		client.indices.delete({
			index: indexName
		}, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				return response;
			}
		});
	}

	/**
	 * @description perform bulk indexing of the data passed
	 */
	async bulkAddDocument(indexName, docType) {
		// declare an empty array called bulk
		const bulk = [];
		// loop through each city and create and push two objects into the array in each loop
		// first object sends the index and type you will be saving the data as
		// second object is the data you want to index
		await users.forEach(user => {
			const index = {
				_index: indexName,
				_type: docType
			};
			if (user["_id"]) index["_id"] = String(user["_id"]);
			bulk.push({ index });
			if (user["_id"]) delete user["_id"];
			bulk.push(user);
		});

		client.bulk({ body: bulk }, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				return response;
			}
		});
	}
}

export const elasticSearch = new ElasticSearch();