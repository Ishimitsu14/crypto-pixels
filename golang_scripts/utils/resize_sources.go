package utils

import (
	"archive/zip"
	"fmt"
	"github.com/nfnt/resize"
	"image/png"
	"io"
	"io/ioutil"
	"log"
	"main.go/types"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

func ResizeSources(unzipInfo types.UnzipInfo)  {
	_ = os.RemoveAll("../assets")
	err := unzip(unzipInfo.Zip, "../source_tiles")
	if err != nil {
		log.Fatal(err)
	}

	files, err := ioutil.ReadDir("../source_tiles")
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
		files, err := ioutil.ReadDir("../source_tiles/" + folder)
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
		files, err := ioutil.ReadDir("../source_tiles/" + folder)
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
		var path = "../source_tiles/" + folder
		if strings.HasSuffix(path, ".png") == true {
			file, err := os.Open(path)
			if err != nil {
				log.Fatal(err)
			}
			img, err := png.Decode(file)
			if err != nil {
				log.Fatal(err)
			}
			_ = file.Close()

			width, _ := strconv.ParseUint(unzipInfo.Width, 0, 32)
			height, _ := strconv.ParseUint(unzipInfo.Height, 0, 32)
			m := resize.Resize(uint(width), uint(height), img, resize.NearestNeighbor)
			_ = os.MkdirAll(filepath.Dir("../assets/" + folder), 0777)
			out, err := os.Create("../assets/" + folder)
			if err != nil {
				log.Fatal(err)
			}
			defer func(out *os.File) {
				err := out.Close()
				if err != nil {
					log.Fatal(err)
				}
			}(out)
			_ = png.Encode(out, m)
		}
	}
}

func unzip(fileName, dest string) error {
	_ = os.RemoveAll("../source_tiles")
	_ = os.MkdirAll("../source_tiles", 0777)
	r, err := zip.OpenReader("../source_tiles_archives/" + fileName)
	if err != nil {
		return err
	}
	defer func() {
		if err := r.Close(); err != nil {
			panic(err)
		}
	}()

	err = os.MkdirAll(dest, 0777)
	if err != nil {
		return err
	}

	// Closure to address file descriptors issue with all the deferred .Close() methods
	extractAndWriteFile := func(f *zip.File) error {
		rc, err := f.Open()
		if err != nil {
			return err
		}
		defer func() {
			if err := rc.Close(); err != nil {
				panic(err)
			}
		}()

		path := filepath.Join(dest, f.Name)

		// Check for ZipSlip (Directory traversal)
		if !strings.HasPrefix(path, filepath.Clean(dest) + string(os.PathSeparator)) {
			return fmt.Errorf("illegal file path: %s", path)
		}

		if f.FileInfo().IsDir() {
			err := os.MkdirAll(path, f.Mode())
			if err != nil {
				return err
			}
		} else {
			err := os.MkdirAll(filepath.Dir(path), f.Mode())
			if err != nil {
				return err
			}
			f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
			if err != nil {
				return err
			}
			defer func() {
				if err := f.Close(); err != nil {
					panic(err)
				}
			}()

			_, err = io.Copy(f, rc)
			if err != nil {
				return err
			}
		}
		return nil
	}

	for _, f := range r.File {
		err := extractAndWriteFile(f)
		if err != nil {
			return err
		}
	}

	return nil
}