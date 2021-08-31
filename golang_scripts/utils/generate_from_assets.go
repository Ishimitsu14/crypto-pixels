package utils

import (
	"github.com/fogleman/gg"
	"github.com/google/uuid"
	image2 "image"
	"image/color/palette"
	"image/draw"
	"image/gif"
	"image/png"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"strconv"
	"time"
)

func GenerateAssets() {
	var paths []string
	var images [][]string
	uniqueId := uuid.NewString()
	folders, err := ioutil.ReadDir("../assets")
	if err != nil {
		log.Fatal(err)
	}
	for _, folder := range folders {
		subFolders, err := ioutil.ReadDir("../assets/" + folder.Name())
		if err != nil {
			log.Fatal(err)
		}
		paths = append(paths, "../assets/" + folder.Name() + "/" + strconv.Itoa(rangeIn(1, len(subFolders))))
	}
	for _, path := range paths {
		files, err := ioutil.ReadDir(path)
		if len(images) < len(files) {
			images = make([][]string, len(files))
		}
		if err != nil {
			log.Fatal(err)
		}
		for index, file := range files {
			images[index] = append(images[index], path + "/" + file.Name())
		}
	}
	var outPutImages []string
	for index, imagePaths := range images {
		outPutImages = append(outPutImages, createImageFromImages(
			400,
			400,
			imagePaths,
			"../punks/" + uniqueId + "/",
			strconv.Itoa(index + 1) + ".png",
		))
	}
	createGif(outPutImages, "../punks/" + uniqueId + "/punk.gif")
}

func createImageFromImages(width int, height int, imagePaths []string, outputPath string, fileName string) string {
	canvas := gg.NewContext(width, height)
	for _, imagePath := range imagePaths {
		f, err := os.Open(imagePath)
		if err != nil {
			log.Fatal(err)
		}
		defer func(f *os.File) {
			err := f.Close()
			if err != nil {

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

func createGif(imagePaths []string, outputPath string) {
	outGif := &gif.GIF{}
	for _, imagePath := range imagePaths {
		f, _ := os.Open(imagePath)
		pngImage, _ := png.Decode(f)
		err := f.Close()
		if err != nil {
			log.Fatal(err)
		}
		bounds := pngImage.Bounds()
		paletteImage := image2.NewPaletted(bounds, palette.WebSafe)
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
		log.Fatal(err)
	}
}

func rangeIn(min, max int) int {
	rand.Seed(time.Now().UnixNano())
	return rand.Intn(max - min) + min
}

func exists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil { return true, nil }
	if os.IsNotExist(err) { return false, nil }
	return false, err
}
