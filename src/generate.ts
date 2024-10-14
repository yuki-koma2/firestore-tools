import { Schema } from "./interface";

export function generateCollectionRules(schema: Schema): string {
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

export function generateValidationFunctions(schema: Schema): string {
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

export function generateFirestoreRules(schema: Schema): string {
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