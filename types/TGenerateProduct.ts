export type IGenerateProduct = {
    Uuid: string;
    Hash: string;
    Attributes?: { Name: string; Value: string }[];
    ImagePath: string;
    GifPath: string;
}

export type IImagePaths = {
    paths: string[][];
    hash: string;
    attributes?: IImageAttribute[];
}

export type IImageAttribute = {
    name: string;
    value: string;
}