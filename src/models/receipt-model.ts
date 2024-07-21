export type createReceiptType = {
    title: string,
    sub_title: string,
    content: string
}

export type updateReceiptType = {
    title: string,
    sub_title?: string,
    content?: string
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
