declare namespace AdminExpertPostRequest {

    export interface AddPost {
        expertId: string,
        categoryId: string;
        price: number;
        contentId: number;
        mediaType: number
        description: string;
        mediaUrl: string;
        thumbnailUrl: string;
        privacy: string
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
}


