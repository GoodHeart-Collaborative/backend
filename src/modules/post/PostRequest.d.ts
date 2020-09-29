declare namespace PostRequest {

    export interface PostAdd extends Device {
        userId: string,
        categoryId: string,
        likeCount: number,
        // totalComments: number,
        title: string,
        status: string
        privacy: string
    }
}