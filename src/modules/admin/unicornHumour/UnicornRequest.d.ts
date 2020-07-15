declare namespace UnicornRequest {

    export interface IUnicornAdd {
        title: string;
        description: string;
        // shortDescription: string;
        imageUrl: string;
        postedAt: string;
        isPostLater: boolean;
    }
    // userId: string,
    // categoryId: string,
    // likeCount: number,
    // totalComments: number,
    // title: string,
    // status: string
    // privacy: string



    export interface IUnicornById {
        Id: string;
    }

    export interface IGetUnicorn {
        limit: number;
        page: number;
        status: string;
        sortOrder: number;
        sortBy: string;
        fromDate: string;
        toDate: string;
        searchTerm: string;
    }

    export interface IUpdateUnicornStatus {
        status: string;
        Id: string;
    }

    export interface IUpdateUnicorn {
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