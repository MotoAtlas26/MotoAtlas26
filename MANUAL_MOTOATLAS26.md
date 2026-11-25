# 🏍️ MANUAL OFICIAL DE FLUJO, ARQUITECTURA Y GUÍA DE USUARIO — MotoAtlas26

> **Versión:** 1.0  
> **URL de producción:** https://motoatlas26.github.io/MotoAtlas26/  
> **Repositorio:** MotoAtlas26 (GitHub)  
> **Última actualización:** 2026

---

## 📑 ÍNDICE

1. [Arquitectura y Privacidad de Datos](#1-arquitectura-y-privacidad-de-datos)
2. [Flujo de Desarrollo y Administración (Propietario)](#2-flujo-de-desarrollo-y-administración-propietario)
3. [Guía Rápida de Instalación y Uso (Usuarios Invitados)](#3-guía-rápida-de-instalación-y-uso-usuarios-invitados)
4. [Copias de Seguridad Manuales](#4-copias-de-seguridad-manuales)

---

## 1. ARQUITECTURA Y PRIVACIDAD DE DATOS

### 1.1 Filosofía: **Local-First + Private Sync**

MotoAtlas26 está diseñado bajo el paradigma **local-first**:  
- **Todos los datos viven primero en el dispositivo del usuario** (navegador).  
- **No hay servidores centrales** que almacenen, lean o procesen información personal.  
- La sincronización es **opcional, privada y bajo control total del usuario** mediante su propia cuenta de Google Drive.

### 1.2 Base de Datos Local — Dexie / IndexedDB

| Capa | Tecnología | Detalles |
|------|------------|----------|
| **ORM** | [Dexie.js](https://dexie.org/) (v4) | Wrapper tipado sobre IndexedDB |
| **Almacenamiento** | IndexedDB (navegador) | Persistente, sobrevive a cierres y actualizaciones |
| **Esquema (v5)** | 10 tablas | Ver detalle abajo |

#### Tablas principales (`src/services/db.js`)

| Tabla | Clave primaria | Contenido |
|-------|----------------|-----------|
| `tracks` | `++id` | Rutas GPX: nombre, fecha, distancia, desnivel, duración, blobs GPX |
| `trackPoints` | `++id` | Puntos individuales: `trackId`, lat, lng, elevación, timestamp, secuencia |
| `images` | `++id` | Fotos/facturas: tipo (`invoice`, `moto_profile`, `track`), blob, metadatos |
| `maintenance` | `++id` | Registros de mantenimiento: moto, tipo, fecha, km, coste, taller, descripción |
| `motoProfile` | `++id` | Perfil técnico de la moto: modelo, año, VIN, compra, km actuales |
| `settings` | `++id` | Clave-valor: tema, preferencias, último sync, etc. |
| `uploads` | `++id` | Cola de subidas pendientes a Drive |
| `workshops` | `++id` | Talleres/concesionarios: nombre, especialidad, teléfono, dirección, CIF, por defecto |
| `motorcycles` | `++id` | Garaje: marca, modelo, año, matrícula, compra, km inicial/actual, neumáticos, ITV |
| `customThemes` | `++id` | Temas de color creados por el usuario: nombre, marca, colores primario/secundario/terciario |

> **Nota:** La BD se versiona automáticamente (actualmente v5). Dexie gestiona migraciones transparentes.

### 1.3 Sincronización Privada — Google Drive (`drive.file`)

#### Alcance OAuth (`src/services/googleDrive.js:9`)
```js
const SCOPES = 'https://www.googleapis.com/auth/drive.file openid email profile'
```
- **`drive.file`** → La app **solo ve y gestiona los archivos que ella misma crea** en el Drive del usuario.  
- **No accede** a ningún otro archivo, carpeta o documento personal.  
- **No hay servidor intermedio**: la app (cliente) habla directamente con `https://www.googleapis.com/drive/v3`.

#### Estructura en Drive del usuario
```
Mi Drive/
└── MotoAtlas26/                    ← Carpeta creada automáticamente
    ├── MotoAtlas26-db.json         ← Exportación completa de la BD (JSON)
    └── MotoAtlas26-backup-*.json   ← Backups con timestamp (opcional)
```

#### Flujo de sincronización (`src/context/AuthContext.jsx`)

| Evento | Acción |
|--------|--------|
| **Primer login** | 1. Busca/crea carpeta `MotoAtlas26`<br>2. Busca/crea `MotoAtlas26-db.json`<br>3. Si Drive está vacío → **sube** datos locales (`syncToDrive`)<br>4. Si Drive tiene datos → **descarga y fusiona** (`syncFromDrive`) |
| **Cambio en BD local** | Auto-sync con **debounce 2 s** (`db:changed` event) → `syncToDrive` |
| **Botón “Sincronizar ahora”** | `syncNow()` → `syncToDrive` inmediato |
| **Logout** | Revoca token, limpia estado local, **no borra datos locales** |

#### Formato `MotoAtlas26-db.json` (exportación completa)
```json
{
  "version": 1,
  "exportedAt": "2025-01-15T10:30:00.000Z",
  "tracks": [...],
  "trackPoints": [...],
  "images": [...],
  "maintenance": [...],
  "motoProfile": [...],
  "settings": [...],
  "uploads": [...],
  "workshops": [...],
  "motorcycles": [...],
  "customThemes": [...]
}
```
- **Estándar, legible, portable**: se puede abrir con `jq`, Python, Node, VS Code, etc.  
- **Blobs** (imágenes, GPX) se serializan como **Base64** dentro del JSON.

### 1.4 Acceso al Sistema de Archivos Local (File System Access API)

Además de Drive, la app ofrece **acceso directo a carpeta local** (`src/services/fileSystem.js`):
- Usuario elige una carpeta en su disco (`showDirectoryPicker`).
- La app lee/escribe `MotoAtlas26-db.json` y backups **directamente en esa carpeta**.
- Útil para: scripts propios, backups offline, migración manual, otras apps.

> **Requisito:** Navegador compatible (Chrome/Edge 86+, Opera 72+). En Safari/Firefox no disponible → se usa descarga/importación de archivo.

### 1.5 PWA & Offline-First

| Característica | Implementación |
|----------------|----------------|
| **Service Worker** | `public/sw.js` — Cache-first (assets), Network-first (navegación) |
| **Manifest** | `public/manifest.webmanifest` — `display: standalone`, iconos 192/512, maskable |
| **Instalación** | `beforeinstallprompt` + botón “Instalar MotoAtlas” en UI |
| **Offline** | Funciona 100% sin red (IndexedDB + SW cache). Sync se reintenta al volver online. |

---

## 2. FLUJO DE DESARROLLO Y ADMINISTRACIÓN (PROPIETARIO `MotoAtlas26`)

### 2.1 Ciclo de Actualización (Deploy Continuo)

```mermaid
graph LR
    A[Editar en VS Code] --> B[git add .]
    B --> C[git commit -m "mensaje"]
    C --> D[git push origin main]
    D --> E[GitHub Pages detecta push]
    E --> F[Build: npm run build]
    F --> G[Deploy HTTPS en https://motoatlas26.github.io/MotoAtlas26/]
```

#### Comandos habituales
```bash
# 1. Desarrollo local
npm run dev          # Vite dev server en http://localhost:5173

# 2. Build de producción (test local)
npm run build        # Genera carpeta dist/
npm run preview      # Sirve dist/ en http://localhost:4173

# 3. Commit & Push
git add .
git commit -m "feat: descripción clara"
git push origin main  # Despliega automáticamente en GitHub Pages
```

#### Configuración GitHub Pages (ya hecha)
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20
- **Environment variables:** `VITE_GOOGLE_CLIENT_ID` (ver abajo)
- **Deploy:** `npm run deploy` (usa `gh-pages` para publicar en `gh-pages` branch)

### 2.2 Variables de Entorno Requeridas

| Variable | Dónde | Valor |
|----------|-------|-------|
| `VITE_GOOGLE_CLIENT_ID` | GitHub → Settings → Secrets and variables → Actions | Client ID de **OAuth 2.0** (tipo “Aplicación web”) creado en Google Cloud Console |

> **Archivo local:** `.env.local` (no se commitea)
> ```env
> VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
> ```

### 2.3 Gestión de Acceso de Usuarios (Testers / Invitados)

MotoAtlas26 usa **Google OAuth en modo “Testing”** (no verificado).  
Solo los correos listados como **Usuarios de prueba** pueden iniciar sesión.

#### Pasos para dar de alta / revocar acceso

1. Abre **Google Cloud Console** → proyecto de MotoAtlas26.
2. Menú lateral → **APIs y servicios** → **Pantalla de consentimiento OAuth**.
3. Sección **Público** → **Usuarios de prueba**.
4. **Añadir usuarios**: introduce el correo Gmail del invitado → **Guardar**.
5. **Revocar**: marca el correo → **Eliminar**.

> **Límite:** 100 usuarios de prueba en modo Testing.  
> Para producción real → enviar app a **Verificación de Google** (proceso de revisión).

### 2.4 Regenerar Documentación del Proyecto

```bash
npm run graph:generate
```
Ejecuta `xGrapt/generate-project-graph.js` y actualiza:
- `PROJECT_CONTEXT.md` (legible)
- `PROJECT_CONTEXT.json` (estructurado)

---

## 3. GUÍA RÁPIDA DE INSTALACIÓN Y USO (USUARIOS INVITADOS)

### 3.1 Requisitos Previos
- **Cuenta de Google** (Gmail / Google Workspace).
- **Navegador moderno**:
  - Móvil: **iOS Safari 16.4+** / **Android Chrome 109+**
  - Escritorio: Chrome 109+, Edge 109+, Firefox 110+, Safari 16.4+
- **Conexión a Internet** (solo para login inicial y sync; después funciona offline).

### 3.2 Primer Acceso y Instalación (PWA)

| Plataforma | Pasos |
|------------|-------|
| **iPhone / iPad (Safari)** | 1. Abre `https://motoatlas26.github.io/MotoAtlas26/`<br>2. Toca **Compartir** (cuadrado con flecha ↑)<br>3. Desliza y elige **“Añadir a pantalla de inicio”**<br>4. Confirma → Icono hexagonal en Springboard |
| **Android (Chrome)** | 1. Abre `https://motoatlas26.github.io/MotoAtlas26/`<br>2. Menú ⋮ (3 puntos) → **“Instalar la app”** o **“Añadir a pantalla de inicio”**<br>3. Confirma → Icono en cajón de apps / pantalla de inicio |
| **Escritorio (Chrome/Edge)** | 1. Abre la URL<br>2. Barra de direcciones → icono **⬇️ Instalar** (o menú ⋮ → “Instalar MotoAtlas26”)<br>3. Se abre en ventana propia, sin barra de URL |

> **Icono:** Hexagonal, colores dorado/negro (`/icons/icon-192.png`, `/icons/icon-512.png`, maskable).

### 3.3 Conectar Google Drive (Sincronización Automática)

1. Abre la app instalada.
2. Menú lateral (☰) → **Configuración** → pestaña **Varios** (o banner superior “Conectar Google Drive”).
3. Pulsa **“Conectar Google Drive”**.
4. Elige tu cuenta Google → **Continuar** en la pantalla de consentimiento de MotoAtlas26.
   - Verás: *“MotoAtlas26 quiere acceder a sus archivos de Google Drive que ha creado o abierto con esta app”*.
5. Otorga permiso → La app crea/usa la carpeta **`MotoAtlas26/`** en **tu** Drive.
6. **Sincronización inicial**:
   - Si Drive está vacío → sube tus datos locales.
   - Si ya hay datos en Drive (otro dispositivo) → los descarga y fusiona.
7. A partir de ahora: **cualquier cambio** (nueva ruta, factura, taller, tema, moto) se sincroniza **automáticamente en ~2 s** (debounce) en todos tus dispositivos conectados con la misma cuenta.

### 3.4 Qué se Sincroniza (Todo, Privado, Tuyo)

| Categoría | Tablas IndexedDB | Ejemplos |
|-----------|------------------|----------|
| **Rutas GPX** | `tracks`, `trackPoints` | Tracks, puntos, elevación, velocidad, blobs GPX |
| **Fotos / Facturas** | `images` | Fotos de moto, facturas de taller, tickets, documentos |
| **Mantenimiento** | `maintenance` | Cambios de aceite, neumáticos, revisiones, costes |
| **Garaje (Motos)** | `motorcycles`, `motoProfile` | Ficha técnica, neumáticos, ITV, km, foto de perfil |
| **Talleres** | `workshops` | Concesionarios, multimarca, automantenimiento |
| **Temas Personalizados** | `customThemes` | Tus paletas de color (primario/secundario/terciario) |
| **Ajustes** | `settings` | Tema activo, preferencias de UI, último sync |

> **Privacidad:** Solo tú ves tus datos. Ni el desarrollador ni Google (más allá del almacenamiento encriptado en sus servidores) acceden al contenido.

### 3.5 Uso Básico Diario

| Acción | Dónde |
|--------|-------|
| **Ver/añadir rutas** | Pestaña **Rutas** → “+” → Importar GPX o grabar nuevo |
| **Ver mapa** | Toca una ruta → Mapa interactivo (Leaflet) |
| **Añadir factura/foto** | **Moto** → **Facturas** → “+” → Foto o archivo |
| **Registrar mantenimiento** | **Moto** → **Mantenimiento** → “+” |
| **Gestionar talleres** | **Configuración** → **Listados** → Talleres |
| **Gestionar motos (garaje)** | **Configuración** → **Listados** → Motos |
| **Crear tema de color** | **Configuración** → **Apariencia** → “+ Tema personalizado” |
| **Forzar sync ahora** | **Configuración** → **Varios** → “Sincronizar ahora” |
| **Ver estado de sync** | Banner superior / Configuración → Varios (icono nube ✓/✗/⟳) |

---

## 4. COPIAS DE SEGURIDAD MANUALES (EXPORTAR / IMPORTAR JSON)

### 4.1 Desde la Interfaz (Configuración → Varios)

1. Abre **Configuración** (⚙️) → pestaña **Varios**.
2. Sección **“Copias de seguridad”**.

#### Exportar (Descargar JSON)
- Botón **“Descargar backup”** → Genera `MotoAtlas26-backup-YYYY-MM-DDTHH-MM-SS.json` en tu carpeta *Descargas*.
- Contiene **exportación completa** de la BD (ver formato en §1.3).

#### Importar (Restaurar desde archivo)
- Botón **“Importar backup”** → Selecciona un `.json` previo → **Confirma** (sobrescribe datos locales actuales).
- Útil para: migrar a nuevo dispositivo sin Drive, recuperar versión anterior, mover entre perfiles.

#### Backups con File System Access API (Escritorio Chrome/Edge)
Si has concedido acceso a carpeta local (§1.4):
- **“Crear backup en carpeta”** → Guarda `MotoAtlas26-backup-*.json` directamente en tu carpeta elegida.
- **“Listar backups”** → Muestra historial con fecha/hora → **“Restaurar”** sobre cualquiera.

### 4.2 Formato del Archivo de Backup (Referencia Rápida)

```json
{
  "version": 1,
  "exportedAt": "2025-01-15T10:30:00.000Z",
  "tracks": [
    { "id": 1, "name": "Ruta Pirineos", "date": "2024-07-15T09:00:00.000Z", "distance": 342.5, "elevationGain": 4200, ... }
  ],
  "trackPoints": [
    { "id": 1, "trackId": 1, "lat": 42.1234, "lng": 1.5678, "elevation": 1200, "timestamp": "2024-07-15T09:05:00.000Z", "sequence": 0 }
  ],
  "images": [
    { "id": 1, "type": "invoice", "motoId": 3, "fileName": "factura_aceite.pdf", "mimeType": "application/pdf", "size": 245760, "blob": "base64...", "description": "Cambio aceite 10k km", "tags": ["mantenimiento", "aceite"] }
  ],
  "maintenance": [ ... ],
  "motoProfile": [ ... ],
  "settings": [ ... ],
  "uploads": [ ... ],
  "workshops": [ ... ],
  "motorcycles": [ ... ],
  "customThemes": [ ... ]
}
```

> **Blobs (imágenes, PDFs, GPX)** → codificados en **Base64** dentro del JSON.  
> Tamaño típico: 1–50 MB según fotos/facturas.

### 4.3 Buenas Prácticas de Backup

| Frecuencia | Acción |
|------------|--------|
| **Semanal** | “Descargar backup” y guardar en carpeta segura (PC, NAS, nube personal). |
| **Antes de cambios grandes** | Importar GPX masivo, borrar datos, cambiar de móvil → backup previo. |
| **Mensual** | Verificar que el archivo `.json` se abre y pesa > 0 bytes. |
| **Drive** | La sync automática ya es backup continuo; el manual es **capa extra**. |

### 4.4 Restauración en Nuevo Dispositivo (Sin Drive)

1. Instala la PWA en el nuevo dispositivo (§3.2).
2. **Configuración → Varios → Importar backup** → Elige el `.json` guardado.
3. Datos restaurados al 100% (incluye fotos, GPX, temas, motos, talleres).
4. Opcional: Conecta Drive después para volver a tener sync multi-dispositivo.

---

## 📎 ANEXOS

### A. Estructura de Rutas de la App (`src/App.jsx`)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/home` | `Home` | Dashboard: resumen, stats, accesos rápidos |
| `/moto` | `Moto` | Ficha moto, mantenimiento, garaje |
| `/moto/facturas` | `Facturas` | Gestor de facturas/documentos |
| `/tracks` | `TrackList` | Lista de rutas GPX + importar/exportar |
| `/settings` | `Settings` | Apariencia, Listados (talleres/motos), Varios (sync, backup, FS) |
| `/fileUpload` | `FileUpload` | Subida masiva GPX/imágenes |
| `/mapContainer` | `MapContainer` | Mapa a pantalla completa (Leaflet) |

### B. Scripts `package.json` Relevantes

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "graph:generate": "node xGrapt/generate-project-graph.js"
  }
}
```

### C. Recursos Útiles

- **Repo GitHub:** (privado) — `git@github.com:usuario/MotoAtlas26.git`
- **GitHub Pages:** https://motoatlas26.github.io/MotoAtlas26/
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials (proyecto MotoAtlas26)
- **Documentación técnica generada:** `PROJECT_CONTEXT.md` / `PROJECT_CONTEXT.json`

---

## 📝 HISTORIAL DE CAMBIOS DEL MANUAL

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-01-15 | Luna Code | Creación inicial: 4 bloques completos |

---

> **MotoAtlas26** — Tu atlas motero, privado y sincronizado.  
> *Hecho con ❤️ para la comunidad motera.*