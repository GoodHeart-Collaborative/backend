declare namespace GratitudeRequest {

    export interface GratitudeAdd {
        title: string;
        description: string;
        // shortDescription: string;
        imageUrl: string;
        postedAt: string;
        isPostLater: boolean;
    }

    export interface IgratitudeById {
        Id: string;
    }

    export interface IGetGratitude {
        limit: number,
        page: number,
        status: string;
        sortOrder: number;
        sortBy: string
        userId: string,
        fromDate: string,
        toDate: string,
        searchTerm: string,
    }


    export interface IUpdateStatus {
        status: string;
        Id: string;
    }

    export interface updateGratitude {
        Id: string
        status: string;
        title: string
        description: string
        imageUrl: string
        isPostLater: boolean,
        postedAt: string,
    }
}