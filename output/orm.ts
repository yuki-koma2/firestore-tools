// Auto-generated ORM models
import { FieldValue, Timestamp } from "@firebase/firestore";
import { JsonValue } from "type-fest";

export type CollectionJson<T> = {
  [P in keyof T extends string ? keyof T : never]: JsonValue | FieldValue;
};

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

export class User {
  private readonly _id: string;
  private readonly _email: string;
  private readonly _name: string;
  private readonly _role: UserRole;
  private readonly _posts: string[];
  private readonly _phoneNumbers: string[];
  private readonly _authSecondFactor: string[];
  private readonly _secondFactorEmail: string;
  private readonly _createdAt: Timestamp;
  private readonly _updatedAt: Timestamp;

  constructor(
    id: string,
    email: string,
    name: string,
    role: UserRole,
    posts: string[],
    phoneNumbers?: string[],
    authSecondFactor?: string[],
    secondFactorEmail?: string,
    createdAt?: Timestamp,
    updatedAt?: Timestamp
  ) {
    this._id = id;
    this._email = email;
    this._name = name;
    this._role = role;
    this._posts = posts || [];
    this._phoneNumbers = phoneNumbers || [];
    this._authSecondFactor = authSecondFactor || [];
    this._secondFactorEmail = secondFactorEmail ?? '';
    this._createdAt = createdAt ?? new Timestamp(0, 0);
    this._updatedAt = updatedAt ?? new Timestamp(0, 0);
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get role(): UserRole {
    return this._role;
  }

  get posts(): string[] {
    return this._posts;
  }

  get phoneNumbers(): string[] {
    return this._phoneNumbers;
  }

  get authSecondFactor(): string[] {
    return this._authSecondFactor;
  }

  get secondFactorEmail(): string {
    return this._secondFactorEmail;
  }

  get createdAt(): Timestamp {
    return this._createdAt;
  }

  get updatedAt(): Timestamp {
    return this._updatedAt;
  }

  public static firestoreConverter: FirestoreDataConverter<User> = {
    toFirestore(instance: User): CollectionJson<User> {
      return {
        id: instance.id,
        email: instance.email,
        name: instance.name,
        role: instance.role,
        posts: instance.posts,
        phoneNumbers: instance.phoneNumbers,
        authSecondFactor: instance.authSecondFactor,
        secondFactorEmail: instance.secondFactorEmail,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,
      };
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): User {
      const data = snapshot.data(options);
      return new User(
        data.id,
        data.email,
        data.name,
        data.role,
        data.posts,
        data.phoneNumbers,
        data.authSecondFactor,
        data.secondFactorEmail,
        data.createdAt,
        data.updatedAt,
      );
    },
  };
}

export class Post {
  private readonly _id: string;
  private readonly _title: string;
  private readonly _content: string;
  private readonly _status: PostStatus;
  private readonly _authorId: string;
  private readonly _author: string | null;
  private readonly _createdAt: Timestamp;
  private readonly _updatedAt: Timestamp;

  constructor(
    id: string,
    title: string,
    content: string,
    status: PostStatus,
    authorId: string,
    author?: string | null,
    createdAt?: Timestamp,
    updatedAt?: Timestamp
  ) {
    this._id = id;
    this._title = title;
    this._content = content;
    this._status = status;
    this._authorId = authorId;
    this._author = author ?? null;
    this._createdAt = createdAt ?? new Timestamp(0, 0);
    this._updatedAt = updatedAt ?? new Timestamp(0, 0);
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get status(): PostStatus {
    return this._status;
  }

  get authorId(): string {
    return this._authorId;
  }

  get author(): string | null {
    return this._author;
  }

  get createdAt(): Timestamp {
    return this._createdAt;
  }

  get updatedAt(): Timestamp {
    return this._updatedAt;
  }

  public static firestoreConverter: FirestoreDataConverter<Post> = {
    toFirestore(instance: Post): CollectionJson<Post> {
      return {
        id: instance.id,
        title: instance.title,
        content: instance.content,
        status: instance.status,
        authorId: instance.authorId,
        author: instance.author,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,
      };
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Post {
      const data = snapshot.data(options);
      return new Post(
        data.id,
        data.title,
        data.content,
        data.status,
        data.authorId,
        data.author,
        data.createdAt,
        data.updatedAt,
      );
    },
  };
}

