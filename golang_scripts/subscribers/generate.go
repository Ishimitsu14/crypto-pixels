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
	subscribe := client.Subscribe(ctx, "generate:start")
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
			client.Publish(ctx, "generate:end", jsonProducts)
		}
	}(subscribe.Channel())
}

func generateAssetsLoop(count int, imagePaths []types.ImagePaths, width, height int) []types.Product {
	var products []types.Product
	var waitGroup sync.WaitGroup
	goroutines := make(chan struct{}, 8)
	for i := 0; i < count; i++ {
		i := i
		goroutines <- struct{}{}
		waitGroup.Add(1)
		go func(goroutines <-chan struct{}) {
			uuid, imagePath, gifPath := utils.GenerateAssets(imagePaths[i], width, height)
			products = append(products, types.Product{
				Uuid: uuid,
				Hash: imagePaths[i].Hash,
				Attributes: imagePaths[i].Attributes,
				ImagePath: imagePath,
				GifPath: gifPath,
			})
			<-goroutines
			waitGroup.Done()
		}(goroutines)
	}
	waitGroup.Wait()
	return products
}