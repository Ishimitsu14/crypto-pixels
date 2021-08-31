package migrations

import (
	"gorm.io/gorm"
	"main.go/models"
)

func UpProduct(db *gorm.DB) (*gorm.DB, error) {
	// migration
	err := db.AutoMigrate(&models.Products{})
	if err != nil {
		return db, err
	}

	return db, nil
}
