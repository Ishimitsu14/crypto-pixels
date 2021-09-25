package subscribers

import (
	"context"
	"encoding/json"
	"github.com/go-redis/redis/v8"
	"log"
	redisClient "main.go/publisher"
	"main.go/types"
	"main.go/utils"
)

func OnResize(ctx context.Context, client *redis.Client)  {
	subscribe := client.Subscribe(ctx, "resize:start")
	go func(ch <-chan *redis.Message) {
		for v := range ch {
			var unzipInfo types.UnzipInfo
			err := json.Unmarshal([]byte(v.Payload), &unzipInfo)
			if err != nil {
				redisClient.Notify("error", "Can't decode unzip information")
			}
			err = utils.ResizeSources(unzipInfo)
			if err != nil {
				log.Println(err)
			} else {
				client.Publish(ctx, "resize:end", "")
			}
		}
	}(subscribe.Channel())
}
