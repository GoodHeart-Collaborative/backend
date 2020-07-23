declare namespace CategoryRequest {
    // export interface AdviceRequestAdd extends Device {
    export interface CategoryAdd extends Device {
        title: string;
        imageUrl: string;
        name?: string
    }

    export interface IAdviceGetById {
        Id: string;
    }

    export interface IGetCategory {
        limit: number;
        page: number;
        sortOrder: number;
        sortBy: string;
        searchTerm: string;
        status: string
        fromDate: Date;
        toDate: Date;
    }

    export interface IUpdateAdviceStatus {
        status: string;
        Id: string;
    }

    export interface IUpdateCategory {
        title: string;
        imageUrl: string;
        categoryId: string;
    }
}