// インデント用ヘルパー関数（n 個のスペースでインデント）
export function indentHelper(str: string, n: number): string {
    const spaces = ' '.repeat(n);
    return str
        .split('\n')
        .map(line => /^\s*$/.test(line) ? line : spaces + line)
        .join('\n');
}
