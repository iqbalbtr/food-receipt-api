export type QueryType = {
    take?: number;
    page?: number;
    order?: "date";
}

export type ListType<T> = {
    page: number;
    take: number;
    pageCount: number;
    list: T
} 