declare namespace MemberRequest {

    export interface MemberAdd extends Device {
        userId: string,
        categoryId: string,
        likeCount: number,
        // totalComments: number,
        title: string,
        status: string
        privacy: string
    }

    export interface memberDetail {
        Id: string;
    }

    export interface getMembers {
        limit: number,
        page: number,
        status: string;
        fromDate: number,
        toDate: number,
        searchTerm: string,
        sortOrder: number,
        sortBy: string
    }

    export interface addMember {
        userId: string,
        memberCreatedAt: any;
    }
}