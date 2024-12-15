import { indentHelper } from "../indentHelper";

describe('indentHelper', () => {
    it('should indent a single line string correctly', () => {
        const str = 'hello';
        const indentedStr = indentHelper(str, 2);
        expect(indentedStr).toBe('  hello');
    });

    it('should indent a multi-line string correctly', () => {
        const str = 'hello\nworld';
        const indentedStr = indentHelper(str, 2);
        expect(indentedStr).toBe('  hello\n  world');
    });

    it('should handle empty lines correctly', () => {
        const str = 'hello\n\nworld';
        const indentedStr = indentHelper(str, 2);
        expect(indentedStr).toBe('  hello\n\n  world');
    });

    it('should handle lines with only whitespace correctly', () => {
        const str = 'hello\n \nworld';
        const indentedStr = indentHelper(str, 2);
        expect(indentedStr).toBe('  hello\n \n  world');
    });

    it('should handle leading and trailing whitespace correctly', () => {
        const str = '  hello\n world ';
        const indentedStr = indentHelper(str, 2);
        expect(indentedStr).toBe('    hello\n   world ');
    });

    it('should handle leading and trailing empty lines correctly', () => {
        const str = '\nhello\nworld\n';
        const indentedStr = indentHelper(str, 2);
        expect(indentedStr).toBe('\n  hello\n  world\n');
    });


    it('should indent with the specified number of spaces', () => {
        const str = 'hello\nworld';
        const indentedStr = indentHelper(str, 4);
        expect(indentedStr).toBe('    hello\n    world');
    });

    it('should handle empty string correctly', () => {
        const str = '';
        const indentedStr = indentHelper(str, 2);
        expect(indentedStr).toBe('');
    });
});