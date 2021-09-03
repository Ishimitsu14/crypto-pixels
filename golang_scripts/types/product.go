package types

type ImagePaths struct {
	Paths [][]string
	Hash string
}

type Product struct {
	Uuid string
	Hash string
	ImagePath string
	GifPath string
}

type OutputImage struct {
	Paths string
	Hash string
}

// [ { hash: string, paths: [ [ {}, {}, {}, {} ], [ {}, {}, {}, {} ]] } ]