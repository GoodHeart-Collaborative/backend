declare namespace AdminForumRequest {

    export interface AddForum {
        categoryId: string,
        categoryName: string, // only for searching
        // userId: string,
        userStatus: string
        topic: string,
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

}