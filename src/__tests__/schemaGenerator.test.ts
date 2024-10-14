import { describe, expect, it } from '@jest/globals';
import { parseSchema } from "../parseSchema";
import { Schema } from "../interface";
import { generateFirestoreRules } from "../generate";
import { sampleYAML } from "./yaml.testData";


describe('Schema Generator', () => {
    let parsedSchema: Schema;

    beforeAll(async () => {
        parsedSchema = await parseSchema(sampleYAML);
    });

    describe('generateFirestoreRules', () => {
        it('should generate valid Firestore rules', () => {
            const rules = generateFirestoreRules(parsedSchema);
            expect(rules).toContain("rules_version = '2';");
            expect(rules).toContain("service cloud.firestore {");
            expect(rules).toContain("match /User/{documentId} {");
            expect(rules).toContain("allow read: if checkAuthenticationStatus(request.auth);");
            expect(rules).toContain("allow create: if checkAuthenticationStatus(request.auth) && isAdminOrOperator(request.auth.uid) && validateUserCreate(request.resource.data);");
            expect(rules).toContain("allow update: if checkAuthenticationStatus(request.auth) && (request.auth.uid == resource.data.uid || isAdminOrOperator(request.auth.uid)) && validateUserUpdate(request.resource.data, resource.data);");
            expect(rules).toContain("allow delete: if checkAuthenticationStatus(request.auth) && isAdmin(request.auth.uid);");
        });
    });
    it('should include unique constraint functions in Firestore rules', () => {
        const rules = generateFirestoreRules(parsedSchema);
        expect(rules).toContain('function checkUnique(field, value) {');
        expect(rules).toContain('function reserveUnique(field, value) {');
    });
    it('should include global functions in Firestore rules', () => {
        const rules = generateFirestoreRules(parsedSchema);
        expect(rules).toContain('function getRole(uid) {');
        expect(rules).toContain('function isAdminOrOperator(uid) {');
        expect(rules).toContain('function isAdmin(uid) {');
        expect(rules).toContain('function checkFK(documentId, collectionPath) {');
        expect(rules).toContain('function checkAuthenticationStatus(auth) {');
        expect(rules).toContain('function validateEnum(field, enumValues) {');
    });

});