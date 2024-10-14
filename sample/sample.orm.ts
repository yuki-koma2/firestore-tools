// Auto-generated ORM models
import { Collection, Entity, Property, Ref } from 'fireorm';

// Auto-generated Enums
export enum UserRole {
    ADMIN = "ADMIN",
    GENERAL = "GENERAL",
    OPERATOR = "OPERATOR",
    MANAGER = "MANAGER",
    ACCOUNTING = "ACCOUNTING",
}

export enum ServiceType {
    FACILITY = "FACILITY",
    EMPTY = "EMPTY",
}

export enum PostStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

@Collection()
export class User {
    @Property()
    id: string;

    @Property()
    email: string; // @unique

    @Property()
    name: string;

    @Property()
    role: UserRole;

    @Property()
    phoneNumbers?: string[];

    @Property()
    authSecondFactor?: string[];

    @Property()
    secondFactorEmail?: string;

    @Property()
    createdAt: FirebaseFirestore.Timestamp;

    @Property()
    updatedAt: FirebaseFirestore.Timestamp;
}

@Collection()
export class Post {
    @Property()
    id: string;

    @Property()
    title: string;

    @Property()
    content: string;

    @Property()
    status: PostStatus;

    @Ref()
    author: Ref<User>;

    @Property()
    authorId: string;

    @Property()
    createdAt: FirebaseFirestore.Timestamp;

    @Property()
    updatedAt: FirebaseFirestore.Timestamp;
}

// 他のコレクションについても同様にモデルクラスを追加