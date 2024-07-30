
import {resolve} from 'path';
import {fileURLToPath} from 'url';
import * as fs from 'fs';
import {execSync} from 'child_process';

const filename = fileURLToPath(import.meta.url);
const root = resolve(filename, '../..');
const dry = process.argv.includes('--dry');

const yarn = (cmd, stdio = 'inherit') => {
    const script = `yarn run ${cmd}`;
    if (dry) {
        return script;
    }
    return execSync(script, {stdio});
};
const typlite = (input, output = "-") => {
    if (output === "-") {
        // return stdout
        const res = yarn(`--silent typlite ${input} -`, 'pipe');
        return res.toString();
    }

    return yarn(`typlite ${input} ${output}`);
};

const convert = async (inp, out, opts) => {
    const input = resolve(root, inp);
    const output = resolve(root, out);
    const { before } = opts || {};

    const res = typlite(input).trim();
    if (dry) {
        console.log(res);
        return;
    }

    await fs.promises.writeFile(output, `<!-- This file is generated by scripts/link-docs.mjs from ${inp}. Do not edit manually. -->\n${before || ''}${res}\n`);
};

const main = async () => {
    await Promise.all([
        convert('docs/tinymist/introduction.typ', 'README.md', { before: "# Tinymist\n\n" }),
    ])
};

main().catch(console.error);
