declare namespace InspirationRequest {

    export interface InspirationAdd {
        title: string;
        description: string;
        // shortDescription: string;
        imageUrl: string;
        postedAt: string;
        isPostLater: boolean;
    }

    export interface IGetInspirationById {
        Id: string;
    }

    export interface IGetInspirations {
        limit: number;
        page: number;
        status: string;
        sortOrder: number;
        sortBy: string;
        fromDate: string;
        toDate: string;
        searchTerm: string;
    }

    export interface IUpdateStatus {
        status: string;
        Id: string;
    }

    export interface IUpdateInpiration {
        Id: string;
        status: string;
        title: string;
        description: string,
        // shortDescription: string;
        imageUrl: string
        isPostLater: boolean
        postedAt: Date,
    }
}