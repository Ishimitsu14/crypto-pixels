package services

import (
	"main.go/dtos"
	"main.go/models"
	"main.go/repositories"
)

func CreateProduct(product *models.Product, repository repositories.ProductRepository) dtos.Response {
	operationResult := repository.Save(product)

	if operationResult.Error != nil {
		return dtos.Response{Success: false, Message: operationResult.Error.Error()}
	}

	var data = operationResult.Result.(*models.Product)

	return dtos.Response{Success: true, Data: data}
}

func FindAllProduct(repository repositories.ProductRepository) dtos.Response {
	operationResult := repository.FindAll()

	if operationResult.Error != nil {
		return dtos.Response{Success: false, Message: operationResult.Error.Error()}
	}

	var data = operationResult.Result.(*models.Products)

	return dtos.Response{Success: true, Data: data}
}

func FindOneProductById(id uint, repository repositories.ProductRepository) dtos.Response {
	operationResult := repository.FindOneById(id)

	if operationResult.Error != nil {
		return dtos.Response{Success: false, Message: operationResult.Error.Error()}
	}

	var data = operationResult.Result.(*models.Product)

	return dtos.Response{Success: true, Data: data}
}

func UpdateProductById(id uint, product *models.Product, repository repositories.ProductRepository) dtos.Response {
	existingContactResponse := FindOneProductById(id, repository)

	if !existingContactResponse.Success {
		return existingContactResponse
	}

	existingContact := existingContactResponse.Data.(*models.Product)

	existingContact.Uuid = product.Uuid
	existingContact.Path = product.Path
	existingContact.Hash = product.Hash
	existingContact.MetaData = product.MetaData
	existingContact.IsSelling = product.IsSelling
	existingContact.CreatedAt = product.CreatedAt
	existingContact.UpdatedAt = product.UpdatedAt
	existingContact.SellingAt = product.SellingAt

	operationResult := repository.Save(existingContact)

	if operationResult.Error != nil {
		return dtos.Response{Success: false, Message: operationResult.Error.Error()}
	}

	return dtos.Response{Success: true, Data: operationResult.Result}
}

func DeleteOneContactById(id uint, repository repositories.ProductRepository) dtos.Response {
	operationResult := repository.DeleteOneById(id)

	if operationResult.Error != nil {
		return dtos.Response{Success: false, Message: operationResult.Error.Error()}
	}

	return dtos.Response{Success: true}
}