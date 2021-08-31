package subscribers

import (
	"github.com/gomodule/redigo/redis"
	"log"
	"main.go/utils"
	"strconv"
	"strings"
)

func OnResize(redisConnect redis.PubSubConn) error  {
	err := redisConnect.Subscribe("resize")
	if err != nil {
		return err
	}
	for {
		switch v := redisConnect.Receive().(type) {
		case redis.Message:
			var size = strings.Split(string(v.Data), ",")
			width, _ := strconv.ParseUint(size[0], 0, 32)
			height, _ := strconv.ParseUint(size[1], 0, 32)
			utils.ResizeSources(uint(width), uint(height))
			log.Println("resize end")
		case redis.Subscription:
			log.Println("Subscribed on" + v.Channel)
		case redis.Error:
			log.Println(v)
		}
	}
}
