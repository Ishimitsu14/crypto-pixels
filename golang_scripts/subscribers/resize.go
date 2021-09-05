package subscribers

import (
	"context"
	"encoding/json"
	"github.com/go-redis/redis/v8"
	"log"
	"main.go/types"
	"main.go/utils"
)

func OnResize(ctx context.Context, client *redis.Client)  {
	subscribe := client.Subscribe(ctx, "resize:start")
	go func(ch <-chan *redis.Message) {
		for v := range ch {
			var unzipInfo types.UnzipInfo
			err := json.Unmarshal([]byte(v.Payload), &unzipInfo)
			if (err != nil) {
				log.Println(err)
			}
			utils.ResizeSources(unzipInfo)
			client.Publish(ctx, "resize:end", "")
		}
	}(subscribe.Channel())
}
