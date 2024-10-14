import { beforeAll, describe, expect, it } from '@jest/globals';
import { parseSchema } from "../parseSchema";
import { Schema } from "../interface";
import { generateEnums, generateORMCode } from "../ormGenerator";
import { sampleYAML } from "./yaml.testData";

describe('ORM Generator', () => {
    let parsedSchema: Schema;

    beforeAll(async () => {
        parsedSchema = await parseSchema(sampleYAML);
    });

    describe('generateEnums', () => {
        it('should include the enums header comment', () => {
            const enumsCode = generateEnums(parsedSchema);
            expect(enumsCode).toContain('// Auto-generated Enums');
        });

        it('should generate UserRole enum correctly', () => {
            const enumsCode = generateEnums(parsedSchema);
            expect(enumsCode).toContain('export enum UserRole {');
            expect(enumsCode).toContain('  ADMIN = "ADMIN",');
            expect(enumsCode).toContain('  GENERAL = "GENERAL",');
            expect(enumsCode).toContain('  OPERATOR = "OPERATOR",');
            expect(enumsCode).toContain('  MANAGER = "MANAGER",');
            expect(enumsCode).toContain('  ACCOUNTING = "ACCOUNTING",');
            expect(enumsCode).toContain('}');
        });

        it('should generate ServiceType enum correctly', () => {
            const enumsCode = generateEnums(parsedSchema);
            expect(enumsCode).toContain('export enum ServiceType {');
            expect(enumsCode).toContain('  FACILITY = "FACILITY",');
            expect(enumsCode).toContain('  EMPTY = "EMPTY",');
            expect(enumsCode).toContain('}');
        });

        it('should generate PostStatus enum correctly', () => {
            const enumsCode = generateEnums(parsedSchema);
            expect(enumsCode).toContain('export enum PostStatus {');
            expect(enumsCode).toContain('  DRAFT = "DRAFT",');
            expect(enumsCode).toContain('  PUBLISHED = "PUBLISHED",');
            expect(enumsCode).toContain('  ARCHIVED = "ARCHIVED",');
            expect(enumsCode).toContain('}');
        });

        it('should handle multiple enums by generating each one', () => {
            const enumsCode = generateEnums(parsedSchema);
            const enumDeclarations = enumsCode.match(/export enum \w+ {/g);
            expect(enumDeclarations).toHaveLength(Object.keys(parsedSchema.enums).length);
        });

        it('should generate an empty enums section when no enums are present', () => {
            const emptySchema: Schema = {
                enums: {},
                models: []
            };
            const enumsCode = generateEnums(emptySchema);
            expect(enumsCode).toBe('// Auto-generated Enums\n');
        });
    });

    describe('generateORMCode', () => {
        it('should include FieldValue and Timestamp import statements', () => {
            const ormCode = generateORMCode(parsedSchema);
            expect(ormCode).toContain('import { FieldValue, Timestamp } from "@firebase/firestore";');
        });

        it('should include JsonValue import statement', () => {
            const ormCode = generateORMCode(parsedSchema);
            expect(ormCode).toContain('import { JsonValue } from "type-fest";');
        });

        it('should define CollectionJson type correctly', () => {
            const ormCode = generateORMCode(parsedSchema);
            const expectedType = `export type CollectionJson<T> = {
  [P in keyof T extends string ? keyof T : never]: JsonValue | FieldValue;
};\n\n`;
            expect(ormCode).toContain(expectedType);
        });

        it('should generate UserRole enum within ORM code correctly', () => {
            const ormCode = generateORMCode(parsedSchema);
            expect(ormCode).toContain('export enum UserRole {');
            expect(ormCode).toContain('  ADMIN = "ADMIN",');
            expect(ormCode).toContain('  GENERAL = "GENERAL",');
            expect(ormCode).toContain('  OPERATOR = "OPERATOR",');
            expect(ormCode).toContain('  MANAGER = "MANAGER",');
            expect(ormCode).toContain('  ACCOUNTING = "ACCOUNTING",');
            expect(ormCode).toContain('}');
        });

        it('should generate ServiceType enum within ORM code correctly', () => {
            const ormCode = generateORMCode(parsedSchema);
            expect(ormCode).toContain('export enum ServiceType {');
            expect(ormCode).toContain('  FACILITY = "FACILITY",');
            expect(ormCode).toContain('  EMPTY = "EMPTY",');
            expect(ormCode).toContain('}');
        });

        it('should generate PostStatus enum within ORM code correctly', () => {
            const ormCode = generateORMCode(parsedSchema);
            expect(ormCode).toContain('export enum PostStatus {');
            expect(ormCode).toContain('  DRAFT = "DRAFT",');
            expect(ormCode).toContain('  PUBLISHED = "PUBLISHED",');
            expect(ormCode).toContain('  ARCHIVED = "ARCHIVED",');
            expect(ormCode).toContain('}');
        });

        describe('Class Generation', () => {
            it('should declare UserCollection class', () => {
                const ormCode = generateORMCode(parsedSchema);
                expect(ormCode).toContain('export class UserCollection {');
            });

            it('should declare PostCollection class', () => {
                const ormCode = generateORMCode(parsedSchema);
                expect(ormCode).toContain('export class PostCollection {');
            });

            describe('UserCollection Class', () => {
                it('should declare private fields with correct types', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    // Expectation for each private field in UserCollection
                    expect(ormCode).toContain('  private readonly _id: string;');
                    expect(ormCode).toContain('  private readonly _email: string;');
                    expect(ormCode).toContain('  private readonly _name: string;');
                    expect(ormCode).toContain('  private readonly _role: UserRole;'); // isRequired: true
                    expect(ormCode).toContain('  private readonly _posts: string[];');
                    expect(ormCode).toContain('  private readonly _phoneNumbers: string[];');
                    expect(ormCode).toContain('  private readonly _authSecondFactor: string[];');
                    expect(ormCode).toContain('  private readonly _secondFactorEmail: string;');
                    expect(ormCode).toContain('  private readonly _createdAt: Timestamp;');
                    expect(ormCode).toContain('  private readonly _updatedAt: Timestamp;');
                });

                it('should generate the constructor with correct arguments', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    // Check constructor arguments for UserCollection
                    expect(ormCode).toContain('constructor(');
                    expect(ormCode).toContain('  id: string,');
                    expect(ormCode).toContain('  email: string,');
                    expect(ormCode).toContain('  name: string,');
                    expect(ormCode).toContain('  role: UserRole,');
                    expect(ormCode).toContain('  posts?: string[],'); // isRequired: false の時、配列型の場合は空なのかnullなのかundefinedなのか
                    expect(ormCode).toContain('  phoneNumbers?: string[],');
                    expect(ormCode).toContain('  authSecondFactor?: string[],');
                    expect(ormCode).toContain('  secondFactorEmail?: string,');
                    expect(ormCode).toContain('  createdAt?: Timestamp,');
                    expect(ormCode).toContain('  updatedAt?: Timestamp');
                    expect(ormCode).toContain(') {');
                });

                it('should initialize the fields correctly in the constructor', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    // Check field initializations for UserCollection
                    expect(ormCode).toContain('this._id = id;');
                    expect(ormCode).toContain('this._email = email;');
                    expect(ormCode).toContain('this._name = name;');
                    expect(ormCode).toContain('this._role = role;');
                    expect(ormCode).toContain('this._posts = posts ?? [];');
                    expect(ormCode).toContain('this._phoneNumbers = phoneNumbers ?? [];');
                    expect(ormCode).toContain('this._authSecondFactor = authSecondFactor ?? [];');
                    expect(ormCode).toContain('this._secondFactorEmail = secondFactorEmail ?? \'\';');
                    expect(ormCode).toContain('this._createdAt = createdAt ?? new Timestamp(0, 0);');
                    expect(ormCode).toContain('this._updatedAt = updatedAt ?? new Timestamp(0, 0);');
                });

                it('should generate getters with correct return types', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    // Check getters for UserCollection
                    expect(ormCode).toContain('get id(): string {');
                    expect(ormCode).toContain('  return this._id;');
                    expect(ormCode).toContain('get email(): string {');
                    expect(ormCode).toContain('  return this._email;');
                    expect(ormCode).toContain('get name(): string {');
                    expect(ormCode).toContain('  return this._name;');
                    expect(ormCode).toContain('get role(): UserRole {');
                    expect(ormCode).toContain('  return this._role;');
                    expect(ormCode).toContain('get posts(): string[] {');
                    expect(ormCode).toContain('  return this._posts;');
                    expect(ormCode).toContain('get phoneNumbers(): string[] {');
                    expect(ormCode).toContain('  return this._phoneNumbers;');
                    expect(ormCode).toContain('get authSecondFactor(): string[] {');
                    expect(ormCode).toContain('  return this._authSecondFactor;');
                    expect(ormCode).toContain('get secondFactorEmail(): string {');
                    expect(ormCode).toContain('  return this._secondFactorEmail;');
                    expect(ormCode).toContain('get createdAt(): Timestamp {');
                    expect(ormCode).toContain('  return this._createdAt;');
                    expect(ormCode).toContain('get updatedAt(): Timestamp {');
                    expect(ormCode).toContain('  return this._updatedAt;');
                });

                it('should generate FirestoreDataConverter.toFirestore correctly', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    expect(ormCode).toContain('toFirestore(instance: UserCollection): CollectionJson<UserCollection> {');
                    expect(ormCode).toContain('  return {');
                    expect(ormCode).toContain('    id: instance.id,');
                    expect(ormCode).toContain('    email: instance.email,');
                    expect(ormCode).toContain('    name: instance.name,');
                    expect(ormCode).toContain('    role: instance.role,');
                    expect(ormCode).toContain('    posts: instance.posts,');
                    expect(ormCode).toContain('    phoneNumbers: instance.phoneNumbers,');
                    expect(ormCode).toContain('    authSecondFactor: instance.authSecondFactor,');
                    expect(ormCode).toContain('    secondFactorEmail: instance.secondFactorEmail,');
                    expect(ormCode).toContain('    createdAt: instance.createdAt,');
                    expect(ormCode).toContain('    updatedAt: instance.updatedAt,');
                    expect(ormCode).toContain('  };');
                });

                it('should generate FirestoreDataConverter.fromFirestore correctly', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    expect(ormCode).toContain('fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UserCollection {');
                    expect(ormCode).toContain('  const data = snapshot.data(options);');
                    expect(ormCode).toContain('  return new UserCollection(');
                    expect(ormCode).toContain('    data.id,');
                    expect(ormCode).toContain('    data.email,');
                    expect(ormCode).toContain('    data.name,');
                    expect(ormCode).toContain('    data.role,');
                    expect(ormCode).toContain('    data.posts,');
                    expect(ormCode).toContain('    data.phoneNumbers,');
                    expect(ormCode).toContain('    data.authSecondFactor,');
                    expect(ormCode).toContain('    data.secondFactorEmail,');
                    expect(ormCode).toContain('    data.createdAt,');
                    expect(ormCode).toContain('    data.updatedAt,');
                    expect(ormCode).toContain('  );');
                });
            });

            describe('PostCollection Class', () => {
                it('should declare private fields with correct types', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    // Expectation for each private field in PostCollection
                    expect(ormCode).toContain('  private readonly _id: string;');
                    expect(ormCode).toContain('  private readonly _title: string;');
                    expect(ormCode).toContain('  private readonly _content: string;');
                    expect(ormCode).toContain('  private readonly _status: PostStatus;'); // isRequired: true
                    expect(ormCode).toContain('  private readonly _authorId: string;');
                    expect(ormCode).toContain('  private readonly _author: string | null;');
                    expect(ormCode).toContain('  private readonly _createdAt: Timestamp;');
                    expect(ormCode).toContain('  private readonly _updatedAt: Timestamp;');
                });

                it('should generate the constructor with correct arguments', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    // Check constructor arguments for PostCollection
                    expect(ormCode).toContain('constructor(');
                    expect(ormCode).toContain('  id: string,');
                    expect(ormCode).toContain('  title: string,');
                    expect(ormCode).toContain('  content: string,');
                    expect(ormCode).toContain('  status: PostStatus,');
                    expect(ormCode).toContain('  authorId: string,');
                    expect(ormCode).toContain('  author?: string | null,');
                    expect(ormCode).toContain('  createdAt?: Timestamp,');
                    expect(ormCode).toContain('  updatedAt?: Timestamp');
                    expect(ormCode).toContain(') {');
                });

                it('should initialize the fields correctly in the constructor', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    // Check field initializations for PostCollection
                    expect(ormCode).toContain('this._id = id;');
                    expect(ormCode).toContain('this._title = title;');
                    expect(ormCode).toContain('this._content = content;');
                    expect(ormCode).toContain('this._status = status;');
                    expect(ormCode).toContain('this._authorId = authorId;');
                    expect(ormCode).toContain('this._author = author ?? null;');
                    expect(ormCode).toContain('this._createdAt = createdAt ?? new Timestamp(0, 0);');
                    expect(ormCode).toContain('this._updatedAt = updatedAt ?? new Timestamp(0, 0);');
                });

                it('should generate getters with correct return types', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    // Check getters for PostCollection
                    expect(ormCode).toContain('get id(): string {');
                    expect(ormCode).toContain('  return this._id;');
                    expect(ormCode).toContain('get title(): string {');
                    expect(ormCode).toContain('  return this._title;');
                    expect(ormCode).toContain('get content(): string {');
                    expect(ormCode).toContain('  return this._content;');
                    expect(ormCode).toContain('get status(): PostStatus {');
                    expect(ormCode).toContain('  return this._status;');
                    expect(ormCode).toContain('get authorId(): string {');
                    expect(ormCode).toContain('  return this._authorId;');
                    expect(ormCode).toContain('get author(): string | null {');
                    expect(ormCode).toContain('  return this._author;');
                    expect(ormCode).toContain('get createdAt(): Timestamp {');
                    expect(ormCode).toContain('  return this._createdAt;');
                    expect(ormCode).toContain('get updatedAt(): Timestamp {');
                    expect(ormCode).toContain('  return this._updatedAt;');
                });

                it('should generate FirestoreDataConverter.toFirestore correctly', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    expect(ormCode).toContain('toFirestore(instance: PostCollection): CollectionJson<PostCollection> {');
                    expect(ormCode).toContain('  return {');
                    expect(ormCode).toContain('    id: instance.id,');
                    expect(ormCode).toContain('    title: instance.title,');
                    expect(ormCode).toContain('    content: instance.content,');
                    expect(ormCode).toContain('    status: instance.status,');
                    expect(ormCode).toContain('    authorId: instance.authorId,');
                    expect(ormCode).toContain('    author: instance.author,');
                    expect(ormCode).toContain('    createdAt: instance.createdAt,');
                    expect(ormCode).toContain('    updatedAt: instance.updatedAt,');
                    expect(ormCode).toContain('  };');
                });

                it('should generate FirestoreDataConverter.fromFirestore correctly', () => {
                    const ormCode = generateORMCode(parsedSchema);
                    expect(ormCode).toContain('fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): PostCollection {');
                    expect(ormCode).toContain('  const data = snapshot.data(options);');
                    expect(ormCode).toContain('  return new PostCollection(');
                    expect(ormCode).toContain('    data.id,');
                    expect(ormCode).toContain('    data.title,');
                    expect(ormCode).toContain('    data.content,');
                    expect(ormCode).toContain('    data.status,');
                    expect(ormCode).toContain('    data.authorId,');
                    expect(ormCode).toContain('    data.author,');
                    expect(ormCode).toContain('    data.createdAt,');
                    expect(ormCode).toContain('    data.updatedAt,');
                    expect(ormCode).toContain('  );');
                });
            });

            it('should handle empty models correctly by not declaring any classes', () => {
                const emptySchema: Schema = {
                    enums: {},
                    models: []
                };
                const ormCode = generateORMCode(emptySchema);
                expect(ormCode).toContain('import { FieldValue, Timestamp } from "@firebase/firestore";');
                expect(ormCode).toContain('import { JsonValue } from "type-fest";');
                expect(ormCode).toContain('export type CollectionJson<T> = {');
                expect(ormCode).toContain('// Auto-generated Enums\n');
                expect(ormCode).not.toContain('export class ');
            });
        });
    });
});