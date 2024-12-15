import { Schema } from "./interface";
import { indentHelper } from "./indentHelper";

const AUTH_PROVIDERS = ['password', 'google.com'];

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
    let functionsCode = '';

    schema.models.forEach(model => {
        // Create用バリデーション関数
        functionsCode += `    function validate${model.name}Create(data) {\n`
        let createValidations: string[] = [];

        model.fields.forEach(field => {
            let validation = '';

            if (field.isReadOnly) {
                validation += `data.${field.name} != null`; // 例: create時 read-only フィールドも null でないかどうか
            } else {
                if (field.isRequired) {
                    validation += `data.${field.name} != null && `;
                } else {
                    validation += `(data.${field.name} == null || `;
                }

                // 型チェック部分
                switch (field.type) {
                    case 'String':
                        validation += `data.${field.name} is string`;
                        if (field.constraints && field.constraints.maxLength) {
                            validation += ` && data.${field.name}.size() <= ${field.constraints.maxLength}`;
                        }
                        break;
                    case 'Int':
                    case 'Float':
                        validation += `data.${field.name} is number`;
                        break;
                    case 'Boolean':
                        validation += `data.${field.name} is bool`;
                        break;
                    case 'DateTime':
                        validation += `data.${field.name} is timestamp`;
                        break;
                    default:
                        if (schema.enums[field.type]) {
                            validation += `validateEnum(data.${field.name}, [${schema.enums[field.type].map(v => `"${v}"`).join(', ')}])`;
                        } else if (field.isRelation && field.relationModel) {
                            validation += `data.${field.name} is string && checkFK(data.${field.name}, "${field.relationModel}Collection")`;
                        } else {
                            validation += `true`;
                        }
                }

                if (!field.isRequired) {
                    validation += `)`;
                }
            }

            // ユニーク制約のチェック
            if (field.isUnique) {
                validation += ` && checkUnique("${model.name}.${field.name}", data.${field.name})`;
            }

            createValidations.push(validation);
        });

        // チェック式を行単位で結合する
        functionsCode += `        return (\n`;
        createValidations.forEach((v, i) => {
            const isLast = i === createValidations.length - 1;
            functionsCode += `            ${v}${isLast ? '' : ' &&'}\n`;
        });
        functionsCode += `        );\n    }\n\n`;

        // Update用バリデーション関数
        functionsCode += `    function validate${model.name}Update(data, existingData) {\n`
        let updateValidations: string[] = [];

        model.fields.forEach(field => {
            if (field.isReadOnly) {
                updateValidations.push(`data.${field.name} == existingData.${field.name}`);
            } else {
                let validation = `(data.${field.name} == null || `;
                switch (field.type) {
                    case 'String':
                        validation += `data.${field.name} is string`;
                        if (field.constraints && field.constraints.maxLength) {
                            validation += ` && data.${field.name}.size() <= ${field.constraints.maxLength}`;
                        }
                        break;
                    case 'Int':
                    case 'Float':
                        validation += `data.${field.name} is number`;
                        break;
                    case 'Boolean':
                        validation += `data.${field.name} is bool`;
                        break;
                    case 'DateTime':
                        validation += `data.${field.name} is timestamp`;
                        break;
                    default:
                        if (schema.enums[field.type]) {
                            validation += `validateEnum(data.${field.name}, [${schema.enums[field.type].map(v => `"${v}"`).join(', ')}])`;
                        } else if (field.isRelation && field.relationModel) {
                            validation += `data.${field.name} is string && checkFK(data.${field.name}, "${field.relationModel}Collection")`;
                        } else {
                            validation += `true`;
                        }
                }
                validation += `)`;

                if (field.isUnique) {
                    validation += ` && checkUnique("${model.name}.${field.name}", data.${field.name})`;
                }
                updateValidations.push(validation);
            }
        });

        functionsCode += `        return (\n`;
        updateValidations.forEach((v, i) => {
            const isLast = i === updateValidations.length - 1;
            functionsCode += `            ${v}${isLast ? '' : ' &&'}\n`;
        });
        functionsCode += `        );\n    }\n\n`;
    });

    return functionsCode;
}


// ユニーク制約関数の生成
function generateUniqueConstraintFunctions(): string {
    return `
        // ======= ユニーク制約のための関数 ==========
        function checkUnique(field, value) {
            return !exists(/databases/$(database)/documents/UniqueIndexes/$(field)/$(value));
        }

        function reserveUnique(field, value) {
            return exists(/databases/$(database)/documents/UniqueIndexes/$(field)/$(value));
        }
    `;
}

function generateGlobalFunctions(): string {
    return `
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
                auth.token.firebase.sign_in_provider in ${JSON.stringify(AUTH_PROVIDERS)} &&
                auth.token.firebase.sign_in_provider != 'anonymous'
            );
        }

        // Enumバリデーション
        function validateEnum(field, enumValues) {
            return enumValues.hasAny(e => e == field);
        }
    `;
}


export function generateFirestoreRules(schema: Schema): string {
    const globalFunctionsCode = indentHelper(generateGlobalFunctions(), 4);
    const uniqueConstraintFunctionsCode = indentHelper(generateUniqueConstraintFunctions(), 4);
    const validationFunctionsCode = indentHelper(generateValidationFunctions(schema), 4);
    const collectionRulesCode = indentHelper(generateCollectionRules(schema), 4);
    return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

${globalFunctionsCode}

${uniqueConstraintFunctionsCode}

// ======= コレクションごとのバリデーション関数 ==========
${validationFunctionsCode}

// ======= コレクションのルール ==========
${collectionRulesCode}

// ======= ユニークインデックスコレクションのルール ==========
    match /UniqueIndexes/{field}/{value} {
      allow read: if false; // 読み取り禁止
      allow write: if request.auth != null && isAdmin(request.auth.uid);
    }

  }
}
`;
}
