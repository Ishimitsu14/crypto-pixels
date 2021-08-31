package migrations

import (
	"main.go/database"
)

func Migrate() error {
	db, err := database.ConnectToDB()

	// unable to connect to database
	if err != nil {
		return err
	}

	// ping to database
	_, err = db.DB()
	if err != nil {
		return err
	}

	_, err = UpProduct(db)
	if err != nil {
		return err
	}

	return nil
}
