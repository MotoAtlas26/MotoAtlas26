# Guía para Agentes IA - MotoAtlas26

Este documento explica cómo obtener contexto estructural del proyecto MotoAtlas26 sin necesidad de analizar todo el código.

## 📋 Archivos de Contexto Generados

El proyecto MotoAtlas26 incluye dos archivos que se generan automáticamente:

| Archivo | Formato | Uso |
|---------|---------|-----|
| `PROJECT_CONTEXT.md` | Markdown | Legible para humanos y agentes, visión general completa |
| `PROJECT_CONTEXT.json` | JSON | Procesable programáticamente, datos estructurados |

## 🔄 Cómo Regenerar el Contexto

```bash
npm run graph:generate
```

Este comando ejecuta `xGrapt/generate-project-graph.js` que analiza la estructura del proyecto y actualiza ambos archivos.

## 📖 Qué Contiene el Contexto

### 1. Estructura de Directorios
Árbol visual de la organización del código fuente.

### 2. Componentes React
Lista de todos los componentes detectados con:
- Nombre del componente
- Archivo fuente
- Exports disponibles

### 3. Rutas (React Router)
Mapeo de rutas URL → Componente que se renderiza.

### 4. Contextos y Estado Global
Contextos de React (createContext, Provider) y hooks de estado global.

### 5. Hooks Personalizados
Hooks creados en el proyecto (useGPX, etc.)

### 6. Tipos e Interfaces TypeScript
Interfaces y types exportados (GPXTrack, GPXTrackPoint, UploadResult)

### 7. Dependencias Externas
Paquetes npm utilizados en el proyecto.

### 8. Grafo de Dependencias
Para cada archivo: qué módulos importa y de dónde.

## 🚀 Uso Recomendado para Nuevos Agentes

Al iniciar una nueva conversación o cambiar de agente en MotoAtlas26:

1. **Leer `PROJECT_CONTEXT.md`** - Para obtener visión general inmediata de MotoAtlas26
2. **Consultar `PROJECT_CONTEXT.json`** - Si necesitas datos estructurados para scripts de MotoAtlas26
3. **Solo leer archivos específicos** - Cuando necesites detalles de implementación de MotoAtlas26

## 📝 Cuándo Regenerar

Ejecuta `npm run graph:generate` en MotoAtlas26 cuando:
- Añadas/eliminas componentes
- Cambies la estructura de rutas
- Añadas nuevos contextos o hooks
- Modifiques las interfaces TypeScript
- Cambies dependencias principales

## 🔧 Script de Generación

El script está en `xGrapt/generate-project-graph.js`. Utiliza análisis estático con regex para detectar:
- Imports/Exports
- Componentes React (funciones que devuelven JSX)
- Rutas de React Router
- Contextos (createContext, Provider, useHook)
- Tipos TypeScript (interface, type)
- Hooks personalizados (use*)

## ⚠️ Limitaciones

- Detecta componentes por patrones de export + JSX (puede tener falsos positivos/negativos)
- No analiza lógica interna de componentes
- No detecta componentes dinámicos o HOCs complejos
- Archivos .jsx y .tsx duplicados aparecen ambos (es intencional para ver ambos)

---

*Generado automáticamente para MotoAtlas26 - Para actualizar: `npm run graph:generate`*