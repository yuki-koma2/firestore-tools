// インターフェースの定義
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

export interface Schema {
    enums: EnumDefinition;
    models: ModelDefinition[];
}
