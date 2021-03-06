"use strict";

import * as _ from "lodash";
// import { any } from "mongoose";
// import { QueryFindOneAndUpdateOptions } from "mongoose";

import * as models from "@modules/models";

export class BaseDao {

	async save(model: ModelNames, data: any) {
		try {
			const ModelName: any = models[model];
			return await new ModelName(data).save();
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async aggregateWithPagination(model: ModelNames, pipeline?: Array<Object>, limit?: number, page?: number, pageCount = true) {
		try {
			let ModelName: any = models[model];
			if (limit) {
				limit = Math.abs(limit);

				// If limit exceeds max limit
				if (limit > 100) {
					limit = 100;
				}

			} else {
				limit = 10;
			}
			if (page && (page != 0)) {
				page = Math.abs(page);
			} else {
				page = 1;
			}
			let skip = (limit * (page - 1));
			let promiseAll = [
				await ModelName.aggregate(pipeline).allowDiskUse(true)
			];

			if (pageCount) {
				for (let index = 0; index < pipeline.length; index++) {
					if ('$skip' in pipeline[index]) {
						pipeline = pipeline.slice(0, index);
					} else {
						pipeline = pipeline
					}
				}
				pipeline.push({ $count: "total" });
				promiseAll.push(ModelName.aggregate(pipeline).allowDiskUse(true))
			}
			let result = await Promise.all(promiseAll);
			let next_hit = 0;
			let total = 0;
			let total_page = 0;

			if (pageCount) {
				total = result[1] && result[1][0] ? result[1][0]['total'] : 0;
				total_page = Math.ceil(total / limit);
			}

			let data: any = result[0];
			if (result[0].length > limit) {
				next_hit = page + 1;
				data = result[0].slice(0, limit);
			}

			return {
				list: data,
				total: total,
				page: page,
				total_page: total_page,
				next_hit: next_hit,
				limit: limit
			};
		} catch (err) {
			console.error(err);
			throw new Error(err);
		}
	}

	async aggreagtionWithPaginateTotal(model: ModelNames, pipeline?: Array<Object>, limit?: number, page?: number, pageCount = false) {
		try {
			let ModelName: any = models[model];
			if (limit) {
				limit = Math.abs(limit);

				// If limit exceeds max limit
				if (limit > 100) {
					limit = 100;
				}

			} else {
				limit = 10;
			}
			if (page && (page != 0)) {
				page = Math.abs(page);
			} else {
				page = 1;
			}
			let skip = (limit * (page - 1));
			let promiseAll = [
				ModelName.aggregate(pipeline).allowDiskUse(true)
			];

			if (pageCount) {
				for (let index = 0; index < pipeline.length; index++) {
					if ('$skip' in pipeline[index]) {
						pipeline = pipeline.slice(0, index);
					} else {
						pipeline = pipeline
					}
				}
				pipeline.push({ $count: "total" });
				promiseAll.push(ModelName.aggregate(pipeline).allowDiskUse(true))
			}
			let result = await Promise.all(promiseAll);
			let next_hit = 0;
			let total = 0;
			let total_page = 0;

			if (pageCount) {
				total = result[1] && result[1][0] ? result[1][0]['total'] : 0;
				total_page = Math.ceil(total / limit);
			}

			let data: any = result[0];
			if (result[0].length > limit) {
				next_hit = page + 1;
				data = result[0].slice(0, limit);
			}
			return {
				list: data,
				total: total,
				page: page,
				total_page: total_page,
				next_hit: next_hit,
				limit: limit
			};
		} catch (err) {
			console.error(err);
			throw new Error(err);
		}
	}

	// async aggregateWithPagination1(model: ModelNames, pipeline?: Array<Object>, limit?: number, page?: number, pageCount = true) {
	// 	try {
	// 		let ModelName: any = models[model];
	// 		if (limit) {
	// 			limit = Math.abs(limit);

	// 			// If limit exceeds max limit
	// 			if (limit > 100) {
	// 				limit = 100;
	// 			}

	// 		} else {
	// 			limit = 10;
	// 		}
	// 		if (page && (page != 0)) {
	// 			page = Math.abs(page);
	// 		} else {
	// 			page = 1;
	// 		}
	// 		let skip = (limit * (page - 1));
	// 		let promiseAll = [
	// 			await ModelName.aggregate(pipeline).allowDiskUse(true)
	// 		];

	// 		if (pageCount) {
	// 			for (let index = 0; index < pipeline.length; index++) {
	// 				if ('$skip' in pipeline[index]) {
	// 					pipeline = pipeline.slice(0, index);
	// 				} else {
	// 					pipeline = pipeline
	// 				}
	// 			}
	// 			pipeline.push({ $count: "total" });
	// 			promiseAll.push(ModelName.aggregate(pipeline).allowDiskUse(true))
	// 		}
	// 		let result = await Promise.all(promiseAll);
	// 		let next_hit = 0;
	// 		let total = 0;
	// 		let total_page = 0;

	// 		if (pageCount) {
	// 			total = result[1] && result[1][0] ? result[1][0]['total'] : 0;
	// 			total_page = Math.ceil(total / limit);
	// 		}

	// 		let data: any = result[0];
	// 		if (result[0].length > limit) {
	// 			next_hit = page + 1;
	// 			data = result[0].slice(0, limit);
	// 		}

	// 		return {
	// 			list: data,
	// 			total: total,
	// 			// page: page,
	// 			// total_page: total_page,
	// 			next_hit: next_hit,
	// 			// limit: limit
	// 		};
	// 	} catch (err) {
	// 		console.error(err);
	// 		throw new Error(err);
	// 	}
	// }




	async find(model: ModelNames, query: any, projection: any, options: any, sort, paginate, populateQuery: any) {
		try {
			const ModelName: any = models[model];
			if (!_.isEmpty(sort) && !_.isEmpty(paginate) && _.isEmpty(populateQuery)) { // sorting with pagination
				return await ModelName.find(query, projection, options).skip((paginate.pageNo - 1) * paginate.limit).limit(paginate.limit).sort(sort);
			} else if (_.isEmpty(sort) && !_.isEmpty(paginate) && _.isEmpty(populateQuery)) { // pagination
				return await ModelName.find(query, projection, options).skip((paginate.pageNo - 1) * paginate.limit).limit(paginate.limit);
			} else if (_.isEmpty(sort) && _.isEmpty(paginate) && !_.isEmpty(populateQuery)) { // populate
				return await ModelName.find(query, projection, options).populate(populateQuery).exec();
			} else if (_.isEmpty(sort) && !_.isEmpty(paginate) && !_.isEmpty(populateQuery)) { // pagination with populate
				return await ModelName.find(query, projection, options).skip((paginate.pageNo - 1) * paginate.limit).limit(paginate.limit).populate(populateQuery).exec();
			} else {
				return await ModelName.find(query, projection, options);
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async findAll(model: ModelNames, query: any, projection: any, options: any) {
		try {
			let ModelName: any = models[model];
			let cehck = await ModelName.find(query, projection, options);
			return cehck;
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async distinct(model: ModelNames, path: string, query: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.distinct(path, query);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async findOne(model: ModelNames, query: any, projection: any, options: any, populateQuery?: any) {
		try {
			const ModelName: any = models[model];
			if (!_.isEmpty(populateQuery)) { // populate
				return await ModelName.findOne(query, projection, options).populate(populateQuery).exec().lean();
			} else {
				return await ModelName.findOne(query, projection, options).lean();
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async findOneWithSort(model: ModelNames, query: any, projection: any, options: any, populateQuery?: any, sort?: any) {
		try {
			const ModelName: any = models[model];
			if (!_.isEmpty(populateQuery)) { // populate
				return await ModelName.findOne(query, projection, options).populate(populateQuery).exec();
			} else {
				return await ModelName.findOne(query, projection, options).sort(sort);
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async findOneAndUpdate(model: ModelNames, query: any, update: any, options: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.findOneAndUpdate(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async findAndRemove(model: ModelNames, query: any, update: any, options: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.findOneAndRemove(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async update(model: ModelNames, query: any, update: any, options: any) {
		try {
			// if (!options) {
			// 	options['new'] = true;
			// 	options['lean'] = true;
			// }
			const ModelName: any = models[model];
			return await ModelName.update(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async updateOne(model: ModelNames, query: any, update: any, options: any) {
		try {

			const ModelName: any = models[model];
			return await ModelName.updateOne(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async updateMany(model: ModelNames, query: any, update: any, options: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.updateMany(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async remove(model: ModelNames, query: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.remove(query);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async deleteMany(model: ModelNames, query: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.deleteMany(query);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async count(model: ModelNames, query: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.count(query);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async countDocuments(model: ModelNames, query: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.countDocuments(query);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async aggregate(model: ModelNames, aggPipe, options: any) {
		try {
			const ModelName: any = models[model];
			const aggregation: any = ModelName.aggregate(aggPipe);
			if (options) {
				aggregation.options = options;
			}
			return await aggregation.exec();
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async insert(model: ModelNames, data, options: any) {
		try {
			// data['createdAt'] = Date.now();
			// data['updatedAt'] = Date.now();
			const ModelName: any = models[model];

			const obj = new ModelName(data);
			await obj.save();
			return obj;
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async insertMany(model: ModelNames, data, options: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.collection.insertMany(data, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async aggregateDataWithPopulate(model: ModelNames, group, populateOptions) {
		try {
			const ModelName: any = models[model];
			const aggregate = await ModelName.aggregate(group);
			const populate = await ModelName.populate(aggregate, populateOptions);
			return populate;
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async bulkFindAndUpdate(bulk, query: any, update: any, options: any) {
		try {
			return await bulk.find(query).upsert().update(update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async bulkFindAndUpdateOne(bulk, query: any, update: any, options: any) {
		try {
			return await bulk.find(query).upsert().updateOne(update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async findByIdAndUpdate(model: ModelNames, query: any, update: any, options: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.findByIdAndUpdate(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async populate(model: ModelNames, data: any, populateQuery: any) {
		try {
			const ModelName: any = models[model];
			return await ModelName.populate(data, populateQuery);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * @description Add skip and limit to pipleine
	 */
	addSkipLimit = (limit, pageNo) => {
		if (limit) {
			limit = Math.abs(limit);
			// If limit exceeds max limit
			if (limit > 100) {
				limit = 100;
			}
		} else {
			limit = 10;
		}
		if (pageNo && (pageNo !== 0)) {
			pageNo = Math.abs(pageNo);
		} else {
			pageNo = 1;
		}
		let skip = (limit * (pageNo - 1));
		return [
			{ "$skip": skip },
			{ "$limit": limit + 1 }
		];
	}

	paginate = async (model: ModelNames, pipeline: Array<Object>, limit: number, pageNo: number, options: any = {}, pageCount = true) => {
		try {
			pipeline = [...pipeline, ...this.addSkipLimit(limit, pageNo)];
			let ModelName: any = models[model];
			if (limit) {
				limit = Math.abs(limit);
				// If limit exceeds max limit
				if (limit > 100) {
					limit = 100;
				}
			} else {
				limit = 10;
			}
			if (pageNo && (pageNo !== 0)) {
				pageNo = Math.abs(pageNo);
			} else {
				pageNo = 1;
			}
			let promiseAll = [];
			if (!_.isEmpty(options)) {
				if (options.collation) {
					promiseAll = [
						ModelName.aggregate(pipeline).collation({ "locale": "en" }).allowDiskUse(true)
					];
				} else {
					promiseAll = [
						ModelName.aggregate(pipeline).allowDiskUse(true)
					];
				}
			} else {
				promiseAll = [
					ModelName.aggregate(pipeline).allowDiskUse(true)
				];
			}

			if (pageCount) {
				for (let index = 0; index < pipeline.length; index++) {
					if ("$skip" in pipeline[index]) {
						pipeline = pipeline.slice(0, index);
					} else {
						pipeline = pipeline;
					}
				}
				pipeline.push({ "$count": "total" });
				promiseAll.push(ModelName.aggregate(pipeline));
			}
			let result = await Promise.all(promiseAll);
			let nextHit = 0;
			let total = 0;
			let totalPage = 0;

			if (pageCount) {
				total = result[1] && result[1][0] ? result[1][0]["total"] : 0;
				totalPage = Math.ceil(total / limit);
			}

			let data: any = result[0];
			if (result[0].length > limit) {
				nextHit = pageNo + 1;
				data = result[0].slice(0, limit);
			}
			return {
				"data": data,
				"total": total,
				"pageNo": pageNo,
				"totalPage": totalPage,
				"nextHit": nextHit,
				"limit": limit
			};
		} catch (error) {
			throw new Error(error);
		}
	}

	/*async getColl(model: ModelNames) {
		try {
			const ModelName: any = models[model];
			const changeStream = await ModelName.watch({fullDocument: "updateLookup"});
			changeStream.on("change", (error, data) => {
			});
			console.log(changeStream);
			return changeStream;
		} catch (error) {
			return Promise.reject(error);
		}
	}*/
}

export const baseDao = new BaseDao();