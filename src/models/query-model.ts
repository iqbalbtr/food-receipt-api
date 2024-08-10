export type QueryType = {
    take?: number;
    page?: number;
    order?: "date" | "popular";
    user?: string;
    q?: string;
}

export type CommentQueryType = {
    take?: number;
    page?: number;
}

export type ListType<T> = {
    page: number;
    take: number;
    pageCount: number;
    itemCount: number;
    list: T
} 