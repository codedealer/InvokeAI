import { FieldType } from 'features/nodes/types/field';
import { isEqual } from 'lodash-es';

/**
 * Validates that the source and target types are compatible for a connection.
 * @param sourceType The type of the source field.
 * @param targetType The type of the target field.
 * @returns True if the connection is valid, false otherwise.
 */
export const validateSourceAndTargetTypes = (
  sourceType: FieldType,
  targetType: FieldType
) => {
  // TODO: There's a bug with Collect -> Iterate nodes:
  // https://github.com/invoke-ai/InvokeAI/issues/3956
  // Once this is resolved, we can remove this check.
  if (
    sourceType.name === 'CollectionField' &&
    targetType.name === 'CollectionField'
  ) {
    return false;
  }

  if (isEqual(sourceType, targetType)) {
    return true;
  }

  /**
   * Connection types must be the same for a connection, with exceptions:
   * - CollectionItem can connect to any non-Collection
   * - Non-Collections can connect to CollectionItem
   * - Anything (non-Collections, Collections, Polymorphics) can connect to Polymorphics of the same base type
   * - Generic Collection can connect to any other Collection or Polymorphic
   * - Any Collection can connect to a Generic Collection
   */

  const isCollectionItemToNonCollection =
    sourceType.name === 'CollectionItemField' && !targetType.isCollection;

  const isNonCollectionToCollectionItem =
    targetType.name === 'CollectionItemField' &&
    !sourceType.isCollection &&
    !sourceType.isPolymorphic;

  const isAnythingToPolymorphicOfSameBaseType =
    targetType.isPolymorphic && sourceType.name === targetType.name;

  const isGenericCollectionToAnyCollectionOrPolymorphic =
    sourceType.name === 'CollectionField' &&
    (targetType.isCollection || targetType.isPolymorphic);

  const isCollectionToGenericCollection =
    targetType.name === 'CollectionField' && sourceType.isCollection;

  const areBothTypesSingle =
    !sourceType.isCollection &&
    !sourceType.isPolymorphic &&
    !targetType.isCollection &&
    !targetType.isPolymorphic;

  const isIntToFloat =
    areBothTypesSingle &&
    sourceType.name === 'IntegerField' &&
    targetType.name === 'FloatField';

  const isIntOrFloatToString =
    areBothTypesSingle &&
    (sourceType.name === 'IntegerField' || sourceType.name === 'FloatField') &&
    targetType.name === 'StringField';

  const isTargetAnyType = targetType.name === 'AnyField';

  // One of these must be true for the connection to be valid
  return (
    isCollectionItemToNonCollection ||
    isNonCollectionToCollectionItem ||
    isAnythingToPolymorphicOfSameBaseType ||
    isGenericCollectionToAnyCollectionOrPolymorphic ||
    isCollectionToGenericCollection ||
    isIntToFloat ||
    isIntOrFloatToString ||
    isTargetAnyType
  );
};
