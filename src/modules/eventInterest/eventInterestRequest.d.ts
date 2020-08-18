declare namespace EventInterest {

    export interface AddInterest extends Device {
        type: number;
        eventId: string;
        userId: string;
    }

}