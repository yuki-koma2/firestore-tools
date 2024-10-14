import { describe, expect, it } from '@jest/globals';
import { parseSchema } from "../parseSchema";
import { Schema } from "../interface";
import { sampleYAML } from "./yaml.testData";


describe('Schema Generator', () => {
    let parsedSchema: Schema;

    beforeAll(async () => {
        parsedSchema = await parseSchema(sampleYAML);
    });

    describe('parseSchema', () => {
        it('should correctly parse enums', () => {
            expect(parsedSchema.enums).toEqual({
                UserRole: ['ADMIN', 'GENERAL', 'OPERATOR', 'MANAGER', 'ACCOUNTING'],
                ServiceType: [
                    'FACILITY',
                    'EMPTY',
                ],
                PostStatus: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
            });
        });

        it('should correctly parse models', () => {
            expect(parsedSchema.models).toHaveLength(2);

            const userModel = parsedSchema.models.find(model => model.name === 'UserCollection');
            expect(userModel).toBeDefined();
            expect(userModel?.fields).toHaveLength(10);

            const postModel = parsedSchema.models.find(model => model.name === 'PostCollection');
            expect(postModel).toBeDefined();
            expect(postModel?.fields).toHaveLength(8);
        });

        it('should correctly parse field properties', () => {
            const userModel = parsedSchema.models.find(model => model.name === 'UserCollection');
            expect(userModel).toBeDefined();

            const emailField = userModel?.fields.find(field => field.name === 'email');
            expect(emailField).toBeDefined();
            expect(emailField?.type).toBe('String');
            expect(emailField?.isRequired).toBe(true);
            expect(emailField?.isUnique).toBe(true);
            expect(emailField?.isList).toBe(false);
            expect(emailField?.isRelation).toBe(false);
            expect(emailField?.constraints).toBeUndefined();
            expect(emailField?.isReadOnly).toBe(false);
        });
    });

});