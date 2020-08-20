declare namespace AdminExpertRequest {

    export interface expertAdd {

        categoryId: string[],
        name: string,
        email: string,
        profession: string,
        industry: string,
        bio: string;
        experience: string;
        profilePicUrl: string[],
    }

    export interface getExpert {
        limit: number,
        page: number,
        searchTerm: string,
        fromDate: string,
        toDate: string,
        sortBy: string
        sortOrder: number
        categoryId: string
        status: string;

    }

    export interface updateExpert {
        expertId: string;
        categoryId: string[];
        name: string;
        email: string;
        profession: string;
        industry: string;
        bio: string;
        experience: string;
        profilePicUrl: string[],
    }

    export interface updateStatus {
        expertId: string;
        status: string;
    }
}


