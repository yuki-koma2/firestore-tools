import * as fs from 'fs-extra';
import * as path from 'path';
import { parse as parseYAML } from 'yaml';

// インターフェースの定義
interface EnumDefinition {
    [enumName: string]: string[];
}

interface FieldDefinition {
    name: string;
    type: string;
    isRequired: boolean;
    isUnique: boolean;
    isList: boolean;
    isRelation: boolean;
    relationModel?: string;
    constraints?: {
        maxLength?: number;
    }; // 文字列長などの制約
    isReadOnly: boolean; // Read-Onlyフィールドかどうか
}

interface ModelDefinition {
    name: string;
    fields: FieldDefinition[];
}

interface Schema {
    enums: EnumDefinition;
    models: ModelDefinition[];
}

// スキーマの読み込み
const SCHEMA_FILE = path.join(__dirname, 'schema.yaml');
const schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf-8');

// YAMLスキーマのパース
async function parseSchema(schema: string): Promise<Schema> {
    const parsed = parseYAML(schema);

    const enums: EnumDefinition = {};
    Object.keys(parsed.enums).forEach(enumName => {
        enums[enumName] = parsed.enums[enumName];
    });

    const models: ModelDefinition[] = Object.keys(parsed.models).map(modelName => {
        const model = parsed.models[modelName];
        const fields: FieldDefinition[] = model.fields.map((field: FieldDefinition)  => {
            const isRelation = field.isRelation || false;
            const constraints: { maxLength?: number } = {};
            let isReadOnly = field.isReadOnly || false;
            let isUnique = field.isUnique || false;

            if (field.constraints && field.constraints.maxLength) {
                constraints.maxLength = field.constraints.maxLength;
            }

            return {
                name: field.name,
                type: field.type,
                isRequired: field.isRequired || false,
                isUnique: isUnique,
                isList: field.isList || false,
                isRelation: isRelation,
                relationModel: field.relationModel || undefined,
                constraints: constraints,
                isReadOnly: isReadOnly,
            };
        });


        return {
            name: modelName,
            fields,
        };
    });

    return {
        enums,
        models,
    };
}

// FirestoreセキュリティルールやORMコード生成のロジックはそのまま

async function main() {
    const parsedSchema = await parseSchema(schemaContent);

    // Firestoreセキュリティルールの生成
    const firestoreRules = generateFirestoreRules(parsedSchema);
    fs.writeFileSync(path.join(__dirname, '..', 'firestore.rules'), firestoreRules);
    console.log(`Firestore rules generated at firestore.rules`);

    // ORMコードの生成
    const ormCode = generateORMCode(parsedSchema);
    fs.writeFileSync(path.join(__dirname, '..', 'orm.ts'), ormCode);
    console.log(`ORM code generated at orm.ts`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

// インターフェースの定義
// interface EnumDefinition {
//     [enumName: string]: string[]
// }

// interface FieldDefinition {
//     name: string
//     type: string
//     isRequired: boolean
//     isUnique: boolean
//     isList: boolean
//     isRelation: boolean
//     relationModel?: string
//     constraints?: any // 文字列長などの制約
//     isReadOnly: boolean // Read-Onlyフィールドかどうか
// }
//
// interface ModelDefinition {
//     name: string
//     fields: FieldDefinition[]
// }
//
// interface Schema {
//     enums: EnumDefinition
//     models: ModelDefinition[]
// }

// スキーマの読み込み
// const SCHEMA_FILE = path.join(__dirname, 'schema.prisma')
// const schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf-8')

// Prismaスキーマのパース
// async function parseSchema(schema: string): Promise<Schema> {
//     const parsed = await parse(schema, { experimental: true })
//
//     const enums: EnumDefinition = {}
//     parsed.datamodel.enums.forEach(e => {
//         enums[e.name] = e.values.map(v => v.name)
//     })
//
//     const models: ModelDefinition[] = parsed.datamodel.models.map(model => {
//         const fields: FieldDefinition[] = model.fields.map(field => {
//             const isRelation = field.relationName !== undefined
//             let constraints = {}
//             let isReadOnly = false
//             let isUnique = false
//
//             // カスタム属性の検出（@readonly, @unique）
//             if (field.attributes) {
//                 field.attributes.forEach(attr => {
//                     if (attr.name === 'readonly') {
//                         isReadOnly = true
//                     }
//                     if (attr.name === 'unique') {
//                         isUnique = true
//                     }
//                 })
//             }
//
//             if (field.type.startsWith('String') && field.dbName) {
//                 // Prismaで文字列の長さ制限を指定するにはカスタム属性が必要
//                 // ここでは簡易的に@db.VarChar(n)から長さを取得
//                 const lengthMatch = field.type.match(/String\((\d+)\)/)
//                 if (lengthMatch) {
//                     constraints['maxLength'] = parseInt(lengthMatch[1], 10)
//                 }
//             }
//
//             return {
//                 name: field.name,
//                 type: field.type.replace('[]', ''),
//                 isRequired: field.isRequired,
//                 isUnique: isUnique,
//                 isList: field.isList || false,
//                 isRelation,
//                 relationModel: isRelation
//                     ? field.type
//                         .replace('[]', '')
//                         .replace('@relation(fields: [', '')
//                         .split(')')[0]
//                     : undefined,
//                 constraints,
//                 isReadOnly,
//             }
//         })
//         return {
//             name: model.name,
//             fields,
//         }
//     })
//
//     return {
//         enums,
//         models,
//     }
// }

// Firestoreセキュリティルールの生成
function generateFirestoreRules(schema: Schema): string {
    let rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ======= グローバル関数 ==========
    function getRole(uid) {
        return get(/databases/$(database)/documents/UserCollection/$(uid)).data.role;
    }

    function isAdminOrOperator(uid) {
        return getRole(uid) == "ADMIN" || getRole(uid) == "OPERATOR";
    }

    function isAdmin(uid) {
        return getRole(uid) == "ADMIN";
    }

    // foreign key チェック
    function checkFK(documentId, collectionPath) {
        return exists(/databases/$(database)/documents/$(collectionPath)/$(documentId));
    }

    // 認証ステータスチェック
    function checkAuthenticationStatus(auth) {
        return (
            auth != null &&
            auth.token.firebase.sign_in_provider in ['password' , 'google.com'] &&
            auth.token.firebase.sign_in_provider != 'anonymous'
        );
    }

    // Enumバリデーション
    function validateEnum(field, enumValues) {
        return enumValues.hasAny(e => e == field);
    }

    // ======= ユニーク制約のための関数 ==========
    function checkUnique(field, value) {
        return !exists(/databases/$(database)/documents/UniqueIndexes/{field}/$(value));
    }

    function reserveUnique(field, value) {
        return exists(/databases/$(database)/documents/UniqueIndexes/{field}/$(value));
    }

    // ======= コレクションごとのバリデーション関数 ==========
    ${generateValidationFunctions(schema)}

    // ======= コレクションのルール ==========
    ${generateCollectionRules(schema)}

    // ======= ユニークインデックスコレクションのルール ==========
    match /UniqueIndexes/{field}/{value} {
      allow read: if false; // 読み取り禁止
      allow write: if request.auth != null && request.auth.token.role == "ADMIN";
    }
  }
}
`
    return rules
}

// バリデーション関数の生成
function generateValidationFunctions(schema: Schema): string {
    let functionsCode = ''

    // 各モデルごとのバリデーション関数を生成
    schema.models.forEach(model => {
        // Create用バリデーション関数
        functionsCode += `    function validate${model.name}Create(data) {\n`
        let createValidations: string[] = []

        model.fields.forEach(field => {
            let validation = ''

            if (field.isReadOnly) {
                // Read-Onlyフィールドは作成時に設定可能
                validation += `        data.${field.name} != null && `
            } else {
                // 必須フィールドのチェック
                if (field.isRequired) {
                    validation += `        data.${field.name} != null && `
                } else {
                    validation += `        (data.${field.name} == null || `
                }
            }

            // 型チェック
            switch (field.type) {
                case 'String':
                    validation += `data.${field.name} is string`
                    if (field.constraints && field.constraints.maxLength) {
                        validation += ` && data.${field.name}.size() <= ${field.constraints.maxLength}`
                    }
                    break
                case 'Int':
                case 'Float':
                    validation += `data.${field.name} is number`
                    break
                case 'Boolean':
                    validation += `data.${field.name} is bool`
                    break
                case 'DateTime':
                    validation += `data.${field.name} is timestamp`
                    break
                default:
                    if (schema.enums[field.type]) {
                        validation += `validateEnum(data.${field.name}, [${schema.enums[field.type].map(v => `"${v}"`).join(', ')}])`
                    } else if (field.isRelation && field.relationModel) {
                        // リファレンスチェック
                        validation += `data.${field.name} is string && checkFK(data.${field.name}, "${field.relationModel}Collection")`
                    } else {
                        validation += `true` // その他の型は基本チェックのみ
                    }
            }

            // 必須フィールドでない場合の閉じ括弧
            if (!field.isRequired) {
                validation += `)`
            }

            // ユニーク制約のチェック
            if (field.isUnique) {
                validation += ` && checkUnique("${model.name}.${field.name}", data.${field.name})`
            }

            createValidations.push(validation)
        })

        // 全てのフィールドのチェックをANDで繋ぐ
        functionsCode += `        return ${createValidations.join(' && ')};\n`
        functionsCode += `    }\n\n`

        // Update用バリデーション関数
        functionsCode += `    function validate${model.name}Update(data, existingData) {\n`
        let updateValidations: string[] = []

        model.fields.forEach(field => {
            if (field.isReadOnly) {
                // Read-Onlyフィールドが変更されていないことを確認
                updateValidations.push(`        data.${field.name} == existingData.${field.name}`)
            } else {
                // 更新可能フィールドのバリデーション
                let validation = `        (data.${field.name} == null || `

                // 型チェック
                switch (field.type) {
                    case 'String':
                        validation += `data.${field.name} is string`
                        if (field.constraints && field.constraints.maxLength) {
                            validation += ` && data.${field.name}.size() <= ${field.constraints.maxLength}`
                        }
                        break
                    case 'Int':
                    case 'Float':
                        validation += `data.${field.name} is number`
                        break
                    case 'Boolean':
                        validation += `data.${field.name} is bool`
                        break
                    case 'DateTime':
                        validation += `data.${field.name} is timestamp`
                        break
                    default:
                        if (schema.enums[field.type]) {
                            validation += `validateEnum(data.${field.name}, [${schema.enums[field.type].map(v => `"${v}"`).join(', ')}])`
                        } else if (field.isRelation && field.relationModel) {
                            // リファレンスチェック
                            validation += `data.${field.name} is string && checkFK(data.${field.name}, "${field.relationModel}Collection")`
                        } else {
                            validation += `true` // その他の型は基本チェックのみ
                        }
                }

                validation += `)`

                // ユニーク制約のチェック
                if (field.isUnique) {
                    validation += ` && checkUnique("${model.name}.${field.name}", data.${field.name})`
                }

                updateValidations.push(validation)
            }
        })

        // 全てのフィールドのチェックをANDで繋ぐ
        functionsCode += `        return ${updateValidations.join(' && ')};\n`
        functionsCode += `    }\n\n`
    })

    return functionsCode
}

// コレクションのルール生成
function generateCollectionRules(schema: Schema): string {
    let collectionRulesCode = ''

    schema.models.forEach(model => {
        collectionRulesCode += `    match /${model.name}/{documentId} {\n`
        collectionRulesCode += `      allow read: if checkAuthenticationStatus(request.auth);\n`
        collectionRulesCode += `      allow create: if checkAuthenticationStatus(request.auth) && isAdminOrOperator(request.auth.uid) && validate${model.name}Create(request.resource.data);\n`
        collectionRulesCode += `      allow update: if checkAuthenticationStatus(request.auth) && (request.auth.uid == resource.data.uid || isAdminOrOperator(request.auth.uid)) && validate${model.name}Update(request.resource.data, resource.data);\n`
        collectionRulesCode += `      allow delete: if checkAuthenticationStatus(request.auth) && isAdmin(request.auth.uid);\n`
        collectionRulesCode += `    }\n\n`
    })

    return collectionRulesCode
}

// ORMコードの生成
function generateORMCode(schema: Schema): string {
    let ormCode = `// Auto-generated ORM models\n`
    ormCode += `import { Collection, Entity, Property, Ref } from 'fireorm';\n`
    ormCode += generateEnums(schema)
    ormCode += `\n`

    schema.models.forEach(model => {
        ormCode += `@Collection()\n`
        ormCode += `export class ${model.name} {\n`

        model.fields.forEach(field => {
            let decorator = ''
            let type = field.type

            if (schema.enums[field.type]) {
                decorator = `  @Property()\n  `
                type = field.type
            } else if (field.isList) {
                if (schema.enums[type]) {
                    type = `${type}[]`
                    decorator = `  @Property()\n  `
                } else {
                    type = `string[]` // 仮: リスト内の型を適切に設定
                    decorator = `  @Property()\n  `
                }
            } else if (field.isRelation && field.relationModel) {
                decorator = `  @Ref()\n  `
                type = `Ref<${field.relationModel}>`
            } else {
                decorator = `  @Property()\n  `
                switch (field.type) {
                    case 'String':
                        type = 'string'
                        break
                    case 'Int':
                    case 'Float':
                        type = 'number'
                        break
                    case 'Boolean':
                        type = 'boolean'
                        break
                    case 'DateTime':
                        type = 'FirebaseFirestore.Timestamp'
                        break
                    default:
                        type = 'any'
                }
            }

            ormCode += `${decorator}${field.name}: ${type};\n`
        })

        ormCode += `}\n\n`
    })

    return ormCode
}

// Enumの生成（TypeScript用）
function generateEnums(schema: Schema): string {
    let enumsCode = `// Auto-generated Enums\n`

    for (const enumName in schema.enums) {
        enumsCode += `export enum ${enumName} {\n`
        schema.enums[enumName].forEach(value => {
            enumsCode += `  ${value} = "${value}",\n`
        })
        enumsCode += `}\n\n`
    }

    return enumsCode
}

// メイン実行部分
// async function main() {
//     const parsedSchema = await parseSchema(schemaContent)
//
//     // Firestoreセキュリティルールの生成
//     const firestoreRules = generateFirestoreRules(parsedSchema)
//     fs.writeFileSync(path.join(__dirname, '..', 'firestore.rules'), firestoreRules)
//     console.log(`Firestore rules generated at firestore.rules`)
//
//     // ORMコードの生成
//     const ormCode = generateORMCode(parsedSchema)
//     fs.writeFileSync(path.join(__dirname, '..', 'orm.ts'), ormCode)
//     console.log(`ORM code generated at orm.ts`)
// }
//
// main().catch(e => {
//     console.error(e)
//     process.exit(1)
// })