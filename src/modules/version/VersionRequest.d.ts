declare namespace VersionRequest {

	export interface Id {
		versionId: string;
	}

	export interface Add {
		name: string;
		title: string;
		description: string;
		platform: string;
		updateType: string;
		isCurrentVersion: boolean;
		created: number;
	}

	export interface Edit extends Add, Id { }
}