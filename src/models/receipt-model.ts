export type createReceiptType = {
    title: string,
    description: string;
    sub_title?: string,
    contents: string,
    ingredients: string,
    tags?: string
}


export type ReceiptType = {
    id: number;
    receipt_liked: {
        user: {
            username: string;
        };
    }[];
    title: string;
    sub_title: string | null;
    creator: {
        username: string;
        profile: {
            name: string;
        } | null;
    };
}
