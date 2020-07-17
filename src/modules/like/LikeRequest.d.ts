declare namespace LikeRequest {
    export interface LikeTypeRequest extends Device {
        type:number
    }
    export interface AddLikeRequest extends LikeTypeRequest {
        postId: string,
        commentId?: string
    }
}