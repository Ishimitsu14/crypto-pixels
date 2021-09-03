package utils

import (
	"github.com/ericpauley/go-quantize/quantize"
	"github.com/fogleman/gg"
	"github.com/google/uuid"
	image2 "image"
	"image/color"
	"image/draw"
	"image/gif"
	"image/png"
	"log"
	"main.go/types"
	"os"
	"strconv"
	"strings"
)

func GenerateAssets(imagePaths types.ImagePaths, width, height int) (string, string, string, string) {
	uniqueId := uuid.NewString()
	var gifPath string = ""
	var outPutImages []string
	for index, imagePath := range imagePaths.Paths {
		outPutImages = append(outPutImages, createImageFromImages(
			width,
			height,
			imagePath,
			"../products/" + uniqueId + "/",
			strconv.Itoa(index + 1) + ".png",
		))
	}

	if len(outPutImages) > 1 {
		gifPath, _ = createGif(outPutImages, "products", uniqueId, "product.gif")
	}
	log.Println("create")
	return uniqueId, imagePaths.Hash, strings.TrimLeft(outPutImages[0], "."), gifPath
}

func createImageFromImages(
	width int,
	height int,
	imagePaths []string,
	outputPath string,
	fileName string,
	) string {
	canvas := gg.NewContext(width, height)
	for _, imagePath := range imagePaths {
		f, err := os.Open(imagePath)
		if err != nil {
			log.Fatal(err)
		}
		defer func(f *os.File) {
			err := f.Close()
			if err != nil {
				log.Fatal(err)
			}
		}(f)
		image, _, err := image2.Decode(f)
		if err != nil {
			log.Fatal(err)
		}
		isExists, _ := exists(outputPath)
		if isExists == false {
			err := os.MkdirAll(outputPath, 0777)
			if err != nil {
				log.Fatal(err)
			}
		}
		canvas.DrawImage(image, 0, 0)
	}
	err := canvas.SavePNG(outputPath + fileName)
	if err != nil {
		log.Fatal(err)
	}
	return outputPath + fileName
}

func createGif(imagePaths []string, outputFolder, uniqueId, fileName string) (string, error) {
	var outputPath = "../" + outputFolder + "/" + uniqueId + "/" + fileName
	outGif := &gif.GIF{}
	for _, imagePath := range imagePaths {
		f, _ := os.Open(imagePath)
		pngImage, _ := png.Decode(f)
		err := f.Close()
		if err != nil {
			log.Fatal(err)
		}
		bounds := pngImage.Bounds()
		q := quantize.MedianCutQuantizer{}
		q.AddTransparent = true
		customPalette := q.Quantize(make([]color.Color, 0, 256), pngImage)
		paletteImage := image2.NewPaletted(bounds, customPalette)
		draw.Draw(paletteImage, paletteImage.Rect, pngImage, bounds.Min, draw.Over)
		outGif.Image = append(outGif.Image, paletteImage)
		outGif.Delay = append(outGif.Delay, 25)
	}
	f, _ := os.OpenFile(outputPath, os.O_WRONLY|os.O_CREATE, 0777)
	defer func(f *os.File) {
		err := f.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(f)
	err := gif.EncodeAll(f, outGif)
	if err != nil {
		return "", err
	}

	return "/" + outputFolder + "/" + uniqueId + "/" + fileName, nil
}

func exists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil { return true, nil }
	if os.IsNotExist(err) { return false, nil }
	return false, err
}
