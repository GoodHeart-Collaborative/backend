declare namespace DiscoverRequest {
    export interface DiscoverRequestAdd extends Device {
        followerId: string
    }
    export interface DiscoverRequestEditParams {
        discoverId: string
    }
    export interface DiscoverRequestEdit extends Device, DiscoverRequestEditParams {
        discover_status: number
    }
}