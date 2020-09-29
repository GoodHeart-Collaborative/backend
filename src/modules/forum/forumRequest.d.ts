declare namespace UserForumRequest {

    export interface AddForum {
        categoryId: string,
        // categoryName: string, // only for searching
        // userId: string,
        // userStatus: string
        topic?: string,
        mediaUrl: string,
        description: string,
        postAnonymous: boolean

    }

    export interface GetForum {
        searchTerm: string;
        limit: number;
        page: number;
        status: string;
        sortBy: string,
        sortOrder: number,
        fromDate: Date,
        toDate: Date,
        categoryId: string
    }


    export interface UpdateForumStatus {
        postId: string;
        status: string
    }

    export interface UpdateForum {
        postId: string;
        categoryId: string,
        categoryName: string, // only for searching
        // userId: string,
        userStatus: string
        topic: string,
        mediaUrl: string,
        description: string,
        postAnonymous: boolean
    }
    export interface EditForum {
        postId: string;
        categoryId: string,
        topic: string,
        mediaUrl: string,
        description: string,
        postAnonymous: boolean
    }

}