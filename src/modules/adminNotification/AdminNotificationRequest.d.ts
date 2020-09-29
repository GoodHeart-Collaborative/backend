declare namespace AdminNotificationRequest {

	export interface Add {
		image: string;
		title: string;
		link: string;
		message: string;
		platform?: string;
		fromDate: number;
		toDate?: number;
		gender?: string;
		sentCount?: number;
		created: number;
	}

	export interface Edit extends Add, NotificationRequest.Id { }

	export interface Send {
		image?: string;
		title: string;
		link: string;
		message: string;
	}

	export interface SendBulkNotification extends NotificationRequest.Id { }
}