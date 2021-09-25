package utils

import (
	"archive/zip"
	"github.com/nfnt/resize"
	"golang.org/x/text/encoding/charmap"
	"image/png"
	"io"
	"io/ioutil"
	redisClient "main.go/publisher"
	"main.go/types"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

func ResizeSources(unzipInfo types.UnzipInfo) error {
	_ = os.RemoveAll("../assets")
	_ = os.RemoveAll("../source_tiles")
	_ = os.MkdirAll("../source_tiles", 0777)
	err := Unzip("../source_tiles_archives/" + unzipInfo.Zip, "../source_tiles")

	if err != nil {
		redisClient.Notify("error", "Can't unzip archive")
		return err
	}

	files, err := ioutil.ReadDir("../source_tiles")
	if err != nil {
		redisClient.Notify("error", "Can't read source tiles")
		return err
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
			redisClient.Notify("error", "Can't read dir by path: ../source_tiles/" + folder)
			return err
		}
		for _, file := range files {
			if file.IsDir() == true {
				mainFolders = append(mainFolders, folder + "/" + file.Name())
			} else {
				foldersAndFiles = append(foldersAndFiles, folder + "/" + file.Name())
			}
		}
	}

	for _, folder := range mainFolders {
		files, err := ioutil.ReadDir("../source_tiles/" + folder)
		if err != nil {
			redisClient.Notify("error", "Can't read dir by path: ../source_tiles/" + folder)
			return err
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
				redisClient.Notify("error", "Can't open path: " + path)
				return err
			}
			img, err := png.Decode(file)
			if err != nil {
				redisClient.Notify("error", "Can't decode file: " + path + "/" + file.Name())
				return err
			}
			_ = file.Close()

			width, _ := strconv.ParseUint(unzipInfo.Width, 0, 32)
			height, _ := strconv.ParseUint(unzipInfo.Height, 0, 32)
			m := resize.Resize(uint(width), uint(height), img, resize.NearestNeighbor)
			_ = os.MkdirAll(filepath.Dir("../assets/" + folder), 0777)
			out, err := os.Create("../assets/" + folder)
			if err != nil {
				redisClient.Notify("error", "Can't create asset by path: ../assets/" + folder)
				return err
			}
			defer func(out *os.File) {
				err := out.Close()
				if err != nil {
					redisClient.Notify("error", "Can't create connection")
				}
			}(out)
			_ = png.Encode(out, m)
		}
		if strings.HasSuffix(path, ".json") == true {
			input, err := ioutil.ReadFile(path)
			if err != nil {
				redisClient.Notify("error", "Can't read file: " + path)
			}
			_ = os.MkdirAll(filepath.Dir("../assets/" + folder), 0777)
			err = ioutil.WriteFile("../assets/" + folder, input, 0777)
			if err != nil {
				redisClient.Notify("error", "Can't create file: " + "../assets/" + folder)
			}
		}
	}
	return nil
}

func Unzip(src, dest string) error {
	r, err := zip.OpenReader(src)
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
		redisClient.Notify("error", err.Error())
		return err
	}

	// Closure to address file descriptors issue with all the deferred .Close() methods
	extractAndWriteFile := func(f *zip.File) error {
		rc, err := f.Open()
		var name = f.Name

		if strings.HasSuffix(f.Name, ".png") {
			name, _ = charmap.CodePage866.NewDecoder().String(f.Name)
		}

		if err != nil {
			return err
		}
		defer func() {
			if err := rc.Close(); err != nil {
				panic(err)
			}
		}()

		path := filepath.Join(dest, name)



		// Check for ZipSlip (Directory traversal)
		if !strings.HasPrefix(path, filepath.Clean(dest) + string(os.PathSeparator)) {
			redisClient.Notify("error", "illegal file path: " + path)
		}

		if f.FileInfo().IsDir() {
			err := os.MkdirAll(path, 0777)
			if err != nil {
				redisClient.Notify("error", "Can't create directory: " + path)
				return err
			}
		} else {
			err := os.MkdirAll(filepath.Dir(path), f.Mode())
			if err != nil {
				redisClient.Notify("error", "Can't create directory: " + filepath.Dir(path))
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