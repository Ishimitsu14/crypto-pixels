package subscribers

import (
	"context"
	"encoding/json"
	"github.com/go-redis/redis/v8"
	"log"
	redisClient "main.go/publisher"
	"main.go/types"
	"main.go/utils"
	"strconv"
	"sync"
)

func OnGenerate(ctx context.Context, client *redis.Client)   {
	subscribe := client.Subscribe(ctx, "generate:start")
	go func(ch <-chan *redis.Message) {
		for v := range ch {
			var generateData types.GenerateData
			err := json.Unmarshal([]byte(v.Payload), &generateData)
			if err != nil {
				redisClient.Notify("error", "Generated is crashed")
			}
			widthString, _ := client.Get(ctx, "width_images").Result()
			heightString, _ := client.Get(ctx, "height_images").Result()
			width, _ := strconv.ParseInt(widthString, 0, 64)
			height, _ := strconv.ParseInt(heightString, 0, 64)
			products, err := generateAssetsLoop(int(generateData.Count), generateData.ProductData, int(width), int(height))
			if err != nil {
				log.Println(err)
			} else {
				jsonProducts, err := json.Marshal(products)
				if err != nil {
					redisClient.Notify("error", "Generated is crashed")
				}
				client.Publish(ctx, "generate:end", jsonProducts)
			}
		}
	}(subscribe.Channel())
}

func generateAssetsLoop(count int, ProductData []types.ProductData, width, height int) ([]types.Product, error) {
	var err error = nil
	var products []types.Product
	var waitGroup sync.WaitGroup
	goroutines := make(chan struct{}, 20)
	for i := 0; i < count; i++ {
		i := i
		goroutines <- struct{}{}
		waitGroup.Add(1)
		go func(goroutines <-chan struct{}) {
			uuid, imagePath, gifPath, err := utils.GenerateAssets(ProductData[i], width, height)
			if err == nil  {
				products = append(products, types.Product{
					Uuid: uuid,
					Hash: ProductData[i].Hash,
					Attributes: ProductData[i].Attributes,
					Image: imagePath,
					Gif: gifPath,
					Stats: ProductData[i].Stats,
				})
				<-goroutines
				waitGroup.Done()
			}
		}(goroutines)
	}
	waitGroup.Wait()
	return products, err
}