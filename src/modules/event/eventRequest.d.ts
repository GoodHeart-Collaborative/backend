declare namespace UserEventRequest {

    export interface location {
        type: string;
        coordinates: number[]
    }
    export interface AddEvent {
        // userId: string,
        // categoryId: Joi.string().required(),
        // name: Joi.string(),
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
        eventCategoryType: string;
        eventCategoryDisplayName: string;
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

    export interface adminUpdateExpertPost {
        postId: string,
        topic: string;
        expertId: string;
        categoryId: string;
        price?: number;
        contentId: number
        mediaType: number
        description: string,
        mediaUrl: string,
        thumbnailUrl: string,
        privacy: string;
    }

    export interface updateStatus {
        postId: string;
        status: string
    }

    export interface userGetEvent {
        page: number;
        limit: number;
        type: string;
        category: string;
    }
}


