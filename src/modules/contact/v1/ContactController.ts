"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";

import * as contactConstant from "@modules/contact/contactConstant";
import { contactDao } from "@modules/contact/v1/ContactDao";
import { userDao } from "@modules/user/v1/UserDao";

class ContactController {

	/**
	 * @function addContact
	 */
	async addContact(params: ContactRequest.Sync, tokenData: TokenData) {
		try {
			params.addContact = _.sortBy(params.addContact, "sno");
			params.addContact = params.addContact.filter((contact) => contact.mobileNo !== tokenData.countryCode + tokenData.mobileNo && contact.mobileNo !== tokenData.mobileNo); // filter our own number0
			const promiseResult = [];
			// const step1 = await new Promise(async function (resolve, reject) {
			// 	for (let i = 0; i < params.addContact.length; i++) {
			// 		const reqParams = {
			// 			"userId": tokenData.userId,
			// 			"mobileNo": params.addContact[i].mobileNo
			// 		};
			// 	const step2 = await userDao.contactSyncing(reqParams); // to check is app user
			// 	let contact: any = {};
			// 	contact = params.addContact[i];
			// 	if (step2) {
			// 		contact.appUserId = step2._id.toString();
			// 		contact.contactName = step2.fullName ? step2.fullName : contact.contactName;
			// 		contact.userId = tokenData.userId;
			// 		contact.deviceId = tokenData.deviceId;
			// 		contact.profilePicture = step2.profilePicture ? step2.profilePicture : "";
			// 		contact.isAppUser = true;
			// 		const step3 = await contactDao.addContact(contact);
			// 	} else {
			// 		contact = params.addContact[i];
			// 		contact.isAppUser = false;
			// 	}
			// 	delete contact.deviceId;
			// 	promiseResult.push(contact);
			// }
			// 	resolve(Promise.all(promiseResult));
			// });
			// const appContacts = promiseResult.filter(contact => contact.isAppUser === true);
			// if (promiseResult.length) {
			// 	return { "contacts": appContacts, "lastSno": promiseResult.length ? promiseResult[promiseResult.length - 1].sno : 0 };
			// } else {
			// 	return { "contacts": [], "lastSno": promiseResult ? promiseResult[promiseResult.length - 1].sno : 0 };
			// }
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateContact
	 */
	async updateContact(params: ContactRequest.Sync, tokenData: TokenData) {
		try {
			params.updateContact = _.sortBy(params.updateContact, "sno");
			params.updateContact = params.updateContact.filter((contact) => contact.mobileNo !== tokenData.countryCode + tokenData.mobileNo && contact.mobileNo !== tokenData.mobileNo); // filter our own number
			const promiseResult = [];
			const step1 = await new Promise(async function (resolve, reject) {
				for (let i = 0; i < params.updateContact.length; i++) {
					const reqParams = {
						"userId": tokenData.userId,
						"mobileNo": params.updateContact[i].mobileNo
					};
					// const step2 = await userDao.contactSyncing(reqParams); // to check is app user
					// let contact: any = {};
					// contact = params.updateContact[i];
					// contact.userId = tokenData.userId;
					// contact.deviceId = tokenData.deviceId;
					// if (step2) {
					// 	contact.appUserId = step2._id.toString();
					// 	contact.contactName = step2.fullName ? step2.fullName : contact.contactName;
					// 	contact.profilePicture = step2.profilePicture ? step2.profilePicture : "";
					// 	contact.isAppUser = true;
					// 	const step3 = await contactDao.updateContact(contact);
					// } else {
					// 	contact.isAppUser = false;
					// 	const step3 = await contactDao.removeContact(contact);
					// 	delete contact.contactId;
					// }
					// delete contact.deviceId;
					// promiseResult.push(contact);
				}
				resolve(Promise.all(promiseResult));
			});
			const appContacts = promiseResult.filter(contact => contact.isAppUser === true);
			if (promiseResult.length) {
				return { "contacts": appContacts, "lastSno": promiseResult.length ? promiseResult[promiseResult.length - 1].sno : 0 };
			} else {
				return { "contacts": [], "lastSno": promiseResult ? promiseResult[promiseResult.length - 1].sno : 0 };
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteContact
	 */
	deleteContact(params, tokenData: TokenData) {
		try {
			return contactDao.deleteContact(params, tokenData);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function contactSyncing
	 */
	async contactSyncing(params: ContactRequest.Sync, tokenData: TokenData) {
		try {
			const addContact1 = this.addContact(params, tokenData);
			const updateContact1 = this.updateContact(params, tokenData);
			const deleteContact1 = this.deleteContact(params, tokenData);

			const step1 = await promise.join(addContact1, updateContact1, deleteContact1);
			const allContacts = [];
			params.addContact.map(contact => allContacts.push(contact.mobileNo)); // merge addContact , updateContact into an array and push mobileNo field in an array
			params.updateContact.map(contact => allContacts.push(contact.mobileNo)); // merge addContact , updateContact into an array and push mobileNo field in an array

			params.allContacts = allContacts;
			const step2 = await contactDao.contactList(params, tokenData);
			let nonAppContacts1, nonAppContacts2 = [];
			nonAppContacts1 = step1[0].contacts.filter(contact => contact.isAppUser === false);
			nonAppContacts2 = step1[1].contacts.filter(contact => contact.isAppUser === false);
			return contactConstant.MESSAGES.SUCCESS.CONTACT_SYNCING({ "contactList": step2.concat(nonAppContacts1, nonAppContacts2) });
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function contactList
	 */
	async contactList(tokenData: TokenData) {
		try {
			const step1 = await contactDao.contactList({}, tokenData);
			return contactConstant.MESSAGES.SUCCESS.CONTACT_LIST({ "contactList": step1 });
		} catch (error) {
			throw error;
		}
	}
}

export const contactController = new ContactController();