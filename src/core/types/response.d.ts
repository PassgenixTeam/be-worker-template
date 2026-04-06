export type TResponse<T> = {
    statusCode?: number;
    currentTimestamp?: number;
    data?: T;
    message?: string;
};

export type TPaginationMetadata = {
    page: number;
    take: number;
    totalItems: number;
    totalPages: number;
    itemCount: number;
};

export type TResponsePagination<T> = {
    items: T[];
    meta: {
        page: number;
        take: number;
        totalItems: number;
        totalPages: number;
        itemCount: number;
    };
};
