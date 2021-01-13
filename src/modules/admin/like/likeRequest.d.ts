declare namespace LikeRequest {

    export interface AdminGetLikes {
        pageNo: number;
        limit: number;
        postId: string;
        commentId: string;
    }
}