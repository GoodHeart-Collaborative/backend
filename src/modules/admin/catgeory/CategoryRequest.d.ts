declare namespace CategoryRequest {
    // export interface AdviceRequestAdd extends Device {
    export interface CategoryAdd extends Device {
        title: string;
        imageUrl: string;
        name?: string
    }

    export interface ICategoryById {
        categoryId: string;
    }

    export interface IGetCategory {
        categoryId: string;
        limit: number;
        page: number;
        sortOrder: number;
        sortBy: string;
        searchTerm: string;
        status: string
        fromDate: Date;
        toDate: Date;
        privacy: string;
    }

    export interface IUpdateCategoryStatus {
        status: string;
        categoryId: string;
    }

    export interface IUpdateCategory {
        title: string;
        imageUrl: string;
        categoryId: string;
    }
}