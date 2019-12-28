import "reflect-metadata";
import { printType } from "graphql";

import { buildSchema, ObjectType, Field } from "@typegraphql/core";

describe("Fields types > explicitTypeFn", () => {
  it("should generate proper field signature in schema for explicit String type", async () => {
    @ObjectType()
    class SampleObject {
      @Field(_type => String)
      sampleField!: unknown;
    }

    const schema = await buildSchema({
      orphanedTypes: [SampleObject],
    });
    const sampleObjectType = schema.getType("SampleObject")!;

    expect(printType(sampleObjectType)).toMatchInlineSnapshot(`
      "type SampleObject {
        sampleField: String!
      }"
    `);
  });

  it("should generate proper field signature in schema for explicit Number type", async () => {
    @ObjectType()
    class SampleObject {
      @Field(_type => Number)
      sampleField!: unknown;
    }

    const schema = await buildSchema({
      orphanedTypes: [SampleObject],
    });
    const sampleObjectType = schema.getType("SampleObject")!;

    expect(printType(sampleObjectType)).toMatchInlineSnapshot(`
      "type SampleObject {
        sampleField: Float!
      }"
    `);
  });

  it("should generate proper field signature in schema for explicit Boolean type", async () => {
    @ObjectType()
    class SampleObject {
      @Field(_type => Boolean)
      sampleField!: unknown;
    }

    const schema = await buildSchema({
      orphanedTypes: [SampleObject],
    });
    const sampleObjectType = schema.getType("SampleObject")!;

    expect(printType(sampleObjectType)).toMatchInlineSnapshot(`
      "type SampleObject {
        sampleField: Boolean!
      }"
    `);
  });

  it("should generate proper field signature in schema for explicit string array type", async () => {
    @ObjectType()
    class SampleObject {
      @Field(_type => [String])
      sampleField!: unknown;
    }

    const schema = await buildSchema({
      orphanedTypes: [SampleObject],
    });
    const sampleObjectType = schema.getType("SampleObject")!;

    expect(printType(sampleObjectType)).toMatchInlineSnapshot(`
      "type SampleObject {
        sampleField: [String!]!
      }"
    `);
  });

  it("should generate proper field signature in schema for nested string array type", async () => {
    @ObjectType()
    class SampleObject {
      @Field(_type => [[[String]]])
      sampleField!: unknown;
    }

    const schema = await buildSchema({
      orphanedTypes: [SampleObject],
    });
    const sampleObjectType = schema.getType("SampleObject")!;

    expect(printType(sampleObjectType)).toMatchInlineSnapshot(`
      "type SampleObject {
        sampleField: [[[String!]!]!]!
      }"
    `);
  });

  it("should generate proper field signature in schema when using explicit String type in options", async () => {
    @ObjectType()
    class SampleObject {
      @Field({ typeFn: () => String })
      sampleField!: unknown;
    }

    const schema = await buildSchema({
      orphanedTypes: [SampleObject],
    });
    const sampleObjectType = schema.getType("SampleObject")!;

    expect(printType(sampleObjectType)).toMatchInlineSnapshot(`
      "type SampleObject {
        sampleField: String!
      }"
    `);
  });
});