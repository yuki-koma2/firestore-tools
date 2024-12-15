export interface EnumDefinition {
    [enumName: string]: string[];
}

export interface FieldDefinition {
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

export interface ModelDefinition {
    name: string;
    fields: FieldDefinition[];
}

export interface IndexDefinition {
    collectionGroup: string;
    queryScope: string;
    fields: {
        fieldPath: string;
        order: string;
    }[];
}

export interface Schema {
    enums: EnumDefinition;
    models: ModelDefinition[];
    indexes?: IndexDefinition[];
}
