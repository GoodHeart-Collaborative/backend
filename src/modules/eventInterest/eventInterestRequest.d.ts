declare namespace EventInterest {

    export interface AddInterest extends Device {
        type: number;
        eventId: string;
        userId: string;
    }

    export interface interestAndGoingUser {
        page: number;
        limit: number;
        type: number;
        eventId: string;
    }
}