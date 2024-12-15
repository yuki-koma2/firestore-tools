import * as fs from 'fs-extra';
import * as path from 'path';
import minimist from 'minimist';
import { parseSchema } from "./parseSchema";
import { generateFirestoreRules } from "./generate";
import { generateORMCode } from "./ormGenerator";

// 定数定義
const AUTH_PROVIDERS = ['password', 'google.com'];
// npm run generate -- --input ./sample/schema.yaml --output ./output

// コマンドライン引数の解析
const args = minimist(process.argv.slice(2), {
    string: ['input', 'output'],
    alias: {i: 'input', o: 'output'},
    default: {
        input: path.join(__dirname, 'schema.yaml'), // デフォルトの入力ファイル
        output: path.join(__dirname, '..'),         // デフォルトの出力ディレクトリ
    },
    unknown: (param) => {
        if (param.startsWith('-')) {
            console.error(`Unknown option: ${param}`);
            console.log('Usage: npm run generate -- --input <path/to/schema.yaml> --output <path/to/output/dir>');
            process.exit(1);
        }
        return false;
    }
});

const schemaFilePath = path.resolve(args.input);
const outputDirPath = path.resolve(args.output);

// スキーマファイルの存在を確認
if (!fs.existsSync(schemaFilePath)) {
    console.error(`Error: Schema file not found at path "${schemaFilePath}"`);
    console.log('Usage: npm run generate -- --input <path/to/schema.yaml> --output <path/to/output/dir>');
    process.exit(1);
}

// 出力ディレクトリの存在を確認・作成
if (!fs.existsSync(outputDirPath)) {
    try {
        fs.mkdirpSync(outputDirPath);
        console.log(`Output directory created at ${outputDirPath}`);
    } catch (error) {
        console.error(`Error: Unable to create output directory at "${outputDirPath}"`);
        console.error(error);
        process.exit(1);
    }
}

// スキーマファイルの内容を読み込む
let schemaContent: string;
try {
    schemaContent = fs.readFileSync(schemaFilePath, 'utf-8');
} catch (error) {
    console.error(`Error: Unable to read schema file at "${schemaFilePath}"`);
    console.error(error);
    process.exit(1);
}

async function main() {
    try {
        console.log(`Parsing schema from "${schemaFilePath}"...`);
        const parsedSchema = await parseSchema(schemaContent);
        console.log('Schema parsed successfully.');

        // Firestore セキュリティルールの生成
        console.log('Generating Firestore security rules...');
        const firestoreRules = generateFirestoreRules(parsedSchema);
        const firestoreRulesPath = path.join(outputDirPath, 'firestore.rules');
        fs.writeFileSync(firestoreRulesPath, firestoreRules);
        console.log(`Firestore rules generated at "${firestoreRulesPath}"`);

        // ORM コードの生成
        console.log('Generating ORM code...');
        const ormCode = generateORMCode(parsedSchema);
        const ormCodePath = path.join(outputDirPath, 'orm.ts');
        fs.writeFileSync(ormCodePath, ormCode);
        console.log(`ORM code generated at "${ormCodePath}"`);

        // Indexes JSONの生成
        console.log('Generating Firestore indexes JSON...');
        const indexesJson = {
            indexes: parsedSchema.indexes,
            fieldOverrides: []
        };
        const indexesJsonPath = path.join(outputDirPath, 'firestore.indexes.json');
        fs.writeFileSync(indexesJsonPath, JSON.stringify(indexesJson, null, 2));
        console.log(`Firestore indexes JSON generated at "${indexesJsonPath}"`);
    } catch (error) {
        console.error('Error generating Firestore rules, ORM code, or indexes JSON:', error);
        process.exit(1);
    }
}

main();
