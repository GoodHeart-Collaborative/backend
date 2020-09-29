declare namespace GratitudeJournalRequest {
    export interface AddGratitudeJournalRequest extends Device {
        description: string,
        privacy: string,
        mediaType: number,
        mediaUrl: string,
        thumbnailUrl: string
        postAt: string
        userId: string;
    }
    export interface EditGratitudeJournalRequest extends TokenData {
        description?: string,
        privacy?: string,
        mediaType?: number,
        mediaUrl?: string,
        thumbnailUrl?: string
        postAt?: string
    }
    export interface GetGratitudeJournalRequest extends Device {
        startDate: string,
        endDate: string
    }
}