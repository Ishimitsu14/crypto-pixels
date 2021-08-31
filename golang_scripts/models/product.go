package models

import (
	"time"
)

type Product struct {
	ID uint `gorm:"primaryKey"`
	Uuid string
	Path string
	Hash string
	MetaData string
	IsSelling bool
	CreatedAt time.Time
	UpdatedAt time.Time
	SellingAt time.Time
}

type Products []Product