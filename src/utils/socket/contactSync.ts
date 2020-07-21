"use strict";

import * as config from "@config/constant";
import * as contactConstant from "@modules/contact/contactConstant";
import { contactController } from "@modules/contact/ContactController";
import { contactDao } from "@modules/contact/ContactDao";

export const contactSyncListeners = async function (socket) {
	/**
	 * @description we will receive contact request and add the contacts
	*/
	socket.on(config.CONSTANT.SOCKET.EVENT.CONTACT_SYNC, function (data) {
		console.log(config.CONSTANT.SOCKET.EVENT.CONTACT_SYNC + "========================>", JSON.stringify(data));
		contactSync(socket, data);
	});

	/**
	 * @description update all contacts
	 */
	socket.on(config.CONSTANT.SOCKET.EVENT.CONTACT_UPDATE, function (data) {
		console.log(config.CONSTANT.SOCKET.EVENT.CONTACT_UPDATE + "========================>", JSON.stringify(data));
		contactUpdate(socket, data);
	});

	/**
	 * @description delete the contacts
	 */
	socket.on(config.CONSTANT.SOCKET.EVENT.CONTACT_DELETE, function (data) {
		console.log(config.CONSTANT.SOCKET.EVENT.CONTACT_DELETE + "========================>", JSON.stringify(data));
		contactDelete(socket, data);
	});

	/**
	 * @description we will send list of contacts
	 */
	socket.on(config.CONSTANT.SOCKET.EVENT.CONTACT_FETCH, function (data) {
		console.log(config.CONSTANT.SOCKET.EVENT.CONTACT_FETCH + "========================>", JSON.stringify(data));
		contactFetch(socket);
	});
};

const contactSync = async (socket, data) => {
	try {
		const reqParams = { ...socket.user };
		const addContact = await contactController.addContact(data, reqParams);
		// if (addContact.contacts.length) {
		// 	addContact["statusCode"] = config.CONSTANT.HTTP_STATUS_CODE.CREATED;
		// 	socket.emit(config.CONSTANT.SOCKET.EVENT.CONTACT_SYNC, config.CONSTANT.SOCKET.SUCCESS.CONTACT_SYNCING(addContact));
		// } else {
		// 	addContact["statusCode"] = 210;
		// 	socket.emit(config.CONSTANT.SOCKET.EVENT.CONTACT_SYNC, config.CONSTANT.SOCKET.SUCCESS.CONTACT_SYNCING(addContact));
		// }
		console.log(JSON.stringify(config.CONSTANT.SOCKET.SUCCESS.CONTACT_SYNCING(addContact)));
	} catch (error) {
		socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.SOCKET.ERROR.SOCKET);
	}
};

const contactUpdate = async (socket, data) => {
	try {
		const reqParams = { ...socket.user };
		const updateContact = await contactController.updateContact(data, reqParams);
		if (updateContact.contacts.length) {
			updateContact["statusCode"] = config.CONSTANT.HTTP_STATUS_CODE.CREATED;
			socket.emit(config.CONSTANT.SOCKET.EVENT.CONTACT_UPDATE, config.CONSTANT.SOCKET.SUCCESS.CONTACT_SYNCING(updateContact));
		} else {
			updateContact["statusCode"] = 210;
			socket.emit(config.CONSTANT.SOCKET.EVENT.CONTACT_UPDATE, config.CONSTANT.SOCKET.SUCCESS.CONTACT_SYNCING(updateContact));
		}
	} catch (err) {
		socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.SOCKET.ERROR.SOCKET);
	}
};

const contactDelete = async (socket, data) => {
	try {
		const reqParams = { ...socket.user };
		const step1 = await contactController.deleteContact(data, reqParams);
		socket.emit(config.CONSTANT.SOCKET.EVENT.CONTACT_DELETE, contactConstant.MESSAGES.SUCCESS.CONTACT_SYNCING({}));
	} catch (err) {
		socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.SOCKET.ERROR.SOCKET);
	}
};

const contactFetch = async (socket) => {
	try {
		const reqParams = { ...socket.user };
		const step1 = await contactDao.contactList({}, reqParams);
		socket.emit(config.CONSTANT.SOCKET.EVENT.CONTACT_FETCH, config.CONSTANT.SOCKET.SUCCESS.CONTACT_SYNCING(step1));
	} catch (error) {
		socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.SOCKET.ERROR.SOCKET);
	}
};