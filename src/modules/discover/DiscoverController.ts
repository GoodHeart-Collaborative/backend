"use strict";
import * as homeConstants from "./DiscoverConstant";
import { discoverDao } from "./DiscoverDao";
import * as appUtils from "@utils/appUtils";
import { CONSTANT } from "@config/constant";
import { userDao } from "@modules/user";
import * as config from '@config/constant';
import { notificationManager } from '@utils/NotificationManager';
import { errorReporter } from "@lib/flockErrorReporter";

class DiscoverController {

    /**
     * @function getDiscoverData
     * @description to get the nearby user by location
     */
    async getDiscoverData(params, userId) {
        try {
            params.discover_status = CONSTANT.DISCOVER_STATUS.PENDING
            let getData = await discoverDao.getDiscoverData(params, userId, false)
            if (getData && getData.total > 0) {
                return homeConstants.MESSAGES.SUCCESS.DISCOVER_DATA(getData)
            }
            return homeConstants.MESSAGES.SUCCESS.DISCOVER_DATA_NO_USER(getData)
        } catch (error) {
            throw error;
        }
    }
    async getUserData(params, userId) {
        try {
            let getData = await discoverDao.getUserData(params, userId)
            return homeConstants.MESSAGES.SUCCESS.DISCOVER_DATA(getData)
        } catch (error) {
            throw error;
        }
    }

    /** 7664
     * @function updateDiscoverData
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    async updateDiscoverData(params: DiscoverRequest.DiscoverRequestEdit, userId) {
        try {
            let query: any = {}
            query["_id"] = params.followerId
            userId.userId = await appUtils.toObjectId(userId.userId)
            query["$or"] = [{ userId: userId.userId }, { followerId: userId.userId }];
            let checkQuery: any = {}
            checkQuery["$or"] = [{ userId: userId.userId, followerId: params.followerId }, { followerId: userId.userId, userId: params.followerId }]
            let checkDiscover = await discoverDao.checkDiscover(checkQuery)
            if (checkDiscover) {
                if (userId.userId.toString() === checkDiscover.userId.toString() && params.discover_status === CONSTANT.DISCOVER_STATUS.ACCEPT) {
                    return homeConstants.MESSAGES.ERROR.PERMISSION_DENIED
                }
                query = { _id: checkDiscover._id }
                if (params.discover_status === CONSTANT.DISCOVER_STATUS.ACCEPT) {
                    // push
                    params['title'] = 'Friend_request';
                    params['body'] = {
                        userId: userId.userId,
                    };
                    params['click_action'] = config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_APPROVED.category;
                    params['message'] = `${userId.firstName} accepted your friend request`;
                    params['type'] = config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_APPROVED.type;
                    const data1111 = notificationManager.sendOneToOneNotification(params, userId);

                    await userDao.pushMember({ userId: userId.userId.toString(), followerId: params.followerId })
                    await userDao.pushMember({ userId: params.followerId, followerId: userId.userId.toString() })

                } else {
                    //pull
                    if (checkDiscover.discover_status === CONSTANT.DISCOVER_STATUS.ACCEPT) {
                        await userDao.pullMember({ userId: userId.userId.toString(), followerId: params.followerId })
                        await userDao.pullMember({ userId: params.followerId, followerId: userId.userId.toString() })
                    }
                }
                await discoverDao.updateDiscover(query, { discover_status: params.discover_status })
                userId = userId.userId.toString()
                let getData = await discoverDao.getUserData({ _id: params.followerId }, userId)
                getData.data[0].discover_status = params.discover_status
                getData.data[0].user.discover_status = params.discover_status
                return homeConstants.MESSAGES.SUCCESS.DISCOVER_DATA_UPDATED(getData.data[0])
            } else {
                return homeConstants.MESSAGES.ERROR.DISCOVER_NOT_FOUND
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * 
     * @description to accept the connection request
     * @param (DiscoverRequest.DiscoverRequestAdd)
     */
    async saveDiscoverData(params: DiscoverRequest.DiscoverRequestAdd, userId, name?) {
        try {
            let checkQuery: any = {}
            let status: any = {}
            console.log('namenamenamenamename', name);

            checkQuery["$or"] = [{ userId: userId.userId, followerId: params.followerId }, { followerId: userId.userId, userId: params.followerId }]
            let checkDiscover = await discoverDao.checkDiscover(checkQuery)


            params['title'] = 'Friend_request';
            params['body'] = {
                userId: userId.userId
            };
            params['click_action'] = "FRIEND_REQUEST";
            params['message'] = `${name.name} wants to connect with you `;
            params['type'] = config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_SEND.type;
            params['userId'] = params.followerId;
            const data1111 = notificationManager.sendOneToOneNotification(params, userId)

            // { followerId: params.followerId, userId: userId.userId })
            if (checkDiscover) {
                if (checkDiscover.discover_status === CONSTANT.DISCOVER_STATUS.ACCEPT) {
                    status = CONSTANT.DISCOVER_STATUS.ACCEPT
                } else {
                    // update 
                    status = CONSTANT.DISCOVER_STATUS.PENDING
                    await discoverDao.updateDiscover({ _id: checkDiscover._id }, { discover_status: status })
                }
                let param: any = {}
                param["_id"] = params.followerId
                let getData = await discoverDao.getUserData(param, userId)
                getData.data[0].discover_status = status
                getData.data[0].user.discover_status = status
                return homeConstants.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(getData.data[0])
            } else {
                params['userId'] = userId.userId
                await discoverDao.saveDiscover(params)
                let param: any = {}
                param["_id"] = params.followerId
                let getData = await discoverDao.getUserData(param, userId)
                getData.data[0].user.discover_status = CONSTANT.DISCOVER_STATUS.PENDING;


                return homeConstants.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(getData.data[0])
            }

        } catch (error) {
            errorReporter(error);
            throw error;
        }
    }

    async getDiscoverStatus(params, tokenData) {
        try {
            const data = await discoverDao.getDiscoverStatus(params, tokenData);
            console.log('data', data);
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

}
export const discoverController = new DiscoverController();