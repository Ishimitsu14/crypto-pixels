export type IGenerateProduct = {
    uuid: string;
    hash: string;
    attributes?: { trait_type: string; value: string }[];
    image: string;
    gif: string;
    stats: object[]
}

export type IProductData = {
    paths: string[][];
    hash: string;
    attributes?: IImageAttribute[];
    stats?: string[];
}

export type IImageAttribute = {
    trait_type: string;
    value: string;
}