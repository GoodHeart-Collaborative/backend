declare namespace CommentRequest {

    export interface AddCommentRequest extends Device {
        postId: string;
        commentId?: string
        comment: string
        type: number
    }
}