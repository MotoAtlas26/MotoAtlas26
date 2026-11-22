import re

# Leer el script actual
with open('/Users/salvadorcruz/Develop/ProyectosIA/MotoLog/xGrapt/generate-project-graph.js', 'r') as f:
    script = f.read()

# Buscar la función isReactComponent
old_start = 'function isReactComponent(content) {'
idx = script.index(old_start)

# Encontrar el final de la función contando llaves
brace = 0
end = idx
for i in range(idx, len(script)):
    if script[i] == '{':
        brace += 1
    elif script[i] == '}':
        brace -= 1
        if brace == 0:
            end = i + 1
            break

# Nueva función
new_func = '''function isReactComponent(content) {
  const hasJSX = /<\\s*[A-Za-z][\\w-]*(\\s|>|\\/>)/.test(content);
  if (!hasJSX) return false;
  const exportPatterns = [
    /export\\s+const\\s+\\w+\\s*=/,           // export const Nombre =
    /export\\s+function\\s+\\w+/,            // export function Nombre
    /export\\s+default\\s+(function\\s+)?\\w+/, // export default Nombre
  ];
  return exportPatterns.some(p => p.test(content));
}'''

# Reemplazar
script = script[:idx] + new_func + script[end:]

# Guardar
with open('/Users/salvadorcruz/Develop/ProyectosIA/MotoLog/xGrapt/generate-project-graph.js', 'w') as f:
    f.write(script)

print('Función actualizada correctamente')