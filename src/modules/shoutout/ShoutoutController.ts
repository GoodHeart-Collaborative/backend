"use strict";
import * as shoutoutConstants from "./ShoutoutConstant";
import { shoutoutDao } from "./ShoutoutDao";
import { discoverDao } from '../discover/DiscoverDao'
import * as environment from '@config/environment'
import * as appUtils from "@utils/appUtils";
import * as notification from '@utils/NotificationManager';
import * as config from '@config/constant'
class ShoutoutController {

    /**
     * @function getDiscoverData
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    async getShoutoutData(params, userId) {
        try {
            let getData = await shoutoutDao.getShoutoutUpdatedData(params, userId)
            return shoutoutConstants.MESSAGES.SUCCESS.SHOUTOUT_DATA(getData)
        } catch (error) {
            throw error;
        }
    }
    async getShoutouMyConnection(userId, query?) {
        try {
            let response: any = {}
            let getData = await discoverDao.getDiscoverData({ ShoutoutConnection: true, ...query }, userId, true,);

            if (query.pageNo == 1) {
                response = {
                    greetWord: await appUtils.getShoutoutCard(),
                    list: getData['list'], //myconnection
                    "total": getData.total,
                    "page": getData.page,
                    "total_page": getData.total_page,
                    "next_hit": getData.next_hit,
                    "limit": getData.limit
                }
            } else {
                response = getData;
            }
            return shoutoutConstants.MESSAGES.SUCCESS.SHOUTOUT_DATA(response)
        } catch (error) {
            throw error;
        }
    }
    /**
     * @function saveDiscoverData
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    async saveShoutoutData(params: ShoutoutRequest.ShoutoutRequestAdd, userId) {
        try {
            // params['userId'] = userId.userId
            let members: any = []
            // params['membersDetail'] = await appUtils.createMembersArray(params.members)
            // delete params.members
            let memberss = await discoverDao.getShoutoutMyConnection(userId)
            members.push(await appUtils.toObjectId(userId.userId))
            if (memberss && memberss.length > 0) {
                for (let i = 0; i < memberss.length; i++) {
                    if (memberss[i].userId.toString() === userId.userId) {
                        members.push(memberss[i].followerId)
                    } else {
                        members.push(memberss[i].userId)
                    }
                }
            }
            let createArr: any = []
            for (let i = 0; i < params.members.length; i++) {
                createArr.push({
                    userId: userId.userId,
                    description: params.description,
                    title: params.title,
                    privacy: params.privacy,
                    gif: params.gif,
                    members: members,
                    createdAt: new Date(),
                    senderId: await appUtils.toObjectId(userId.userId),
                    receiverId: await appUtils.toObjectId(params.members[i])
                })
            }
            // params['members']          
            let checkDiscover = await shoutoutDao.saveBulkShoutout(createArr)
            const notificationData: any = {};
            notificationData['title'] = 'Friend_request';
            // notificationData['body'] = {
            //     userId: userId.userId,
            // };
            notificationData['category'] = config.CONSTANT.NOTIFICATION_CATEGORY.SHOUTOUT_TAGGED_ME.category;
            // notificationData['click_action'] = "FRIEND_REQUEST";
            notificationData['message'] = `${userId.firstName} send me a shout out `;
            notificationData['type'] = config.CONSTANT.NOTIFICATION_CATEGORY.SHOUTOUT_TAGGED_ME.type;
            notificationData['userId'] = ['5f32458da49d4610aeb6efd8'] // params.members;

            notification.notificationManager.sendOneToOneNotification(notificationData, userId, false)
            return shoutoutConstants.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(checkDiscover)
        } catch (error) {
            throw error;
        }
    }

}
export const shoutoutController = new ShoutoutController();