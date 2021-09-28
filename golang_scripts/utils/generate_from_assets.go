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
	redisClient "main.go/publisher"
	"main.go/types"
	"os"
	"strconv"
	"strings"
)

func GenerateAssets(productData types.ProductData, width, height int) (string, string, string, error) {
	uniqueId := uuid.NewString()
	var gifPath string = ""
	var generatedPaths []string
	for index, paths := range productData.Paths {
		outPutImage, err := createImageFromImages(
			width,
			height,
			paths,
			"../products/" + uniqueId + "/",
			strconv.Itoa(index + 1) + ".png",
		)
		if err != nil {
			return "", "", "", err
		}
		generatedPaths = append(generatedPaths, outPutImage)
	}

	if len(generatedPaths) > 1 {
		gifPath, _ = createGif(generatedPaths, "products", uniqueId, "product.gif")
	}
	return uniqueId, strings.TrimLeft(generatedPaths[0], "."), gifPath, nil
}

func createImageFromImages(
	width int,
	height int,
	paths []string,
	outputPath string,
	fileName string,
	) (string, error) {
	canvas := gg.NewContext(width, height)
	for _, path := range paths {
		f, err := os.Open(path)
		if err != nil {
			redisClient.Notify("error", "Can't handle image by path: " + path)
			return "", err
		}
		defer func(f *os.File) {
			err := f.Close()
			if err != nil {
				redisClient.Notify("error", "Can't close file connection by path: " + path)
			}
		}(f)
		image, _, err := image2.Decode(f)
		if err != nil {
			redisClient.Notify("error", "Can't decode image by path: " + path)
			return "", err
		}
		isExists, _ := exists(outputPath)
		if isExists == false {
			err := os.MkdirAll(outputPath, 0777)
			if err != nil {
				redisClient.Notify("error", "Can't create folder: " + outputPath)
				return "", err
			}
		}
		canvas.DrawImage(image, 0, 0)
	}
	err := canvas.SavePNG(outputPath + fileName)
	if err != nil {
		redisClient.Notify("error", "Can't save canvas image by path: " + outputPath + fileName)
		return "", err
	}
	return outputPath + fileName, nil
}

func createGif(generatedPaths []string, outputFolder, uniqueId, fileName string) (string, error) {
	var outputPath = "../" + outputFolder + "/" + uniqueId + "/" + fileName
	outGif := &gif.GIF{}
	for _, generatedPath := range generatedPaths {
		f, _ := os.Open(generatedPath)
		pngImage, _ := png.Decode(f)
		err := f.Close()
		if err != nil {
			redisClient.Notify("error", "Can't decode png image by path: " + generatedPath)
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
			redisClient.Notify("error", "Can't close file connection")
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
