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
            if (params.longitude == undefined && params.latitude == undefined) {
                let getUserInfo = await discoverDao.getUserById(userId)
                if (getUserInfo) {
                    if (getUserInfo && getUserInfo.location && getUserInfo.location.coordinates && getUserInfo.location.coordinates.length > 0) {
                        params.longitude = getUserInfo.location.coordinates[0]
                        params.latitude = getUserInfo.location.coordinates[1]
                    }
                }
            }
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
                    await userDao.pushMember({ userId: userId.userId.toString(), followerId: params.followerId })
                    await userDao.pushMember({ userId: params.followerId, followerId: userId.userId.toString() })

                } else {
                    //pull
                    if (checkDiscover.discover_status === CONSTANT.DISCOVER_STATUS.ACCEPT) {
                        await userDao.pullMember({ userId: userId.userId.toString(), followerId: params.followerId })
                        await userDao.pullMember({ userId: params.followerId, followerId: userId.userId.toString() })
                    }
                }
                let updateObj: any = {}
                if (checkDiscover.discover_status === CONSTANT.DISCOVER_STATUS.REJECT && params.discover_status === CONSTANT.DISCOVER_STATUS.PENDING) {
                    // status = params.discover_status

                    if (checkDiscover.userId.toString() !== userId.userId.toString()) {
                        updateObj = {
                            discover_status: params.discover_status,
                            userId: userId.userId,
                            followerId: params.followerId
                        }
                    }
                    else {
                        updateObj = {
                            discover_status: params.discover_status,
                            // userId: userId.userId,
                            // followerId: params.followerId
                        }

                    }

                    await discoverDao.updateDiscover({ _id: checkDiscover._id }, updateObj)
                } else {
                    await discoverDao.updateDiscover(query, { discover_status: params.discover_status })
                }
                if (params.discover_status === CONSTANT.DISCOVER_STATUS.ACCEPT) {
                    params['title'] = 'Friend Request';
                    params['body'] = {
                        user: {
                            _id: userId.userId,
                            name: (userId.firstName) + " " + (userId.lastName ? userId.lastName : ""),
                            // name: userId.firstName,
                            profilePicUrl: userId.profilePicUrl,
                            profession: userId.profession,
                            industryType: userId.industryType,
                            experience: userId.experience,
                            about: userId.about,
                            myConnection: userId.myConnection
                        }
                        // userId: userId.userId,
                    };
                    params['userId'] = params.followerId;
                    params['category'] = config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_APPROVED.category;
                    // params['click_action'] = config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_APPROVED.category;
                    params['message'] = `${userId.firstName} accepted your friend request`;
                    params['type'] = config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_APPROVED.type;

                    const data1111 = notificationManager.sendOneToOneNotification(params, userId, true);
                }

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
    async saveDiscoverData(params: DiscoverRequest.DiscoverRequestAdd, userId) {
        try {
            let checkQuery: any = {}
            let status: any = {}

            checkQuery["$or"] = [{ userId: userId.userId, followerId: params.followerId }, { followerId: userId.userId, userId: params.followerId }]
            let checkDiscover = await discoverDao.checkDiscover(checkQuery)
            console.log('>>>>>>', checkDiscover);


            // { followerId: params.followerId, userId: userId.userId })
            let discoverData;
            if (checkDiscover) {
                if (checkDiscover.discover_status === CONSTANT.DISCOVER_STATUS.ACCEPT) {
                    status = CONSTANT.DISCOVER_STATUS.ACCEPT
                }
                // if (checkDiscover.discover_status === CONSTANT.DISCOVER_STATUS.REJECT) {
                //     status = CONSTANT.DISCOVER_STATUS.REJECT;
                // }
                else {
                    status = CONSTANT.DISCOVER_STATUS.PENDING
                    // status = checkDiscover.discover_status
                    let updateObj: any = {}

                    //  || checkDiscover.userId.toString() === params.followerId.toString()
                    // if (checkDiscover.userId.toString() === params.followerId.toString() && checkDiscover.discover_status === CONSTANT.DISCOVER_STATUS.NO_ACTION) {
                    //     updateObj = {
                    //         discover_status: status,
                    //         userId: params.followerId,
                    //         followerId: userId.userId
                    //     }
                    // }
                    if (checkDiscover.userId.toString() !== userId.userId.toString() && checkDiscover.userId.toString() !== params.followerId.toString()) {
                        updateObj = {
                            discover_status: status,
                            userId: params.followerId,
                            followerId: userId.userId
                        }
                    }
                    else {
                        updateObj = {
                            discover_status: status,
                            userId: userId.userId,
                            followerId: params.followerId
                        }
                    }
                    discoverData = await discoverDao.updateDiscover({ _id: checkDiscover._id }, updateObj)
                    // }
                    //  } else {
                    // update
                    // status = CONSTANT.DISCOVER_STATUS.PENDING
                    // await discoverDao.updateDiscover({ _id: checkDiscover._id }, { discover_status: status, userId: userId.userId, followerId: params.followerId, })
                }
                let param: any = {}
                param["_id"] = params.followerId
                let getData = await discoverDao.getUserData(param, userId)
                getData.data[0].discover_status = status
                getData.data[0].user.discover_status = status

                // getData.data[0].user.discover_status = discoverData.userId === userId.userId ? true : false
                getData.data[0].user.isReqestSendByMe = discoverData.userId === userId.userId ? true : false;

                return homeConstants.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(getData.data[0])
            } else {
                params['userId'] = userId.userId
                const discoverID = await discoverDao.saveDiscover(params)
                let param: any = {}
                // param["_id"] = params.followerId
                param["_id"] = discoverID //params.followerId
                let getData = await discoverDao.getUserData(param, userId)
                console.log('getData', getData);

                getData.data[0].user.discover_status = CONSTANT.DISCOVER_STATUS.PENDING;
                getData.data[0].user.isReqestSendByMe = true


                params['title'] = 'Friend Request';
                params['body'] = {
                    user: {
                        name: (userId.firstName) + " " + (userId.lastName ? userId.lastName : ""),
                        userId: userId.userId,
                        // name: userId.firstName,
                        profilePicUrl: userId.profilePicUrl,
                        profession: userId.profession,
                        industryType: userId.industryType,
                        experience: userId.experience,
                        about: userId.about,
                        myConnection: userId.myConnection
                    }
                };
                params['category'] = config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_SEND.category;
                params['click_action'] = "FRIEND_REQUEST";
                params['message'] = `${userId.firstName} wants to connect with you`;
                params['type'] = config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_SEND.type;
                params['userId'] = params.followerId;

                const data1111 = notificationManager.sendOneToOneNotification(params, userId, true)

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
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

}
export const discoverController = new DiscoverController();