const fs = require('fs');
const babel = require('@babel/core');

const data = require('./eslint-results.json');
const files = data.filter(d => d.messages.some(m => m.ruleId === 'no-undef' && m.message.includes('\'t\''))).map(d => d.filePath);

const plugin = function({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.name === 't') {
          const fn = path.getFunctionParent();
          if (!fn) return;
          
          if (path.scope.hasBinding('t')) return;

          if (!t.isBlockStatement(fn.node.body)) {
            const returnedExpr = fn.node.body;
            fn.node.body = t.blockStatement([
              t.returnStatement(returnedExpr)
            ]);
          }

          const block = fn.node.body;
          const alreadyInjected = block.body.some(stmt => 
            t.isVariableDeclaration(stmt) && 
            stmt.declarations.some(decl => 
              t.isObjectPattern(decl.id) && 
              decl.id.properties.some(prop => prop.key.name === 't') &&
              t.isCallExpression(decl.init) &&
              decl.init.callee.name === 'useTranslation'
            )
          );

          if (!alreadyInjected) {
            const declaration = t.variableDeclaration('const', [
              t.variableDeclarator(
                t.objectPattern([
                  t.objectProperty(t.identifier('t'), t.identifier('t'), false, true)
                ]),
                t.callExpression(t.identifier('useTranslation'), [])
              )
            ]);
            block.body.unshift(declaration);
          }
        }
      }
    }
  };
};

files.forEach(file => {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const result = babel.transformSync(code, {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
      retainLines: true,
      generatorOpts: { retainLines: true }
    });
    
    let newCode = result.code;
    if (!newCode.includes('import { useTranslation }')) {
       newCode = 'import { useTranslation } from "react-i18next";\n' + newCode;
    }

    fs.writeFileSync(file, newCode, 'utf8');
    console.log('Fixed', file);
  } catch (err) {
    console.error('Error fixing', file, err);
  }
});
