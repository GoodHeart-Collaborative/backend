"use strict";
import * as shoutoutConstants from "./ShoutoutConstant";
import { shoutoutDao } from "./ShoutoutDao";
import { discoverDao } from  '../discover/DiscoverDao'
import * as environment from '@config/environment'
import * as appUtils from "@utils/appUtils";

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
    async getShoutouMyConnection(userId) {
        try {
            let response:any = {}
           let getData = await discoverDao.getDiscoverData({ShoutoutConnection: true}, userId, true)
           response = {
            greetWord:  await appUtils.getShoutoutCard(),
            data: getData, //myconnection
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
            params['userId'] = userId.userId
            let members:any = []
            // params['membersDetail'] = await appUtils.createMembersArray(params.members)
            // delete params.members
            let memberss = await discoverDao.getShoutoutMyConnection(userId)
            members.push(await appUtils.toObjectId(userId.userId))
            if(memberss && memberss.length > 0) {
                for (let i = 0; i < memberss.length; i++) {
                    if(memberss[i].userId.toString() === userId.userId) {
                        members.push(memberss[i].followerId)
                    } else {
                        members.push(memberss[i].userId)
                    }
                }
            }
            let createArr:any  = []
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
            
            let checkDiscover = await shoutoutDao.saveBulkShoutout(createArr)
            return shoutoutConstants.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(checkDiscover)
        } catch (error) {
            throw error;
        }
    }
    
}
export const shoutoutController = new ShoutoutController();