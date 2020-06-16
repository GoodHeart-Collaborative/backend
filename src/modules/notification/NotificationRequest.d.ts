declare namespace NotificationRequest {

	export interface Id {
		notificationId?: string;
	}

	export interface Add {
		senderId?: string;
		receiverId: string[];
		title: string;
		message: string;
		type: string;
		created?: number;
	}
}