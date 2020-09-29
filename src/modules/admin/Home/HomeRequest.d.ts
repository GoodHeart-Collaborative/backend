declare namespace HomeRequest {

    export interface HomeRequestAdd extends Device {
        title: string,
        description: string,
        isPostLater: boolean,
        // imageUrl: string,
        postedAt: any,
        type: number;
        mediaType: number,
        mediaUrl: string;
        thumbnailUrl: string;
        addedBy: Object;
    }

    export interface IHomeById {
        Id: string;
        status: string;
    }

    export interface updateHome {
        Id: string;
        title: string,
        description: string,
        isPostLater: boolean,
        imageUrl: string,
        postedAt: Date,
        type: number;
        mediaType: number,
        mediaUrl: number
        addedBy: Object;
    }
    export interface updateStatus {
        Id: string;
        status: string;
    }
    export interface IgetHome {
        limit: number;
        page: number;
        status: string;
        sortOrder: number;
        sortBy: string;
        fromDate: string;
        toDate: string;
        searchTerm: string;
        type: number;
    }
}
