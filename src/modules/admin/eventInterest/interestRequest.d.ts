declare namespace AdminEventInterest {

    export interface GetInterest extends Device {
        type: number;
        eventId: string;
        userId: string;
        limit: number;
        page: number;
    }

}