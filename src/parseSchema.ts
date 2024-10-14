import { EnumDefinition, FieldDefinition, ModelDefinition, Schema } from "./interface";
import { parse as parseYAML } from "yaml";

export async function parseSchema(schema: string): Promise<Schema> {
    const parsed = parseYAML(schema);

    const enums: EnumDefinition = {};
    Object.keys(parsed.enums).forEach(enumName => {
        enums[enumName] = parsed.enums[enumName];
    });

    const models: ModelDefinition[] = Object.keys(parsed.models).map(modelName => {
        const model = parsed.models[modelName];
        const fields: FieldDefinition[] = model.fields.map((field: FieldDefinition) => {
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
                constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
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