import { Schema } from "./interface";

export function generateORMCode(schema: Schema): string {
    let ormCode = `// Auto-generated ORM models\n`;
    ormCode += `import { Collection, Entity, Property, Ref } from 'fireorm';\n`;
    ormCode += generateEnums(schema);
    ormCode += `\n`;

    schema.models.forEach(model => {
        ormCode += `@Collection()\n`;
        ormCode += `export class ${model.name} {\n`;

        model.fields.forEach(field => {
            let decorator = '';
            let type = field.type;

            if (schema.enums[field.type]) {
                decorator = `  @Property()\n  `;
                type = field.type;
            } else if (field.isRelation) {
                if (field.isList) {
                    decorator = `  @Ref()\n  `;
                    type = `Ref<${field.relationModel}>[]`;
                } else {
                    decorator = `  @Ref()\n  `;
                    type = `Ref<${field.relationModel}>`;
                }
            } else if (field.isList) {
                if (schema.enums[type]) {
                    type = `${type}[]`;
                    decorator = `  @Property()\n  `;
                } else {
                    type = `string[]`; // 仮: リスト内の型を適切に設定
                    decorator = `  @Property()\n  `;
                }
            } else {
                decorator = `  @Property()\n  `;
                switch (field.type) {
                    case 'String':
                        type = 'string';
                        break;
                    case 'Int':
                    case 'Float':
                        type = 'number';
                        break;
                    case 'Boolean':
                        type = 'boolean';
                        break;
                    case 'DateTime':
                        type = 'FirebaseFirestore.Timestamp';
                        break;
                    default:
                        type = 'any';
                }
            }

            ormCode += `${decorator}${field.name}: ${type};\n`;
        });

        ormCode += `}\n\n`;
    });

    return ormCode;
}


export function generateEnums(schema: Schema): string {
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