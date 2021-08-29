package main

import (
	"github.com/nfnt/resize"
	"github.com/gomodule/redigo/redis"
	"image/png"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func main()  {
	subscriber, err := redis.Dial("tcp", "localhost:6379")
	if err != nil {
		log.Println(err)
	}

	redisConnect := redis.PubSubConn{Conn: subscriber}
	err = redisConnect.Subscribe("resize")
	if err != nil {
		log.Println(err)
	}
	for {
		switch v := redisConnect.Receive().(type) {
		case redis.Message:
			log.Println("resize is start")
			onResize()
			log.Println("resize is end")
		case redis.Subscription:
			log.Println("subscription triggered")
		case redis.Error:
			log.Println(v)
		}
	}

}

func onResize()  {
	_ = os.RemoveAll("../assets")

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
		var path = "../source_titles/" + folder
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

			m := resize.Resize(400, 400, img, resize.NearestNeighbor)
			_ = os.MkdirAll(filepath.Dir("../assets/" + folder), 0777)
			out, err := os.Create("../assets/" + folder)
			if err != nil {
				log.Fatal(err)
			}
			defer out.Close()
			_ = png.Encode(out, m)
		}
	}
}