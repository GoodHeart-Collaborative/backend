declare interface LoginHistoryRequest extends Device {
	isLogin?: boolean;
	lastLogin?: number;
	created?: number;
}