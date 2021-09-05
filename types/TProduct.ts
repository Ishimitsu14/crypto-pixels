export type IProductMetaData = {
    name: string;
    description: string;
    image: string;
    attributes: IProductAttributes[];
    external_url?: string;
}

export type IProductAttributes = {
    trait_type: string;
    value: string;
}