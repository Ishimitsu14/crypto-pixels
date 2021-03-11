package main

import (
	"io/ioutil"
	"path/filepath"
	"github.com/nfnt/resize"
	"image/png"
	"log"
	"os"
)

func main()  {
	os.RemoveAll("../assets")

	files, err := ioutil.ReadDir("../source_titles")
	if err != nil {
		log.Fatal(err)
	}
	var folders []string
	var mainFolders []string
	var foldersAndFiles []string

	for _, file := range files {
		if file.IsDir() == true {
			folders = append(folders, file.Name())
		}
	}
	for _, folder := range folders {
		files, err := ioutil.ReadDir("../source_titles/" + folder)
		if err != nil {
			log.Fatal(err)
		}
		for _, file := range files {
			if file.IsDir() == true {
				mainFolders = append(mainFolders, folder + "/" + file.Name())
			}
		}
	}

	for _, folder := range mainFolders {
		files, err := ioutil.ReadDir("../source_titles/" + folder)
		if err != nil {
			log.Fatal(err)
		}
		for _, file := range files {
			if file.IsDir() == false {
				foldersAndFiles = append(foldersAndFiles, folder + "/" + file.Name())
			}
		}
	}

	for _, folder := range foldersAndFiles {
		file, err := os.Open("../source_titles/" + folder)
		if err != nil {
			log.Fatal(err)
		}
		img, err := png.Decode(file)
		if err != nil {
			log.Fatal(err)
		}
		_ = file.Close()

		m := resize.Resize(800, 800, img, resize.NearestNeighbor)
		_ = os.MkdirAll(filepath.Dir("../assets/" + folder), 0777)
		out, err := os.Create("../assets/" + folder)
		if err != nil {
			log.Fatal(err)
		}
		defer out.Close()
		_ = png.Encode(out, m)
	}

}