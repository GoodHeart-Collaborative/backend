declare namespace UnicornRequest {

    export interface UnicornAdd extends Device {
        userId: string,
        categoryId: string,
        likeCount: number,
        totalComments: number,
        title: string,
        status: string
        privacy: string
    }
}