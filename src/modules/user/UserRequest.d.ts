declare namespace UserRequest {

	export interface Signup extends Device {
		email?: string;
		password: string;
		countryCode?: string;
		mobileNo?: string;
		fullMobileNo: string;
		firstName: string;
		middleName: string;
		lastName: string;
		created?: number;
	}

	export interface Login extends Device {
		email?: string;
		password: string;
		countryCode?: string;
		mobileNo?: string;
		hash?: string;
	}

	export interface SocialLogin extends Device {
		socialId: string;
	}

	export interface SocialSignup extends Device {
		email?: string;
		countryCode?: string;
		mobileNo?: string;
		fullMobileNo?: string;
		firstName: string;
		middleName: string;
		lastName: string;
		socialLoginType: string;
		facebookId: string;
		isFacebookLogin: boolean;
		googleId: string;
		isGoogleLogin: boolean;
		socialId: string;
		dob: number;
		age: number;
		created: number;
	}

	export interface MultiBlock {
		userIds?: string[];
		status: string;
		userId: string;
	}

	export interface ImportUsers {
		file: any;
	}
}