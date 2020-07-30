declare namespace ShoutoutRequest {
    export interface ShoutoutRequestAdd extends Device {
        description: string
        title: string
        members: string[]
    }
}