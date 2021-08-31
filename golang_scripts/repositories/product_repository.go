package repositories

import (
	"gorm.io/gorm"
	"main.go/models"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) Save(product *models.Product) RepositoryResult {
	err := r.db.Save(product).Error

	if err != nil {
		return RepositoryResult{Error: err}
	}

	return RepositoryResult{Result: product}
}

func (r *ProductRepository) FindAll() RepositoryResult {
	var Products models.Products

	err := r.db.Find(&Products).Error

	if err != nil {
		return RepositoryResult{Error: err}
	}

	return RepositoryResult{Result: &Products}
}

func (r *ProductRepository) FindOneById(id uint) RepositoryResult {
	var product models.Product

	err := r.db.Where(&models.Product{ID: id}).Take(&product).Error

	if err != nil {
		return RepositoryResult{Error: err}
	}

	return RepositoryResult{Result: &product}
}

func (r *ProductRepository) DeleteOneById(id uint) RepositoryResult {
	err := r.db.Delete(&models.Product{ID: id}).Error

	if err != nil {
		return RepositoryResult{Error: err}
	}

	return RepositoryResult{Result: nil}
}

func (r *ProductRepository) DeleteByIds(ids *[]string) RepositoryResult {
	err := r.db.Where("ID IN (?)", *ids).Delete(&models.Products{}).Error

	if err != nil {
		return RepositoryResult{Error: err}
	}

	return RepositoryResult{Result: nil}
}
