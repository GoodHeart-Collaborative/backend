declare namespace AdminEventRequest {

    interface location {
        type: string,
        coordinates: number[]
    }
    export interface IEventAdd extends Device {
        // userId: string,
        // categoryId: Joi.string().required;
        // name: Joi.string(),
        // eventCategoryType?: string;
        // eventCategoryDisplayName?: string;
        eventCategoryName: string;
        created: number;
        title: string;
        privacy: string;
        startDate: number;
        endDate: number;
        price: number;
        imageUrl: string,
        eventUrl: string;
        location: location;
        address: string;
        eventCategoryId: string;
        allowSharing: number,
        description: string,
        isFeatured: number,
    }

    export interface IGetEvent {
        limit: number;
        page: number;
        searchTerm: string;
        fromDate: Date;
        toDate: Date;
        sortBy: string
        sortOrder: number;
        // categoryId: string().trim;
        status: string;
        userId: string;
        isExpired: boolean;
        isVirtual: boolean;
    }

    export interface IupdateStatus {
        Id: string;
        status: string;
    }

    export interface IUpdateEvent {
        eventCategoryType?: string;
        eventCategoryDisplayName?: string;
        eventId: string;
        title: string;
        privacy: string;
        startDate: number;
        endDate: number;
        price: number;
        imageUrl: string,
        eventUrl: string;
        location: location;
        address: string;
        eventCategoryId: string;
        //.allow([
        //     config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
        //     config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
        //     config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
        //     config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE
        // ]),
        isVirtual: boolean;
        allowSharing: number; //.default(true),
        description: string;
        isFeatured: number;
    }

    export interface IgetEventDetail {
        eventId: string;
    }
}

