import { parseSchema } from "../parseSchema";
import { Schema } from "../interface";
import * as fs from 'fs-extra';
import * as path from 'path';

describe('Index Generator', () => {
    let parsedSchema: Schema;

    beforeAll(async () => {
        const schemaFilePath = path.resolve(__dirname, '../../sample/schema.yaml');
        const schemaContent = fs.readFileSync(schemaFilePath, 'utf-8');
        parsedSchema = await parseSchema(schemaContent);
    });

    it('should correctly parse index definitions from schema', () => {
        expect(parsedSchema.indexes).toEqual([
            {
                collectionGroup: "User",
                queryScope: "COLLECTION",
                fields: [
                    { fieldPath: "email", order: "ASCENDING" },
                    { fieldPath: "createdAt", order: "DESCENDING" }
                ]
            },
            {
                collectionGroup: "Post",
                queryScope: "COLLECTION",
                fields: [
                    { fieldPath: "status", order: "ASCENDING" },
                    { fieldPath: "createdAt", order: "DESCENDING" }
                ]
            }
        ]);
    });

    it('should generate firestore.indexes.json correctly', () => {
        const indexesJson = {
            indexes: parsedSchema.indexes,
            fieldOverrides: []
        };
        const expectedIndexesJson = {
            indexes: [
                {
                    collectionGroup: "User",
                    queryScope: "COLLECTION",
                    fields: [
                        { fieldPath: "email", order: "ASCENDING" },
                        { fieldPath: "createdAt", order: "DESCENDING" }
                    ]
                },
                {
                    collectionGroup: "Post",
                    queryScope: "COLLECTION",
                    fields: [
                        { fieldPath: "status", order: "ASCENDING" },
                        { fieldPath: "createdAt", order: "DESCENDING" }
                    ]
                }
            ],
            fieldOverrides: []
        };
        expect(indexesJson).toEqual(expectedIndexesJson);
    });
});
