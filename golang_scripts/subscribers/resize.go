package subscribers

import (
	"context"
	"github.com/go-redis/redis/v8"
	"main.go/utils"
	"strconv"
	"strings"
)

func OnResize(ctx context.Context, client *redis.Client)  {
	subscribe := client.Subscribe(ctx, "resize")
	go func(ch <-chan *redis.Message) {
		for v := range ch {
			var size = strings.Split(string(v.Payload), ",")
			width, _ := strconv.ParseUint(size[0], 0, 32)
			height, _ := strconv.ParseUint(size[1], 0, 32)
			utils.ResizeSources(uint(width), uint(height))
		}
	}(subscribe.Channel())
}
