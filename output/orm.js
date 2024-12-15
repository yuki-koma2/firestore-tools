"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = exports.User = exports.PostStatus = exports.ServiceType = exports.UserRole = void 0;
// Auto-generated ORM models
const firestore_1 = require("@firebase/firestore");
// Auto-generated Enums
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["GENERAL"] = "GENERAL";
    UserRole["OPERATOR"] = "OPERATOR";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["ACCOUNTING"] = "ACCOUNTING";
})(UserRole || (exports.UserRole = UserRole = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["FACILITY"] = "FACILITY";
    ServiceType["EMPTY"] = "EMPTY";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
var PostStatus;
(function (PostStatus) {
    PostStatus["DRAFT"] = "DRAFT";
    PostStatus["PUBLISHED"] = "PUBLISHED";
    PostStatus["ARCHIVED"] = "ARCHIVED";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
class User {
    constructor(id, email, name, role, posts, phoneNumbers, authSecondFactor, secondFactorEmail, createdAt, updatedAt) {
        this._id = id;
        this._email = email;
        this._name = name;
        this._role = role;
        this._posts = posts || [];
        this._phoneNumbers = phoneNumbers || [];
        this._authSecondFactor = authSecondFactor || [];
        this._secondFactorEmail = secondFactorEmail !== null && secondFactorEmail !== void 0 ? secondFactorEmail : '';
        this._createdAt = createdAt !== null && createdAt !== void 0 ? createdAt : new firestore_1.Timestamp(0, 0);
        this._updatedAt = updatedAt !== null && updatedAt !== void 0 ? updatedAt : new firestore_1.Timestamp(0, 0);
    }
    get id() {
        return this._id;
    }
    get email() {
        return this._email;
    }
    get name() {
        return this._name;
    }
    get role() {
        return this._role;
    }
    get posts() {
        return this._posts;
    }
    get phoneNumbers() {
        return this._phoneNumbers;
    }
    get authSecondFactor() {
        return this._authSecondFactor;
    }
    get secondFactorEmail() {
        return this._secondFactorEmail;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
}
exports.User = User;
User.firestoreConverter = {
    toFirestore(instance) {
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
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        return new User(data.id, data.email, data.name, data.role, data.posts, data.phoneNumbers, data.authSecondFactor, data.secondFactorEmail, data.createdAt, data.updatedAt);
    },
};
class Post {
    constructor(id, title, content, status, authorId, author, createdAt, updatedAt) {
        this._id = id;
        this._title = title;
        this._content = content;
        this._status = status;
        this._authorId = authorId;
        this._author = author !== null && author !== void 0 ? author : null;
        this._createdAt = createdAt !== null && createdAt !== void 0 ? createdAt : new firestore_1.Timestamp(0, 0);
        this._updatedAt = updatedAt !== null && updatedAt !== void 0 ? updatedAt : new firestore_1.Timestamp(0, 0);
    }
    get id() {
        return this._id;
    }
    get title() {
        return this._title;
    }
    get content() {
        return this._content;
    }
    get status() {
        return this._status;
    }
    get authorId() {
        return this._authorId;
    }
    get author() {
        return this._author;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
}
exports.Post = Post;
Post.firestoreConverter = {
    toFirestore(instance) {
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
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        return new Post(data.id, data.title, data.content, data.status, data.authorId, data.author, data.createdAt, data.updatedAt);
    },
};
