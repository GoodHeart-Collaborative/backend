
declare namespace CommentRequest {

    export interface getComments {

        pageNo: number;
        limit: number;
        postId: string;
        commentId: string;
        type: number;
    }

}
