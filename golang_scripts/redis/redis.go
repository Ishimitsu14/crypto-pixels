package redis

import (
	"context"
	"github.com/go-redis/redis/v8"
	"main.go/subscribers"
)

var ctx = context.Background()

func Subscribes()  {
	redisDatabase := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
	subscribers.OnResize(ctx, redisDatabase)
	subscribers.OnGenerate(ctx, redisDatabase)
}