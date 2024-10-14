
import { describe, it, expect } from '@jest/globals';
import { parseSchema } from "../parseSchema";
import { Schema } from "../interface";
import { generateEnums, generateORMCode } from "../ormGenerator";
import { sampleYAML } from "./yaml.testData";


describe('Schema Generator', () => {
    let parsedSchema: Schema;

    beforeAll(async () => {
        parsedSchema = await parseSchema(sampleYAML);
    });



    describe('generateORMCode', () => {
        it('should generate valid ORM code with enums', () => {
            const ormCode = generateORMCode(parsedSchema);
            expect(ormCode).toContain('// Auto-generated Enums');
            expect(ormCode).toContain('export enum UserRole {');
            expect(ormCode).toContain('ADMIN = "ADMIN",');
            expect(ormCode).toContain('GENERAL = "GENERAL",');
            expect(ormCode).toContain('OPERATOR = "OPERATOR",');
            expect(ormCode).toContain('MANAGER = "MANAGER",');
            expect(ormCode).toContain('ACCOUNTING = "ACCOUNTING",');
            expect(ormCode).toContain('export enum PostStatus {');
            expect(ormCode).toContain('DRAFT = "DRAFT",');
            expect(ormCode).toContain('PUBLISHED = "PUBLISHED",');
            expect(ormCode).toContain('ARCHIVED = "ARCHIVED",');
        });

        it('should generate ORM classes for each model', () => {
            const ormCode = generateORMCode(parsedSchema);
            expect(ormCode).toContain('@Collection()');
            expect(ormCode).toContain('export class User {');
            expect(ormCode).toContain('export class Post {');
        });

        it('should correctly generate field decorators and types', () => {
            const ormCode = generateORMCode(parsedSchema);
            // User model fields
            expect(ormCode).toContain('@Property()\n  id: string;');
            expect(ormCode).toContain('@Property()\n  email: string;');
            expect(ormCode).toContain('@Property()\n  name: string;');
            expect(ormCode).toContain('@Property()\n  role: UserRole;');
            expect(ormCode).toContain('@Ref()\n  posts: Ref<Post>[];');
            expect(ormCode).toContain('@Property()\n  phoneNumbers: string[];');
            expect(ormCode).toContain('@Property()\n  authSecondFactor: string[];');
            expect(ormCode).toContain('@Property()\n  secondFactorEmail: string;');
            expect(ormCode).toContain('@Property()\n  createdAt: FirebaseFirestore.Timestamp;');
            expect(ormCode).toContain('@Property()\n  updatedAt: FirebaseFirestore.Timestamp;');

            // Post model fields
            expect(ormCode).toContain('@Property()\n  id: string;');
            expect(ormCode).toContain('@Property()\n  title: string;');
            expect(ormCode).toContain('@Property()\n  content: string;');
            expect(ormCode).toContain('@Property()\n  status: PostStatus;');
            expect(ormCode).toContain('@Property()\n  authorId: string;');
            expect(ormCode).toContain('@Ref()\n  author: Ref<User>;');
            expect(ormCode).toContain('@Property()\n  createdAt: FirebaseFirestore.Timestamp;');
            expect(ormCode).toContain('@Property()\n  updatedAt: FirebaseFirestore.Timestamp;');
        });
    });

    describe('generateEnums', () => {
        it('should generate correct TypeScript enums', () => {
            const enumsCode = generateEnums(parsedSchema);
            expect(enumsCode).toContain('export enum UserRole {');
            expect(enumsCode).toContain('ADMIN = "ADMIN",');
            expect(enumsCode).toContain('GENERAL = "GENERAL",');
            expect(enumsCode).toContain('OPERATOR = "OPERATOR",');
            expect(enumsCode).toContain('MANAGER = "MANAGER",');
            expect(enumsCode).toContain('ACCOUNTING = "ACCOUNTING",');

            expect(enumsCode).toContain('export enum PostStatus {');
            expect(enumsCode).toContain('DRAFT = "DRAFT",');
            expect(enumsCode).toContain('PUBLISHED = "PUBLISHED",');
            expect(enumsCode).toContain('ARCHIVED = "ARCHIVED",');
        });
    });
});