package main

import (
	"main.go/subscribers"
	"github.com/gomodule/redigo/redis"
)

func Subscribes() error  {
	subscriber, err := redis.Dial("tcp", "localhost:6379")
	err = subscribers.OnResize(redis.PubSubConn{Conn: subscriber})

	if err != nil {
		return err
	}

	return nil
}
