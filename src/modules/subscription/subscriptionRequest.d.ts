declare namespace Subscription {

    export interface AddSubscription {
        pageNo: number;
        limit: number;
        postId: string;
        commentId: string;
    }
}