declare namespace AdminRequest {

	export interface Create {
		name: string;
		email: string;
		password: string;
		created?: number;
	}

	export interface Login extends Device {
		email: string;
		password: string;
		salt: string;
		hash: string;
	}

	export interface Dashboard extends Filter {
		year?: string;
		month?: string;
		type: string;
	}

	export interface EditProfile {
		name: string;
		email: string;
	}

	export interface UserReportGraph extends Filter {
		year?: string;
		month?: string;
		type: string;
		platform?: string;
	}
}

declare namespace SubAdminRequest {

	export interface Create {
		name: string;
		email: string;
		password: string;
		created?: number;
		adminType?: string;
	}

	export interface Edit {
		name: string;
		email: string;
		password?: string;
		salt?: string;
		hash?: string;
		userId: string;
		permission: string[];
	}
}