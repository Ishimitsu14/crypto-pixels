export enum Rarities {
    Common = 40,
    Uncommon = 30,
    Rare = 20,
    Unique = 8,
    Legend = 2,
}

export type IGeneratedRarities = {
    [key: string] : { [key: string]: number }
}