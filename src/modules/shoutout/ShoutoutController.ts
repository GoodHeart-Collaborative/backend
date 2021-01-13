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
            const memberAdded: any = [];
            let ids = [];
            let Ids1 = params.members.map(item => {
                ids.push(appUtils.toObjectId(item));
            });

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
                    userId: appUtils.toObjectId(userId.userId),
                    description: params.description,
                    title: params.title,
                    privacy: params.privacy,
                    gif: params.gif,
                    members: members,
                    createdAt: new Date(),
                    status: config.CONSTANT.STATUS.ACTIVE,
                    created: new Date().getTime(),
                    endTime: new Date().getTime() + (24 * 60 * 60 * 1000),
                    senderId: await appUtils.toObjectId(userId.userId),
                    receiverId: await appUtils.toObjectId(params.members[i]),
                    memberAdded: ids

                })
            }
            // params['members']          
            let checkDiscover = await shoutoutDao.saveBulkShoutout(createArr)
            const notificationData: any = {};
            notificationData['title'] = "Shoutout";;
            // notificationData['body'] = {
            //     userId: userId.userId,
            // };
            notificationData['category'] = config.CONSTANT.NOTIFICATION_CATEGORY.SHOUTOUT_TAGGED_ME.category;
            // notificationData['click_action'] = "FRIEND_REQUEST";
            notificationData['message'] = `${userId.firstName} has sent you a shoutout`;
            notificationData['type'] = config.CONSTANT.NOTIFICATION_CATEGORY.SHOUTOUT_TAGGED_ME.type;
            notificationData['members'] = params.members //['5f32458da49d4610aeb6efd8'] // params.members;

            notification.notificationManager.sendBulkNotification(notificationData, userId,)
            return shoutoutConstants.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(checkDiscover)
        } catch (error) {
            throw error;
        }
    }

}
export const shoutoutController = new ShoutoutController();