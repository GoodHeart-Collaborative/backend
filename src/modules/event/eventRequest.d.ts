declare namespace UserEventRequest {

    export interface location {
        type: string;
        coordinates: number[]
    }
    export interface AddEvent {
        title: string;
        privacy: string
        startDate: Date;
        endDate: Date;
        price: number,
        imageUrl: string,
        eventUrl: string,
        location: location,
        address: string;
        eventCategoryId: number;
        allowSharing: boolean,
        description: string,
        created: number;
        eventCategoryName: string;
    }

    export interface getExpert {
        expertId: string,
        categoryId: string,
        contentId: number;
        privacy: string;
        limit: number;
        page: number;
        searchTerm: string;
        fromDate: string;
        toDate: string;
        sortBy: string;
        sortOrder: number;
    }

    export interface getEvents {
        searchKey: string;
        longitude: number;
        latitude: number;
        distance: number;
        eventCategoryId: number;
        date: string;
        getIpfromNtwk: string;
        startDate: number;
        endDate: number;
        isVirtual: boolean;
    }

    export interface getEventDetail {
        eventId: string;
    }

    export interface getEventList {
        pageNo: number;
        limit: number;
        searchKey: string;
        longitude: number;
        latitude: number;
        distance: number;
        eventCategoryId: any;
        isFeaturedEvent: number;
        date: number;
        privacy: string;
        // getIpfromNtwk: string;
        // startDate: number;
        // endDate: number;
        isVirtual: boolean;
    }


    export interface updateEvent {
        eventId: string;
        title: string;
        startDate: Date;
        endDate: Date;
        price: number;
        imageUrl: string;
        eventUrl: string;
        address: string;
        eventCategoryId: string;
        allowSharing: number //boolean().default(true),
        description: string;
    }

    export interface updateStatus {
        postId: string;
        status: string
    }

    export interface userGetEvent {
        page: number;
        limit: number;
        type: number;
        category: string;
    }
}


