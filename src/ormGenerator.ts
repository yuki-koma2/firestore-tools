// src/ormGenerator.ts
import { Schema, FieldDefinition } from "./interface";

// 型とデフォルト値のマッピング
const typeMappings: Record<string, { tsType: string; defaultValue: string }> = {
    String: { tsType: 'string', defaultValue: "''" },
    Int: { tsType: 'number', defaultValue: '0' },
    Float: { tsType: 'number', defaultValue: '0' },
    Boolean: { tsType: 'boolean', defaultValue: 'false' },
    DateTime: { tsType: 'Timestamp', defaultValue: 'new Timestamp(0, 0)' },
};

// ヘルパー関数: コード行を追加（複数行に対応）
function addLine(code: string[], line: string = '', indentLevel: number = 0) {
    const indent = '  '.repeat(indentLevel);
    const lines = line.split('\n');
    lines.forEach(l => code.push(`${indent}${l}`));
}

// Enumの生成（TypeScript用）
export function generateEnums(schema: Schema): string {
    const enumsCode: string[] = [`// Auto-generated Enums\n`];
    for (const enumName in schema.enums) {
        addLine(enumsCode, `export enum ${enumName} {`, 0);
        schema.enums[enumName].forEach(value => {
            addLine(enumsCode, `${value} = "${value}",`, 1);
        });
        addLine(enumsCode, `}\n`, 0);
    }
    return enumsCode.join('\n');
}

// ヘルパー関数: フィールドタイプに基づいてデフォルト値を取得
function getDefaultValue(field: FieldDefinition, schema: Schema): string {
    if (field.isList) {
        return '[]';
    }

    if (schema.enums[field.type]) {
        const enumValues = schema.enums[field.type];
        return `${field.type}.${enumValues[0]}`;
    }

    const mapping = typeMappings[field.type];
    if (mapping) {
        return mapping.defaultValue;
    }

    if (field.isRelation) {
        return 'null';
    }

    return 'null';
}

// ヘルパー関数: フィールドから型を取得
function typeFromField(field: FieldDefinition, schema: Schema): string {
    let baseType: string;

    if (schema.enums[field.type]) {
        baseType = field.type;
    } else {
        baseType = typeMappings[field.type]?.tsType || (field.isRelation ? 'string' : 'any');
    }

    if (field.isList) {
        baseType += '[]';
    } else if (field.isRelation) {
        baseType += ' | null';
    }

    return baseType;
}

// ヘルパー関数: コンストラクタ引数を生成
function generateConstructorArgs(fields: FieldDefinition[], schema: Schema): string[] {
    return fields.map(field => {
        let argType: string;

        if (schema.enums[field.type]) {
            argType = field.type;
        } else {
            argType = typeFromField(field, schema);
        }

        if (!field.isRequired) {
            argType = `${typeFromField(field, schema)}`;
            return `    ${field.name}?: ${argType}`;
        }

        return `    ${field.name}: ${argType}`;
    });
}

// ORMコードの生成
export function generateORMCode(schema: Schema): string {
    const ormCode: string[] = [
        `// Auto-generated ORM models`,
        `import { FieldValue, Timestamp } from "@firebase/firestore";`,
        `import { JsonValue } from "type-fest";\n`,
        `export type CollectionJson<T> = {`,
        `  [P in keyof T extends string ? keyof T : never]: JsonValue | FieldValue;`,
        `};\n`,
        generateEnums(schema),
    ];

    schema.models.forEach(model => {
        addLine(ormCode, `export class ${model.name} {`, 0);

        // プライベートフィールドの宣言
        model.fields.forEach(field => {
            const type = typeFromField(field, schema);
            addLine(ormCode, `private readonly _${field.name}: ${type};`, 1);
        });

        addLine(ormCode, '', 1);

        // コンストラクタの生成
        addLine(ormCode, `constructor(`, 1);
        const constructorArgs = generateConstructorArgs(model.fields, schema);
        ormCode.push(constructorArgs.join(',\n'));
        addLine(ormCode, `) {`, 1);

        // コンストラクタ内でのプロパティ初期化
        model.fields.forEach(field => {
            const initializer = field.isRequired
                ? `${field.name}`
                : `${field.name} ?? ${getDefaultValue(field, schema)}`;
            addLine(ormCode, `this._${field.name} = ${initializer};`, 2);
        });

        addLine(ormCode, `}`, 1);
        addLine(ormCode, '', 1);

        // ゲッターの生成
        model.fields.forEach(field => {
            const type = typeFromField(field, schema);
            addLine(ormCode, `get ${field.name}(): ${type} {`, 1);
            addLine(ormCode, `return this._${field.name};`, 2);
            addLine(ormCode, `}\n`, 1);
        });

        // FirestoreDataConverter の生成
        addLine(ormCode, `public static firestoreConverter: FirestoreDataConverter<${model.name}> = {`, 1);
        // toFirestore
        addLine(ormCode, `toFirestore(instance: ${model.name}): CollectionJson<${model.name}> {`, 2);
        addLine(ormCode, `return {`, 3);
        model.fields.forEach(field => {
            addLine(ormCode, `${field.name}: instance.${field.name},`, 4);
        });
        addLine(ormCode, `};`, 3);
        addLine(ormCode, `},\n`, 2);

        // fromFirestore
        addLine(ormCode, `fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ${model.name} {`, 2);
        addLine(ormCode, `const data = snapshot.data(options);`, 3);
        const constructorParams = model.fields.map(field => `data.${field.name},`).join('\n');
        addLine(ormCode, `return new ${model.name}(`, 3);
        addLine(ormCode, constructorParams, 4);
        addLine(ormCode, `);`, 3);
        addLine(ormCode, `},`, 2);

        addLine(ormCode, `};`, 1);
        addLine(ormCode, `}\n`);
    });

    return ormCode.join('\n');
}