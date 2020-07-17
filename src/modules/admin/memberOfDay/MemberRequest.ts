declare namespace InspirationRequest {

    export interface InspirationAdd extends Device {
        userId: string,
        categoryId: string,
        likeCount: number,
        // totalComments: number,
        title: string,
        status: string
        privacy: string
    }
}