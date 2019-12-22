import MetadataBuilder from "@src/metadata/builder/MetadataBuilder";
import {
  GraphQLSchema,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFieldConfigMap,
  GraphQLOutputType,
} from "graphql";
import BuildSchemaOptions from "@src/schema/BuildSchemaOptions";
import ClassType from "@src/interfaces/ClassType";
import {
  wrapWithModifiers,
  convertTypeIfScalar,
} from "@src/schema/type-converting";
import TypeValue from "@src/interfaces/TypeValue";
import BuiltFieldMetadata from "@src/metadata/builder/definitions/FieldMetadata";
import { BuildedTypeMetadata } from "@src/metadata/builder/definitions/common";
import CannotDetermineOutputTypeError from "@src/errors/CannotDetermineOutputTypeError";
import {
  TargetMetadata,
  PropertyMetadata,
} from "@src/metadata/storage/definitions/common";

export default class SchemaGenerator {
  private readonly typeByClassMap = new Map<ClassType, GraphQLObjectType>();
  private readonly metadataBuilder: MetadataBuilder;

  constructor(private readonly buildSchemaOptions: BuildSchemaOptions) {
    this.metadataBuilder = new MetadataBuilder(buildSchemaOptions);
  }

  generate(): GraphQLSchema {
    return new GraphQLSchema({
      // TODO: replace placeholder query object type
      query: new GraphQLObjectType({
        name: "Query",
        fields: {
          hello: {
            type: GraphQLString,
            resolve: () => "Hello World",
          },
        },
      }),
      types: this.getOrphanedTypes(),
    });
  }

  private getOrphanedTypes(): GraphQLNamedType[] {
    return this.buildSchemaOptions.orphanedTypes.map(orphanedTypeClass =>
      this.getTypeByClass(orphanedTypeClass),
    );
  }

  private findTypeByClass(typeClass: ClassType): GraphQLObjectType | undefined {
    return this.typeByClassMap.get(typeClass);
  }

  private getTypeByClass(typeClass: ClassType): GraphQLObjectType {
    if (this.typeByClassMap.has(typeClass)) {
      return this.typeByClassMap.get(typeClass)!;
    }

    const objectTypeMetadata = this.metadataBuilder.getTypeMetadataByClass(
      typeClass,
    );

    const objectType = new GraphQLObjectType({
      name: objectTypeMetadata.schemaName,
      description: objectTypeMetadata.description,
      fields: this.getGraphQLFields(objectTypeMetadata.fields),
    });

    this.typeByClassMap.set(typeClass, objectType);
    return objectType;
  }

  private getGraphQLFields(
    fields: BuiltFieldMetadata[],
  ): GraphQLFieldConfigMap<unknown, unknown, unknown> {
    return fields.reduce<GraphQLFieldConfigMap<unknown, unknown, unknown>>(
      (fields, metadata) => {
        fields[metadata.schemaName] = {
          type: this.getGraphQLOutputType(metadata),
          description: metadata.description,
        };
        return fields;
      },
      {},
    );
  }

  private getGraphQLOutputType(
    metadata: TargetMetadata & PropertyMetadata & BuildedTypeMetadata,
  ): GraphQLOutputType {
    for (const foundType of this.findGraphQLOutputType(metadata.type.value)) {
      if (foundType) {
        return wrapWithModifiers(foundType, metadata.type.modifiers);
      }
    }

    throw new CannotDetermineOutputTypeError(metadata);
  }

  private *findGraphQLOutputType(
    typeValue: TypeValue,
  ): Generator<GraphQLOutputType | undefined, void, void> {
    yield convertTypeIfScalar(typeValue);
    if (typeof typeValue === "function") {
      yield this.findTypeByClass(typeValue as ClassType);
    }
  }
}
