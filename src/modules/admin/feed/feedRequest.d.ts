declare namespace AdminFeedRequest {

    export interface IGetFeed {
        searchTerm: string;
        limit: number;
        page: number;
        type: number;
        status: string;
        sortBy: string;
        sortOrder: number;
        fromDate: Date,
        toDate: Date,
        privacy: string;
    }

    export interface adminUpdateFeedStatus {
        postId: string;
        status: string;
        type: number;
    }
}




