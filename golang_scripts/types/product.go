package types

type ImagePaths struct {
	Paths [][]string
	Hash string
	Attributes []ImageAttribute
}

type Product struct {
	Uuid string
	Hash string
	Attributes []ImageAttribute
	ImagePath string
	GifPath string
}

type OutputImage struct {
	Paths string
	Hash string
}

type ImageAttribute struct {
	TraitType string
	Value string
}

// [ { hash: string, paths: [ [ {}, {}, {}, {} ], [ {}, {}, {}, {} ]] } ]