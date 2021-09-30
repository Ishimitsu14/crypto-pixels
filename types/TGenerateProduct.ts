export type IGenerateProduct = {
    uuid: string;
    hash: string;
    attributes?: { trait_type: string; value: string }[];
    image: string;
    gif: string;
}

export type IProductData = {
    paths: string[][];
    hash: string;
    attributes?: IImageAttribute[];
}

export type IImageAttribute = {
    trait_type: string;
    value: string;
}