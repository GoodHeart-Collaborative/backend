
declare namespace userExpertRequest {

    export interface IgetCategory extends Device {
        limit: number;
        page: number;
        searchTerm: string;
        screenType: string;
        type: number;
        latitude: number;
        longitude: number;
        distance: number;
        getIpfromNtwk: string;
    }

    export interface ICategoryRelatedExpert {
        limit: number;
        page: number;
        searchTerm: string;
        categoryId: string;
    }
    export interface IgetExpert {
        limit: number;
        page: number;
        searchTerm: string;
    }

    export interface IgetExpertRelatedPost {
        userId: string;
        limit: number;
        page: number;
        expertId: string;
        posted: number;
        contentType: string;

    }
    export interface IPostId {
        userId: string
        postId: string;
    }

    export interface expertSearch {
        searchKey: string;
        limit: number;
        pageNo: number;
    }

}

