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

func GenerateAssets(imagePaths types.ImagePaths, width, height int) (string, string, string, error) {
	uniqueId := uuid.NewString()
	var gifPath string = ""
	var outPutImages []string
	for index, imagePath := range imagePaths.Paths {
		outPutImage, err := createImageFromImages(
			width,
			height,
			imagePath,
			"../products/" + uniqueId + "/",
			strconv.Itoa(index + 1) + ".png",
		)
		if err != nil {
			return "", "", "", err
		}
		outPutImages = append(outPutImages, outPutImage)
	}

	if len(outPutImages) > 1 {
		gifPath, _ = createGif(outPutImages, "products", uniqueId, "product.gif")
	}
	return uniqueId, strings.TrimLeft(outPutImages[0], "."), gifPath, nil
}

func createImageFromImages(
	width int,
	height int,
	imagePaths []string,
	outputPath string,
	fileName string,
	) (string, error) {
	canvas := gg.NewContext(width, height)
	for _, imagePath := range imagePaths {
		f, err := os.Open(imagePath)
		if err != nil {
			redisClient.Notify("error", "Can't handle image by path: " + imagePath)
			return "", err
		}
		defer func(f *os.File) {
			err := f.Close()
			if err != nil {
				redisClient.Notify("error", "Can't close file connection by path: " + imagePath)
			}
		}(f)
		image, _, err := image2.Decode(f)
		if err != nil {
			redisClient.Notify("error", "Can't decode image by path: " + imagePath)
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

func createGif(imagePaths []string, outputFolder, uniqueId, fileName string) (string, error) {
	var outputPath = "../" + outputFolder + "/" + uniqueId + "/" + fileName
	outGif := &gif.GIF{}
	for _, imagePath := range imagePaths {
		f, _ := os.Open(imagePath)
		pngImage, _ := png.Decode(f)
		err := f.Close()
		if err != nil {
			redisClient.Notify("error", "Can't decode png image by path: " + imagePath)
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
