package subscribers

import (
	"context"
	"encoding/json"
	"github.com/go-redis/redis/v8"
	"log"
	"main.go/types"
	"main.go/utils"
	"strconv"
	"sync"
)

func OnGenerate(ctx context.Context, client *redis.Client)   {
	subscribe := client.Subscribe(ctx, "generate")
	go func(ch <-chan *redis.Message) {
		for v := range ch {
			var imagePaths []types.ImagePaths
			err := json.Unmarshal([]byte(v.Payload), &imagePaths)
			if err != nil {
				log.Println(err)
			}
			countString, _ := client.Get(ctx, "count_generate_images").Result()
			widthString, _ := client.Get(ctx, "width_generate_images").Result()
			heightString, _ := client.Get(ctx, "height_generate_images").Result()
			count, _ := strconv.ParseInt(countString, 0, 64)
			width, _ := strconv.ParseInt(widthString, 0, 64)
			height, _ := strconv.ParseInt(heightString, 0, 64)
			products := generateAssetsLoop(int(count), imagePaths, int(width), int(height))
			jsonProducts, err := json.Marshal(products)
			if err != nil {
				log.Println(err)
			}
			client.Publish(ctx, "products", jsonProducts)
		}
	}(subscribe.Channel())
}

func generateAssetsLoop(count int, imagePaths []types.ImagePaths, width, height int) []types.Gif {
	var products []types.Gif
	var waitGroup sync.WaitGroup
	waitGroup.Add(count)
	for i := 0; i < count; i++ {
		i := i
		go func() {
			uuid, path, imageHash := utils.GenerateAssets(imagePaths[i], width, height)
			products = append(products, types.Gif{ Uuid: uuid, Path: path, Hash: imageHash})
			defer waitGroup.Done()
		}()
	}
	waitGroup.Wait()
	return products
}
