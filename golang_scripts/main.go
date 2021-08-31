package main

import (
	"github.com/joho/godotenv"
	"log"
	"main.go/database/migrations"
)

func main()  {
	err := godotenv.Load("../.env")

	if err != nil {
		log.Fatal(err)
	}
	err = migrations.Migrate()

	if err != nil {
		log.Fatal(err)
	}
	err = Subscribes()

	if err != nil {
		log.Fatal(err)
	}
	//subscriber, err := redis.Dial("tcp", "localhost:6379")
	//if err != nil {
	//	log.Println(err)
	//}
	//
	//redisConnect := redis.PubSubConn{Conn: subscriber}
	//err = redisConnect.Subscribe("resize")
	//if err != nil {
	//	log.Println(err)
	//}
	//for {
	//	switch v := redisConnect.Receive().(type) {
	//	case redis.Message:
	//		var size = strings.Split(string(v.Data), ",")
	//		width, _ := strconv.ParseUint(size[0], 0, 32)
	//		height, _ := strconv.ParseUint(size[1], 0, 32)
	//		resizeSources(uint(width), uint(height))
	//		log.Println("resize end")
	//	case redis.Subscription:
	//		log.Println("Subscribed on" + v.Channel)
	//	case redis.Error:
	//		log.Println(v)
	//	}
	//}
	//
	//log.Println("start")
	//var wg sync.WaitGroup
	//wg.Add(100)
	//for i := 0; i < 100; i++ {
	//	go func() {
	//		utils.GenerateAssets()
	//		defer wg.Done()
	//	}()
	//}
	//wg.Wait()
	//log.Println("end")
}