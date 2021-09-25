package publisher

import (
	"context"
	"encoding/json"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"log"
	"main.go/types"
)

var ctx = context.Background()

func Notify(messageType, message string) {
	var messages []types.Message
	uniqueId := uuid.NewString()
	client := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
	s, _ := client.Get(ctx, "notifications").Result()
	if len(s) > 0 {
		err := json.Unmarshal([]byte(s), &messages)
		if err != nil {
			log.Println(err)
		}
	}
	messages = append(messages, types.Message{Uuid: uniqueId, Type: messageType, Message: message})
	jsonMessages, _ := json.Marshal(messages)
	client.Set(ctx, "notifications", jsonMessages, 0)
	client.Publish(ctx, "notification", "")
	err := client.Close()
	if err != nil {
		log.Println(err)
	}
}
