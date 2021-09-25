export type IGenerateProduct = {
    uuid: string;
    hash: string;
    attributes?: { trait_type: string; value: string }[];
    image: string;
    gif: string;
    stats: object[]
}

export type IImagePaths = {
    paths: string[][];
    hash: string;
    attributes?: IImageAttribute[];
    stats?: object[];
}

export type IImageAttribute = {
    trait_type: string;
    value: string;
}