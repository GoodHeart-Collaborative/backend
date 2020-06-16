declare namespace ContactRequest {

	export interface Id {
		contactId: string;
	}

	export interface Add {
		contactName: string;
		mobileNo: string;
	}

	export interface Update {
		contactId: Id;
		contactName: string;
		mobileNo: string;
	}

	export interface Sync {
		addContact?: Array<Add>;
		updateContact?: Array<Update>;
		deleteContact?: string[];
		allContacts?: string[];
		profilePicture?: string;
		created?: number;
		userId?: string;
		mobileNo?: string;
	}
}