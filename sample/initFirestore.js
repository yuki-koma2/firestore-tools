"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fireorm_1 = require("fireorm");
const admin = __importStar(require("firebase-admin"));
const serviceAccount = __importStar(require("../path-to-service-account.json")); // サービスアカウントキーのパス
const orm_1 = require("../orm");
// Firebase Admin SDKの初期化
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
// Fireormの初期化
(0, fireorm_1.initialize)(admin.firestore());
const userRepository = (0, fireorm_1.getRepository)(orm_1.User);
const postRepository = (0, fireorm_1.getRepository)(orm_1.Post);
// 新しいユーザーの作成
function createUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const user = new orm_1.User();
        user.id = 'unique-user-id';
        user.email = 'user@example.com'; // ユニークなメールアドレス
        user.name = 'John Doe';
        user.role = orm_1.UserRole.GENERAL;
        user.createdAt = admin.firestore.Timestamp.now();
        user.updatedAt = admin.firestore.Timestamp.now();
        const db = admin.firestore();
        // トランザクションを使用してユーザー作成とユニークインデックスの作成を同時に行う
        yield db.runTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const uniqueIndexRef = db.collection('UniqueIndexes').doc(`User.email/${user.email}`);
            const uniqueIndexDoc = yield transaction.get(uniqueIndexRef);
            if (uniqueIndexDoc.exists) {
                throw new Error('Email already exists');
            }
            // ユーザーの作成
            const userRef = db.collection('UserCollection').doc(user.id);
            transaction.set(userRef, user);
            // ユニークインデックスの作成
            transaction.set(uniqueIndexRef, { uid: user.id });
        }));
        console.log('User created:', user);
    });
}
// 新しいポストの作成
function createPost() {
    return __awaiter(this, void 0, void 0, function* () {
        const post = new orm_1.Post();
        post.id = 'unique-post-id';
        post.title = 'My First Post';
        post.content = 'This is the content of my first post.';
        post.status = orm_1.PostStatus.DRAFT;
        post.authorId = 'unique-user-id'; // 既存のUser.idを参照
        post.createdAt = admin.firestore.Timestamp.now();
        post.updatedAt = admin.firestore.Timestamp.now();
        const db = admin.firestore();
        // トランザクションを使用してポスト作成とユニークインデックスの作成を同時に行う
        yield db.runTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const postRef = db.collection('Post').doc(post.id);
            transaction.set(postRef, post);
            // リレーションの確認は既にセキュリティルールで行われているため、ここでは省略
        }));
        console.log('Post created:', post);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield createUser();
            yield createPost();
        }
        catch (e) {
            console.error('Error:', e.message);
        }
    });
}
main();
