import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import parser from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default;
import _generate from '@babel/generator';
const generate = _generate.default;
import * as t from '@babel/types';
import prettier from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');
const EN_JSON_PATH = path.join(__dirname, 'src/locales/en/translation.json');
const TR_JSON_PATH = path.join(__dirname, 'src/locales/tr/translation.json');

// Read existing translations
let enTranslations = {};
let trTranslations = {};
if (fs.existsSync(EN_JSON_PATH)) enTranslations = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf-8'));
if (fs.existsSync(TR_JSON_PATH)) trTranslations = JSON.parse(fs.readFileSync(TR_JSON_PATH, 'utf-8'));

// Helper to convert text to a snake_case key
const generateKey = (text) => {
    let key = text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .substring(0, 40);
    return key || 'empty_key';
};

const IGNORED_ATTRIBUTES = new Set(['className', 'id', 'type', 'name', 'htmlFor', 'src', 'href', 'to', 'key', 'ref', 'd', 'viewBox', 'xmlns', 'fill', 'stroke', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin', 'target', 'rel']);

function processFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    // Ignore some files that are just configs or hooks
    if (filePath.includes('/constants/') || filePath.includes('/hooks/') || filePath.includes('/services/')) return;

    const code = fs.readFileSync(filePath, 'utf-8');
    
    let ast;
    try {
        ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'optionalChaining', 'nullishCoalescingOperator', 'classProperties', 'logicalAssignment']
        });
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e.message);
        return;
    }

    let modified = false;
    let needsImport = false;
    let hasImport = false;
    let componentFunctions = [];

    traverse(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value === 'react-i18next') {
                hasImport = true;
            }
        },
        // Track functional components
        FunctionDeclaration(path) {
            if (path.node.id && path.node.id.name.match(/^[A-Z]/)) {
                componentFunctions.push(path);
            }
        },
        VariableDeclarator(path) {
            if (path.node.id && path.node.id.name && path.node.id.name.match(/^[A-Z]/)) {
                if (path.node.init && (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init))) {
                    componentFunctions.push(path.get('init'));
                }
            }
        },
        JSXText(path) {
            const text = path.node.value.trim();
            if (text && /[a-zA-Z]/.test(text) && !text.includes('{')) {
                const key = generateKey(text);
                enTranslations[key] = text;
                if (!trTranslations[key]) trTranslations[key] = text + ' [TR]'; // Placeholder for TR
                
                path.replaceWith(
                    t.jsxExpressionContainer(
                        t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
                    )
                );
                modified = true;
                needsImport = true;
            }
        },
        JSXAttribute(path) {
            const attrName = path.node.name.name;
            if (IGNORED_ATTRIBUTES.has(attrName)) return;

            if (t.isStringLiteral(path.node.value)) {
                const text = path.node.value.value.trim();
                if (text && /[a-zA-Z]/.test(text)) {
                    // Only translate common translatable attributes
                    if (['placeholder', 'title', 'alt', 'label', 'aria-label'].includes(attrName)) {
                        const key = generateKey(text);
                        enTranslations[key] = text;
                        if (!trTranslations[key]) trTranslations[key] = text + ' [TR]';

                        path.node.value = t.jsxExpressionContainer(
                            t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
                        );
                        modified = true;
                        needsImport = true;
                    }
                }
            }
        }
    });

    if (modified) {
        // Inject useTranslation hook into components
        componentFunctions.forEach(funcPath => {
            const body = funcPath.node.body;
            if (t.isBlockStatement(body)) {
                // check if `const { t } = useTranslation();` exists
                const hasHook = body.body.some(node => 
                    t.isVariableDeclaration(node) && 
                    node.declarations.some(dec => 
                        t.isCallExpression(dec.init) && 
                        t.isIdentifier(dec.init.callee, { name: 'useTranslation' })
                    )
                );

                if (!hasHook) {
                    const hookCall = t.variableDeclaration('const', [
                        t.variableDeclarator(
                            t.objectPattern([
                                t.objectProperty(t.identifier('t'), t.identifier('t'), false, true)
                            ]),
                            t.callExpression(t.identifier('useTranslation'), [])
                        )
                    ]);
                    body.body.unshift(hookCall);
                }
            }
        });

        // Inject import if needed
        if (needsImport && !hasImport) {
            const importDecl = t.importDeclaration(
                [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
                t.stringLiteral('react-i18next')
            );
            ast.program.body.unshift(importDecl);
        }

        const output = generate(ast, {}, code);
        
        try {
            const formatted = prettier.format(output.code, { parser: 'babel', singleQuote: true, tabWidth: 4 });
            fs.writeFileSync(filePath, formatted);
        } catch (e) {
            // fallback if prettier fails
            fs.writeFileSync(filePath, output.code);
        }
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else {
            processFile(fullPath);
        }
    });
}

console.log('Starting codemod on entire src...');
walkDir(SRC_DIR);
// Save translations
fs.writeFileSync(EN_JSON_PATH, JSON.stringify(enTranslations, null, 2));
fs.writeFileSync(TR_JSON_PATH, JSON.stringify(trTranslations, null, 2));
console.log('Codemod finished. Translations saved.');
