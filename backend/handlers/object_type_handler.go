package handlers

import (
	"app/backend/models"
	"app/backend/repositories"
	"app/backend/util"

	"github.com/adrg/xdg"
	"go.uber.org/zap"
)

type ObjectTypeHandler struct {
	objectTypeRepository   *repositories.ObjectTypeRepository
	propertyTypeRepository *repositories.PropertyTypeRepository
}

func NewObjectTypeHandler(objectTypeRepository *repositories.ObjectTypeRepository,
	propertyTypeRepository *repositories.PropertyTypeRepository,
) *ObjectTypeHandler {
	return &ObjectTypeHandler{objectTypeRepository, propertyTypeRepository}
}

// DEPRECATED
func getObjectTypeFilePath(objectTypeID string) (string, error) {
	filepath, err := xdg.DataFile("liha/ot-" + objectTypeID + ".json")
	if err != nil {
		return "", err
	}
	return filepath, nil
}

func (o *ObjectTypeHandler) GetAllObjectTypeIDs(logger *zap.Logger) ([]string, error) {
	objectTypeIDs, err := o.objectTypeRepository.GetObjectTypesIDs("")
	if err != nil {
		logger.Error("Error getting object types", zap.Error(err))
		return nil, err
	}
	return objectTypeIDs, nil
}

func (o *ObjectTypeHandler) GetObjectType(objectTypeID string, logger *zap.Logger) (*models.ObjectType, error) {
	objectType, err := o.objectTypeRepository.GetObjectType(objectTypeID)
	if err != nil {
		logger.Error("Error getting object type", zap.Error(err))
		return nil, err
	}
	propertyTypes, err := o.propertyTypeRepository.GetPropertyTypesOfObjectType(objectTypeID)
	if err != nil {
		logger.Error("Error getting property types of object type", zap.Error(err))
		return nil, err
	}
	propertyTypesMap := make(map[string]models.PropertyType)
	for _, propertyType := range *propertyTypes {
		propertyTypesMap[propertyType.ID] = propertyType
	}
	objectType.PropertyTypes = propertyTypesMap
	return objectType, nil
}

func (o *ObjectTypeHandler) CreateObjectType(objectType *models.ObjectType, logger *zap.Logger) error {
	err := o.objectTypeRepository.CreateObjectType(objectType)
	if err != nil {
		logger.Error("Error creating object type", zap.Error(err))
		return err
	}
	propertyTypesArray := make([]models.PropertyType, 0)
	for _, propertyType := range objectType.PropertyTypes {
		propertyTypesArray = append(propertyTypesArray, propertyType)
	}
	err = o.propertyTypeRepository.CreatePropertyTypes(&propertyTypesArray)
	if err != nil {
		logger.Error("Error creating property types", zap.Error(err))
		return err
	}
	return nil
}

func (o *ObjectTypeHandler) UpdateObjectType(objectType *models.ObjectType, logger *zap.Logger) error {
	err := o.objectTypeRepository.UpdateObjectType(objectType)
	if err != nil {
		logger.Error("Error updating object type", zap.Error(err))
		return err
	}
	return nil
}

// DEPRECATED
func ReadObjectTypeFile(objectTypeID string, logger *zap.Logger) (string, error) {
	path, err := getObjectTypeFilePath(objectTypeID)
	if err != nil {
		return "", err
	}
	return util.ReadJSONFile(path, logger)
}

// DEPRECATED
func WriteObjectTypeFile(objectTypeID string, objectType string, logger *zap.Logger) error {
	path, err := getObjectTypeFilePath(objectTypeID)
	if err != nil {
		logger.Error("Error getting object type file path", zap.Error(err))
		return err
	}
	return util.WriteJSONFile(path, objectType, logger)
}
