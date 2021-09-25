export type IProductMetaData = {
    name: string;
    description: string;
    image: string;
    attributes: IProductAttribute[];
    external_url?: string;
}

export type IProductAttribute = {
    trait_type: string;
    value: string;
}

export type IProductInfo = {
    name: string
    rarity: string
    stats?: object
}

export enum Rarities {
    Common = 50,
    Uncommon = 25,
    Rare = 15,
    Unique = 8,
    Legend = 2,
}