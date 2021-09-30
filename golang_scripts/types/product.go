package types

type GenerateData struct {
	ProductData []ProductData
	Count uint
}

type ProductData struct {
	Paths [][]string `json:"paths"`
	Hash string `json:"hash"`
	Attributes []ImageAttribute `json:"attributes"`
}

type Product struct {
	Uuid string `json:"uuid"`
	Hash string `json:"hash"`
	Attributes []ImageAttribute `json:"attributes"`
	Image string `json:"image"`
	Gif string `json:"gif"`
}

type OutputImage struct {
	Paths string `json:"paths"`
	Hash string `json:"hash"`
}

type ImageAttribute struct {
	TraitType string `json:"trait_type"`
	Value string `json:"value"`
}

// [ { hash: string, paths: [ [ {}, {}, {}, {} ], [ {}, {}, {}, {} ]] } ]