import * as fs from 'fs-extra';
import * as path from 'path';
import { parseSchema } from "./parseSchema";
import { generateFirestoreRules } from "./generate";
import { generateORMCode } from "./ormGenerator";

const SCHEMA_FILE = path.join(__dirname, 'schema.yaml');
const schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf-8');

async function main() {
    const parsedSchema = await parseSchema(schemaContent);

    const firestoreRules = generateFirestoreRules(parsedSchema);
    fs.writeFileSync(path.join(__dirname, '..', 'firestore.rules'), firestoreRules);
    console.log(`Firestore rules generated at firestore.rules`);

    const ormCode = generateORMCode(parsedSchema);
    fs.writeFileSync(path.join(__dirname, '..', 'orm.ts'), ormCode);
    console.log(`ORM code generated at orm.ts`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
