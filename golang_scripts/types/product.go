package types

type GenerateData struct {
	ImagePaths []ImagePaths
	Count uint
}

type ImagePaths struct {
	Paths [][]string `json:"paths"`
	Hash string `json:"hash"`
	Attributes []ImageAttribute `json:"attributes"`
	Stats []string `json:"stats"`
}

type Product struct {
	Uuid string `json:"uuid"`
	Hash string `json:"hash"`
	Attributes []ImageAttribute `json:"attributes"`
	Image string `json:"image"`
	Gif string `json:"gif"`
	Stats []string `json:"stats"`
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