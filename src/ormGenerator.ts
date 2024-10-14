// src/ormGenerator.ts
import { Schema, FieldDefinition } from "./interface";

// Enumの生成（TypeScript用）
export function generateEnums(schema: Schema): string {
    let enumsCode = `// Auto-generated Enums\n\n`;

    for (const enumName in schema.enums) {
        enumsCode += `export enum ${enumName} {\n`;
        schema.enums[enumName].forEach(value => {
            enumsCode += `  ${value} = "${value}",\n`;
        });
        enumsCode += `}\n\n`;
    }

    return enumsCode;
}

// ヘルパー関数: フィールドタイプに基づいてデフォルト値を取得
function getDefaultValue(field: FieldDefinition, schema: Schema): string {
    if (schema.enums[field.type]) {
        const enumValues = schema.enums[field.type];
        return `${field.type}.${enumValues[0]}`;
    }

    switch (field.type) {
        case 'String':
            return `''`;
        case 'Int':
        case 'Float':
            return `0`;
        case 'Boolean':
            return `false`;
        case 'DateTime':
            return `new Timestamp(0, 0)`;
        default:
            if (field.isRelation) {
                if (field.isList) {
                    return `[]`;
                } else {
                    return `null`;
                }
            }
            return `null`; // その他の型は null に設定
    }
}

// ヘルパー関数: フィールドから型を取得
function typeFromField(field: FieldDefinition, schema: Schema): string {
    let baseType: string;

    if (schema.enums[field.type]) {
        baseType = field.type;
    } else {
        switch (field.type) {
            case 'String':
                baseType = 'string';
                break;
            case 'Int':
            case 'Float':
                baseType = 'number';
                break;
            case 'Boolean':
                baseType = 'boolean';
                break;
            case 'DateTime':
                baseType = 'Timestamp';
                break;
            default:
                if (field.isRelation) {
                    baseType = 'string'; // リレーションはユニークキーをstringと仮定
                } else {
                    baseType = 'any';
                }
        }
    }

    if (field.isRelation) {
        if (field.isList) {
            return `${baseType}[]`;
        } else {
            return `${baseType} | null`;
        }
    } else {
        if (field.isList) {
            return `${baseType}[]`;
        } else {
            return baseType;
        }
    }
}

// ORMコードの生成
export function generateORMCode(schema: Schema): string {
    let ormCode = `// Auto-generated ORM models\n`;

    // 必要なインポート文を追加
    ormCode += `import { FieldValue, Timestamp } from "@firebase/firestore";\n`;
    ormCode += `import { JsonValue } from "type-fest";\n\n`;

    // CollectionJson の定義を追加
    ormCode += `export type CollectionJson<T> = {\n`;
    ormCode += `  [P in keyof T extends string ? keyof T : never]: JsonValue | FieldValue;\n`;
    ormCode += `};\n\n`;

    // Enumsの生成
    ormCode += generateEnums(schema);

    schema.models.forEach(model => {
        // クラス宣言
        ormCode += `export class ${model.name} {\n`;

        // プライベートフィールドの宣言
        model.fields.forEach(field => {
            const type: string = typeFromField(field, schema);
            ormCode += `  private readonly _${field.name}: ${type};\n`;
        });

        ormCode += `\n`;

        // コンストラクタの生成
        ormCode += `  constructor(\n`;

        // コンストラクタの引数リスト
        const constructorArgs: string[] = [];
        model.fields.forEach(field => {
            let arg = '';

            const type: string = typeFromField(field, schema);

            if (field.isRelation) {
                if (field.isList) {
                    arg = `${field.name}: string[]`;
                } else {
                    arg = `${field.name}?: string | null`;
                }
            } else if (schema.enums[field.type]) {
                arg = `${field.name}: ${field.type}`;
            } else {
                switch (field.type) {
                    case 'String':
                        arg = `${field.name}: string`;
                        break;
                    case 'Int':
                    case 'Float':
                        arg = `${field.name}: number`;
                        break;
                    case 'Boolean':
                        arg = `${field.name}: boolean`;
                        break;
                    case 'DateTime':
                        arg = `${field.name}: Timestamp`;
                        break;
                    default:
                        arg = `${field.name}: any`;
                }

                if (!field.isRequired) {
                    arg = `${field.name}?: ${type}`;
                }
            }

            constructorArgs.push(`    ${arg}`);
        });

        ormCode += constructorArgs.join(',\n');
        ormCode += `\n  ) {\n`;

        // コンストラクタ内でのプロパティ初期化
        model.fields.forEach(field => {
            if (field.isRequired) {
                // 必須フィールドは直接代入
                ormCode += `    this._${field.name} = ${field.name};\n`;
            } else {
                // オプションフィールドはデフォルト値を設定
                if (field.isRelation) {
                    if (field.isList) {
                        ormCode += `    this._${field.name} = ${field.name} || [];\n`;
                    } else {
                        ormCode += `    this._${field.name} = ${field.name} ?? null;\n`;
                    }
                } else {
                    if (schema.enums[field.type]) {
                        ormCode += `    this._${field.name} = ${field.name} ?? ${getDefaultValue(field, schema)};\n`;
                    } else {
                        switch (field.type) {
                            case 'String':
                                if (field.isList) {
                                    ormCode += `    this._${field.name} = ${field.name} || [];\n`;
                                } else {
                                    ormCode += `    this._${field.name} = ${field.name} ?? '';\n`;
                                }
                                break;
                            case 'Int':
                            case 'Float':
                                if (field.isList) {
                                    ormCode += `    this._${field.name} = ${field.name} || [];\n`;
                                } else {
                                    ormCode += `    this._${field.name} = ${field.name} ?? 0;\n`;
                                }
                                break;
                            case 'Boolean':
                                if (field.isList) {
                                    ormCode += `    this._${field.name} = ${field.name} || [];\n`;
                                } else {
                                    ormCode += `    this._${field.name} = ${field.name} ?? false;\n`;
                                }
                                break;
                            case 'DateTime':
                                if (field.isList) {
                                    ormCode += `    this._${field.name} = ${field.name} || [];\n`;
                                } else {
                                    ormCode += `    this._${field.name} = ${field.name} ?? new Timestamp(0, 0);\n`;
                                }
                                break;
                            default:
                                if (field.isList) {
                                    ormCode += `    this._${field.name} = ${field.name} || [];\n`;
                                } else {
                                    ormCode += `    this._${field.name} = ${field.name} ?? null;\n`;
                                }
                        }
                    }
                }
            }
        });

        ormCode += `  }\n\n`;

        // ゲッターの生成
        model.fields.forEach(field => {
            const type: string = typeFromField(field, schema);
            ormCode += `  get ${field.name}(): ${type} {\n`;
            ormCode += `    return this._${field.name};\n`;
            ormCode += `  }\n\n`;
        });

        // FirestoreDataConverter の生成
        ormCode += `  public static firestoreConverter: FirestoreDataConverter<${model.name}> = {\n`;
        ormCode += `    toFirestore(instance: ${model.name}): CollectionJson<${model.name}> {\n`;
        ormCode += `      return {\n`;
        model.fields.forEach(field => {
            ormCode += `        ${field.name}: instance.${field.name},\n`;
        });
        ormCode += `      };\n`;
        ormCode += `    },\n\n`;
        ormCode += `    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ${model.name} {\n`;
        ormCode += `      const data = snapshot.data(options);\n`;
        ormCode += `      return new ${model.name}(\n`;
        model.fields.forEach(field => {
            ormCode += `        data.${field.name},\n`;
        });
        ormCode += `      );\n`;
        ormCode += `    },\n`;
        ormCode += `  };\n`;

        ormCode += `}\n\n`;
    });

    return ormCode;
}