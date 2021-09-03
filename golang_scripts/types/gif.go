package types

type ImagePaths struct {
	Paths [][]string
	Hash string
}

type Gif struct {
	Uuid string
	Path string
	Hash string
}

type OutputImage struct {
	Paths string
	Hash string
}

// [ { hash: string, paths: [ [ {}, {}, {}, {} ], [ {}, {}, {}, {} ]] } ]