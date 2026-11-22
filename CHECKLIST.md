# Checklist de Opciones - MotoAtlas26

## 📋 Leyenda de estados
| Símbolo | Significado | Estado |
|--------|-------------|--------|
| [ ]    | Pendiente    | Listo para implementar |
| [-]    | En desarrollo| Trabajo en progreso |
| [p]    | Por desarrollar| Punto seleccionado para comenzar |
| [c]    | Completado   | Funcionalidad terminada y probada |
| [r]    | Revisión     | En QA o revisión final |
| [x]    | Bloqueado    | Dependencia o impedimento |

## 🗂️ Funcionalidades Principales
- [p] Subir archivos GPX (arrastrar y soltar + selector de archivos)
- [c] Parsear y visualizar tracks en mapa interactivo (Leaflet) - Mapa apunta a Sevilla por defecto
- [c] Mostrar información del track (distancia, puntos)
- [ ] Exportar tracks a formatos (KML, CSV, GeoJSON)

## 💾 Almacenamiento y Persistencia
- [c] LocalStorage (funcionamiento offline básico)
- [ ] Google Drive API (subir/gestionar archivos en Drive)
- [ ] Base de datos ligera (IndexedDB para metadatos)
- [ ] Sincronización entre dispositivos

## 🎨 Interfaz de Usuario
- [c] Interfaz básica de inicio con menú de opciones (Home.jsx)
- [c] Botón Home en el título/logo de la sidebar
- [c] Paleta exacta del dashboard
- [c] Tema claro/oscuro automático y manual
- [c] Vista de mapa principal (MapContainer en /mapContainer)
- [c] Sidebar navegable con 4 secciones principales: Home, Moto, Tracks, Configuración
- [c] Subir GPX y Ver Mapa integrados como acciones internas de Tracks
- [ ] Vista de tabla con datos del track
- [ ] Panel de control con estadísticas
- [ ] Búsqueda y filtros avanzados
- [ ] Modo móvil optimizado
- [ ] Animaciones y transiciones suaves

## 🔐 Seguridad y Perfiles
- [ ] Autenticación básica (email/contraseña)
- [ ] Perfiles de usuario (público/privado)
- [ ] Compartir tracks por enlace público
- [ ] Control de acceso por roles

## 🌐 Integraciones Externas
- [ ] Google Maps (alternativa a Leaflet)
- [ ] Weather API (mostrar clima en el track)
- [ ] Redes sociales (compartir en Twitter/Facebook)
- [ ] API REST para desarrolladores externos

## ☁️ Escalabilidad - Oracle Cloud Free
- [ ] Backend en Oracle Functions
- [ ] Base de datos Oracle para metadatos
- [ ] Almacenamiento en Oracle Object Storage
- [ ] Autenticación con Oracle Identity
- [ ] API Gateway para endpoints seguros
- [ ] Monitoreo y logging con Oracle Monitoring

## 📱 Características Avanzadas
- [ ] Service Worker para PWA
- [ ] Notificaciones push de tracks nuevos
- [ ] Grabación de tracks en tiempo real (GPS)
- [ ] Análisis de rendimiento (velocidad, pendiente)
- [ ] Comentarios y valoraciones de tracks
- [ ] Recomendaciones de tracks similares

## 🛠️ Herramientas de Desarrollo
- [c] Configuración de entorno (desarrollo/producción) - Vite + React
- [c] Scripts de generación de contexto estructural (xGrapt/generate-project-graph.js)
- [ ] Scripts de despliegue automatizados
- [ ] Testing unitario e integración
- [c] Documentación automática (PROJECT_CONTEXT.md/json + AGENTS.md)
- [ ] Debugging tools en tiempo real

## 🏗️ Migración y Refactorización
- [c] Eliminación de TypeScript (.tsx, .ts, tsconfig.json)
- [c] Conversión a JavaScript puro con JSDoc para tipos
- [c] Renombrado carpeta scripts/ → xGrapt/
- [c] Proyecto build sin TypeScript
- [c] Contexto estructural para agentes IA (PROJECT_CONTEXT.md/json)
- [c] Corrección de rutas (home, settings) y navegación Sidebar
- [c] Corrección export default en Moto.jsx
- [c] SVG 800MT-X.svg movido a public/ para acceso correcto

---

## 🎯 Propuesta de Fase Inicial (MVP)

### Fase 1 - MVP Básico (2-3 días) ✅ COMPLETADA
- [c] Subir archivos GPX
- [c] Parsear y visualizar en mapa (centrado en Sevilla)
- [ ] Vista de tabla básica
- [c] LocalStorage para guardado
- [c] Tema claro/oscuro
- [c] Página Home con menú de opciones
- [c] Botón Home en sidebar
- [c] Sidebar con 4 secciones: Home, Moto, Tracks, Configuración
- [c] Acciones internas en Tracks: Subir GPX, Ver Mapa
- [c] Rutas corregidas (/home, /settings)
- [c] Build exitoso sin errores

### Fase 2 - Integración Drive (1-2 días)
- [ ] Google Drive API
- [ ] Compartir tracks públicos
- [ ] Sincronización básica

### Fase 3 - Escala Oracle (3-5 días)
- [ ] Backend Oracle Functions
- [ ] Base de datos Oracle
- [ ] Autenticación Oracle Identity

---

**Nota:** Este checklist se puede retomar en cualquier momento para incluir o retirar opciones. Para actualizar el estado de una opción:
- Cambia `[ ]` → `[p]` cuando me indiques qué punto quieres que desarrolle primero
- Cambia `[p]` → `[-]` cuando empieces a trabajar en ella
- Cambia `[-]` → `[c]` cuando la termines y haya sido probada
- Cambia `[-]` → `[r]` si necesita revisión final
- Cambia `[ ]` → `[x]` si está bloqueada por una dependencia

---

**Estado actual:** Fase 1 (MVP) ✅ COMPLETADA
- Proyecto 100% JavaScript (sin TypeScript)
- Build funcionando con Vite
- Contexto estructural generado para agentes IA
- Página Home + Mapa + Subida GPX + Tracks + Sidebar navegable
- Sidebar con 4 secciones principales (Home, Moto, Tracks, Configuración)
- Subir GPX y Ver Mapa como acciones internas de Tracks
- Rutas corregidas: /home, /settings, /mapContainer
- SVG 800MT-X.svg en public/ para acceso directo
- Export default corregido en Moto.jsx