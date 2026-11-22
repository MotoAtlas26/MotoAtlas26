#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const OUTPUT_MD = path.join(process.cwd(), 'PROJECT_CONTEXT.md');
const OUTPUT_JSON = path.join(process.cwd(), 'PROJECT_CONTEXT.json');

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        walkDir(fullPath, fileList);
      }
    } else if (/\.(jsx|tsx|ts|js|css)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function extractImports(content) {
  const imports = [];
  const regex = /import\s+(?:{([^}]+)}\s+from\s+['"]([^'"]+)['"]|(\w+)\s+from\s+['"]([^'"]+)['"]|(\w+)\s*=\s*require\(['"]([^'"]+)['"]\))/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      imports.push({ names: match[1].split(',').map(s => s.trim()), from: match[2], type: 'named' });
    } else if (match[3] && match[4]) {
      imports.push({ name: match[3], from: match[4], type: 'default' });
    } else if (match[5] && match[6]) {
      imports.push({ name: match[5], from: match[6], type: 'require' });
    }
  }
  return imports;
}

function extractExports(content) {
  const exports = [];
  const patterns = [
    [/export\s+const\s+(\w+)/g, 'const'],
    [/export\s+function\s+(\w+)/g, 'function'],
    [/export\s+default\s+function\s+(\w+)/g, 'default-function'],
    [/export\s+default\s+(\w+)/g, 'default']
  ];
  for (const [regex, type] of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      exports.push({ name: match[1], type });
    }
  }
  const groupRegex = /export\s*{([^}]+)}/g;
  let match;
  while ((match = groupRegex.exec(content)) !== null) {
    match[1].split(',').map(s => s.trim()).forEach(name => exports.push({ name, type: 'group' }));
  }
  return exports;
}

function isReactComponent(content) {
  const hasJSX = /<\s*[A-Za-z][\w-]*(\s|>|\/>)/.test(content);
  if (!hasJSX) return false;
  const exportPatterns = [
    /export\s+const\s+\w+\s*=/,           // export const Nombre =
    /export\s+function\s+\w+/,            // export function Nombre
    /export\s+default\s+(function\s+)?\w+/, // export default Nombre
  ];
  return exportPatterns.some(p => p.test(content));
}

function extractRoutes(content) {
  const routes = [];
  const regex = /<Route\s+path=["']([^"']+)["'][^>]*element=\{<([^>]+)\/>}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    routes.push({ path: match[1], element: match[2] });
  }
  return routes;
}

function extractContexts(content) {
  const contexts = [];
  const patterns = [
    [/const\s+(\w+)\s*=\s*createContext\s*\(\s*([^)]*)\s*\)/g, 'createContext', 1, 2],
    [/<(\w+\.Provider)\s*>/g, 'Provider', 1, null],
    [/export\s+const\s+use(\w+)\s*=\s*\(\)/g, 'hook', 1, null]
  ];
  for (const [regex, type, nameIdx, valIdx] of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (type === 'createContext') {
        contexts.push({ name: match[nameIdx], defaultValue: match[valIdx], type });
      } else if (type === 'hook') {
        contexts.push({ name: 'use' + match[nameIdx], type });
      } else {
        contexts.push({ name: match[nameIdx], type });
      }
    }
  }
  return contexts;
}

function extractTypes(content) {
  const types = [];
  const patterns = [
    [/export\s+interface\s+(\w+)/g, 'interface'],
    [/export\s+type\s+(\w+)/g, 'type']
  ];
  for (const [regex, kind] of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      types.push({ name: match[1], kind });
    }
  }
  return types;
}

function extractHooks(content) {
  const hooks = [];
  const patterns = [
    [/export\s+function\s+(use\w+)/g, 'function'],
    [/export\s+const\s+(use\w+)\s*=/g, 'const']
  ];
  for (const [regex, type] of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      hooks.push({ name: match[1], type });
    }
  }
  return hooks;
}

function buildTree(filePaths) {
  const root = {};
  for (const filePath of filePaths) {
    const parts = filePath.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) current[part] = null;
      else { current[part] = current[part] || {}; current = current[part]; }
    }
  }
  function render(node, indent = '') {
    let out = '';
    for (const key of Object.keys(node).sort()) {
      out += indent + (node[key] === null ? '📄' : '📁') + ' ' + key + '\n';
      if (node[key] !== null) out += render(node[key], indent + '  ');
    }
    return out;
  }
  return render(root);
}
function analyzeProject() {
  const files = walkDir(SRC_DIR);
  const data = { files: [], components: [], routes: [], contexts: [], types: [], hooks: [], dependencies: new Set() };
  for (const filePath of files) {
    const relPath = path.relative(SRC_DIR, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = extractImports(content);
    const exports = extractExports(content);
    const isComp = isReactComponent(content);
    const routes = extractRoutes(content);
    const contexts = extractContexts(content);
    const types = extractTypes(content);
    const hooks = extractHooks(content);
    for (const imp of imports) if (!imp.from.startsWith('.') && !imp.from.startsWith('/')) data.dependencies.add(imp.from);
    data.files.push({ path: relPath, imports, exports, isComponent: isComp, routes, contexts, types, hooks });
    if (isComp) data.components.push({ name: path.basename(filePath, path.extname(filePath)), path: relPath, exports: exports.map(e => e.name) });
    for (const r of routes) data.routes.push({ ...r, file: relPath });
    for (const c of contexts) data.contexts.push({ ...c, file: relPath });
    for (const t of types) data.types.push({ ...t, file: relPath });
    for (const h of hooks) data.hooks.push({ ...h, file: relPath });
  }
  return data;
}

function generateMarkdown(data) {
  let md = '# MotoLog - Contexto Estructural del Proyecto\n\n';
  md += '> Generado el ' + new Date().toLocaleString() + '\n';
  md += '> Para agentes de IA. No editar. Regenerar: npm run graph:generate\n\n';
  md += '## Estructura de Directorios\n```\n' + buildTree(data.files.map(f => f.path)) + '```\n\n';
  md += '## Componentes React\n';
  for (const c of data.components) {
    md += '### ' + c.name + '\n- Archivo: src/' + c.path + '\n';
    if (c.exports.length) md += '- Exports: ' + c.exports.join(', ') + '\n';
    md += '\n';
  }
  md += '## Rutas (React Router)\n';
  for (const r of data.routes) md += '- `' + r.path + '` → ' + r.element + ' (src/' + r.file + ')\n';
  md += '\n## Contextos y Estado Global\n';
  for (const c of data.contexts) md += '- **' + c.name + '** (' + c.type + ') en src/' + c.file + '\n';
  md += '\n## Hooks Personalizados\n';
  for (const h of data.hooks) md += '- **' + h.name + '** (' + h.type + ') en src/' + h.file + '\n';
  md += '\n## Tipos e Interfaces TypeScript\n';
  for (const t of data.types) md += '- **' + t.name + '** (' + t.kind + ') en src/' + t.file + '\n';
  md += '\n## Dependencias Externas\n';
  for (const d of Array.from(data.dependencies).sort()) md += '- ' + d + '\n';
  md += '\n## Grafo de Dependencias\n';
  for (const f of data.files) {
    if (f.imports.length) {
      md += '### src/' + f.path + '\n';
      for (const i of f.imports) {
        const names = i.names ? '{ ' + i.names.join(', ') + ' }' : i.name;
        md += '- Importa **' + names + '** desde `' + i.from + '`\n';
      }
      md += '\n';
    }
  }
  md += '---\n*Generado automáticamente para agentes de IA.*\n';
  return md;
}

function generateJSON(data) {
  return JSON.stringify({
    generated: new Date().toISOString(),
    project: 'MotoLog',
    description: 'Web app para gestionar y visualizar tracks GPX',
    files: data.files.map(f => ({ path: f.path, isComponent: f.isComponent, exports: f.exports.map(e => e.name), imports: f.imports.map(i => ({ from: i.from, names: i.names || [i.name] })), routes: f.routes, contexts: f.contexts, types: f.types, hooks: f.hooks })),
    components: data.components, routes: data.routes, contexts: data.contexts, hooks: data.hooks, types: data.types, dependencies: Array.from(data.dependencies).sort()
  }, null, 2);
}

console.log('Analizando MotoLog...');
const data = analyzeProject();
console.log(data.files.length + ' archivos, ' + data.components.length + ' componentes, ' + data.routes.length + ' rutas, ' + data.contexts.length + ' contextos, ' + data.hooks.length + ' hooks, ' + data.types.length + ' tipos, ' + data.dependencies.size + ' deps');
fs.writeFileSync(OUTPUT_MD, generateMarkdown(data), 'utf8');
console.log('Markdown: ' + path.relative(process.cwd(), OUTPUT_MD));
fs.writeFileSync(OUTPUT_JSON, generateJSON(data), 'utf8');
console.log('JSON: ' + path.relative(process.cwd(), OUTPUT_JSON));
console.log('Listo! Agentes pueden leer PROJECT_CONTEXT.md/json');