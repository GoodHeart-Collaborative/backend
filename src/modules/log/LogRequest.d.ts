declare namespace LogRequest {

	export interface Add {
		collectionName: string;
		userId: string;
		data: object;
		crudAction: string;
		actionType: string;
		created: number;
	}
}