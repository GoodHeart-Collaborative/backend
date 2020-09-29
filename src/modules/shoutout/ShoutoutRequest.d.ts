declare namespace ShoutoutRequest {
    export interface ShoutoutRequestAdd extends Device {
        description: string
        title: string
        privacy: string
        gif?: string
        members: string[]
    }
}