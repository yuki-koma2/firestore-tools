import { initialize, getRepository } from 'fireorm'
import * as admin from 'firebase-admin'
import * as serviceAccount from '../path-to-service-account.json' // サービスアカウントキーのパス
import { User, Post, UserRole, PostStatus } from '../orm'

// Firebase Admin SDKの初期化
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
})

// Fireormの初期化
initialize(admin.firestore())

const userRepository = getRepository(User)
const postRepository = getRepository(Post)

// 新しいユーザーの作成
async function createUser() {
    const user = new User()
    user.id = 'unique-user-id'
    user.email = 'user@example.com' // ユニークなメールアドレス
    user.name = 'John Doe'
    user.role = UserRole.GENERAL
    user.createdAt = admin.firestore.Timestamp.now()
    user.updatedAt = admin.firestore.Timestamp.now()

    const db = admin.firestore()

    // トランザクションを使用してユーザー作成とユニークインデックスの作成を同時に行う
    await db.runTransaction(async (transaction) => {
        const uniqueIndexRef = db.collection('UniqueIndexes').doc(`User.email/${user.email}`)

        const uniqueIndexDoc = await transaction.get(uniqueIndexRef)
        if (uniqueIndexDoc.exists) {
            throw new Error('Email already exists')
        }

        // ユーザーの作成
        const userRef = db.collection('UserCollection').doc(user.id)
        transaction.set(userRef, user)

        // ユニークインデックスの作成
        transaction.set(uniqueIndexRef, { uid: user.id })
    })

    console.log('User created:', user)
}

// 新しいポストの作成
async function createPost() {
    const post = new Post()
    post.id = 'unique-post-id'
    post.title = 'My First Post'
    post.content = 'This is the content of my first post.'
    post.status = PostStatus.DRAFT
    post.authorId = 'unique-user-id' // 既存のUser.idを参照
    post.createdAt = admin.firestore.Timestamp.now()
    post.updatedAt = admin.firestore.Timestamp.now()

    const db = admin.firestore()

    // トランザクションを使用してポスト作成とユニークインデックスの作成を同時に行う
    await db.runTransaction(async (transaction) => {
        const postRef = db.collection('Post').doc(post.id)
        transaction.set(postRef, post)

        // リレーションの確認は既にセキュリティルールで行われているため、ここでは省略
    })

    console.log('Post created:', post)
}

async function main() {
    try {
        await createUser()
        await createPost()
    } catch (e) {
        console.error('Error:', e.message)
    }
}

main()