declare namespace SelfCareRequest {

    export interface location {
        type: string;
        coordinates: number[]
    }
    interface category {
        _id: string;
        name: string;
        imageUrl: string
    }

    export interface AddSelfCare {
        userId: string;
        reminderTime: number;
        isDaily: string;
        affirmationText: string,
        userType: string;
        category: category;
        isClosed: string;
        isComplete: string;
        isNotificationAllow: string;
        status: string;

    }

    export interface getSelfCare {
        categoryId: string;
        pageNo: number;
        limit: number;
        userId: string;
    }
}


