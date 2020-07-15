declare namespace AdviceRequest {
    // export interface AdviceRequestAdd extends Device {
    //     userId: string,
    //     categoryId: string,
    //     likeCount: number,
    //     totalComments: number,
    //     title: string,
    //     status: string
    //     privacy: string
    // }

    export interface IAdviceAdd {
        title: string;
        description: string;
        // shortDescription: string;
        imageUrl: string;
        postedAt: string;
        isPostLater: boolean;
    }

    export interface IAdviceGetById {
        Id: string;
    }

    export interface IGetAdvices {
        limit: number;
        page: number;
        status: string;
        sortOrder: number;
        sortBy: string;
        fromDate: string;
        toDate: string;
        searchTerm: string;
    }

    export interface IUpdateAdviceStatus {
        status: string;
        Id: string;
    }

    export interface IUpdateAdvice {
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