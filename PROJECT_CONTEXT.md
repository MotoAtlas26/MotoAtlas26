# MotoLog - Contexto Estructural del Proyecto

> Generado el 11/23/2026, 4:41:55 PM
> Para agentes de IA. No editar. Regenerar: npm run graph:generate

## Estructura de Directorios
```
📄 App.jsx
📁 components
  📁 home
    📄 Home.jsx
  📁 layout
    📄 MainLayout.jsx
    📄 Sidebar.jsx
  📁 moto
    📄 Documentacion.jsx
    📄 Facturas.jsx
    📄 Mantenimiento.jsx
    📄 Moto.jsx
  📁 settings
    📄 Settings.jsx
  📁 shared
    📄 BlobImage.jsx
    📄 EmptyState.jsx
    📄 Icons.jsx
    📄 InstallAppButton.jsx
    📄 Modal.jsx
    📄 MotoLogLogo.jsx
    📄 SectionHeader.jsx
    📄 SettingCard.jsx
    📄 StatRow.jsx
    📄 Tabs.jsx
    📄 ThemeSelect.jsx
    📄 index.js
  📁 tracks
    📄 MapContainer.jsx
    📄 TrackList.jsx
  📁 upload
    📄 FileUpload.jsx
    📄 ImageUpload.jsx
📁 constants
  📄 colors.js
  📄 motoModels.js
  📄 themes.js
📁 context
  📄 AuthContext.jsx
  📄 GPXContext.jsx
📁 hooks
  📄 useBlobUrl.js
  📄 useDatabase.js
📄 index.css
📄 main.jsx
📁 services
  📄 db.js
  📄 fileSystem.js
  📄 googleDrive.js
📁 styles
  📄 components.css
  📄 forms.css
  📄 home.css
  📄 layout.css
  📄 leaflet-overrides.css
  📄 reset.css
  📄 utilities.css
  📄 variables.css
📁 types
  📄 gpx.js
📁 utils
  📄 formatters.js
  📄 gpxHelpers.js
  📄 invoiceParser.js
  📄 themeEngine.js
```

## Componentes React
### App
- Archivo: src/App.jsx
- Exports: App, App

### Home
- Archivo: src/components/home/Home.jsx
- Exports: Home

### MainLayout
- Archivo: src/components/layout/MainLayout.jsx
- Exports: MainLayout, MainLayout

### Sidebar
- Archivo: src/components/layout/Sidebar.jsx
- Exports: Sidebar, Sidebar

### Documentacion
- Archivo: src/components/moto/Documentacion.jsx
- Exports: Documentacion, Documentacion

### Facturas
- Archivo: src/components/moto/Facturas.jsx
- Exports: Facturas, Facturas

### Mantenimiento
- Archivo: src/components/moto/Mantenimiento.jsx
- Exports: Mantenimiento

### Moto
- Archivo: src/components/moto/Moto.jsx
- Exports: Moto, Moto

### Settings
- Archivo: src/components/settings/Settings.jsx
- Exports: Settings, Settings

### BlobImage
- Archivo: src/components/shared/BlobImage.jsx
- Exports: BlobImage, BlobImage

### EmptyState
- Archivo: src/components/shared/EmptyState.jsx
- Exports: EmptyState, EmptyState

### Icons
- Archivo: src/components/shared/Icons.jsx
- Exports: HomeIcon, MapIcon, UploadIcon, TracksIcon, SunIcon, MoonIcon, CFMotoGoldIcon, CFMotoNeutralIcon, MotoIcon, RouteIcon, ImageIcon, TrashIcon, SettingsIcon, FolderIcon, RefreshCwIcon, ClockIcon, CheckIcon, CheckCircleIcon, AlertCircleIcon, DownloadIcon, EditIcon, WrenchIcon, UserIcon, PaletteIcon, PlusIcon, CloudIcon, CloudOffIcon, SyncIcon, LogOutIcon, UserCircleIcon, ShieldIcon, FileTextIcon, FileIcon, PhoneIcon, EyeIcon, AlertIcon, CalendarIcon

### InstallAppButton
- Archivo: src/components/shared/InstallAppButton.jsx
- Exports: InstallAppButton

### Modal
- Archivo: src/components/shared/Modal.jsx
- Exports: Modal, Modal

### MotoLogLogo
- Archivo: src/components/shared/MotoLogLogo.jsx
- Exports: MotoAtlas26Logo, MotoAtlas26Logo

### SectionHeader
- Archivo: src/components/shared/SectionHeader.jsx
- Exports: SectionHeader, SectionHeader

### SettingCard
- Archivo: src/components/shared/SettingCard.jsx
- Exports: SettingCard, SettingCard

### StatRow
- Archivo: src/components/shared/StatRow.jsx
- Exports: StatRow, StatGrid, StatRow

### Tabs
- Archivo: src/components/shared/Tabs.jsx
- Exports: Tabs, Tabs

### ThemeSelect
- Archivo: src/components/shared/ThemeSelect.jsx
- Exports: ThemeSelect

### MapContainer
- Archivo: src/components/tracks/MapContainer.jsx
- Exports: GPXMapContainer, GPXMapContainer

### TrackList
- Archivo: src/components/tracks/TrackList.jsx
- Exports: TrackList, TrackList

### FileUpload
- Archivo: src/components/upload/FileUpload.jsx
- Exports: FileUpload, FileUpload

### ImageUpload
- Archivo: src/components/upload/ImageUpload.jsx
- Exports: ImageUpload, ImageUpload

### themes
- Archivo: src/constants/themes.js
- Exports: THEMES, getDefaultTheme, getThemesList

### googleDrive
- Archivo: src/services/googleDrive.js
- Exports: initGoogleClient, getConnectionStatus, tokenClient, accessToken, currentUser

### invoiceParser
- Archivo: src/utils/invoiceParser.js
- Exports: parseInvoiceText, matchWorkshop

### themeEngine
- Archivo: src/utils/themeEngine.js
- Exports: getSavedTheme, initTheme, getThemeById, getThemesList

## Rutas (React Router)
- `/` → Home  (src/App.jsx)
- `/home` → Navigate to="/" replace  (src/App.jsx)
- `/moto` → Moto  (src/App.jsx)
- `/moto/facturas` → Facturas  (src/App.jsx)
- `/tracks` → TrackList  (src/App.jsx)
- `/settings` → Settings  (src/App.jsx)
- `/fileUpload` → FileUpload  (src/App.jsx)
- `/mapContainer` → MapContainer  (src/App.jsx)

## Contextos y Estado Global
- **AuthContext** (createContext) en src/context/AuthContext.jsx
- **useAuth** (hook) en src/context/AuthContext.jsx
- **GPXContext** (createContext) en src/context/GPXContext.jsx
- **useGPX** (hook) en src/context/GPXContext.jsx

## Hooks Personalizados
- **useAuth** (const) en src/context/AuthContext.jsx
- **useGPX** (const) en src/context/GPXContext.jsx
- **useBlobUrl** (const) en src/hooks/useBlobUrl.js
- **useBlobUrls** (const) en src/hooks/useBlobUrl.js
- **useDatabase** (function) en src/hooks/useDatabase.js
- **useFileSystem** (function) en src/services/fileSystem.js

## Tipos e Interfaces TypeScript

## Dependencias Externas
- dexie
- leaflet
- react
- react-dom/client
- react-leaflet
- react-router-dom

## Grafo de Dependencias
### src/App.jsx
- Importa **{ BrowserRouter as Router, Routes, Route, Navigate }** desde `react-router-dom`
- Importa **{ GPXMapContainer as MapContainer }** desde `./components/tracks/MapContainer`
- Importa **{ FileUpload }** desde `./components/upload/FileUpload`
- Importa **{ TrackList }** desde `./components/tracks/TrackList`
- Importa **{ Home }** desde `./components/home/Home`
- Importa **{ Moto }** desde `./components/moto/Moto`
- Importa **{ Facturas }** desde `./components/moto/Facturas`
- Importa **{ Settings }** desde `./components/settings/Settings`
- Importa **{ MainLayout }** desde `./components/layout/MainLayout`
- Importa **{ GPXProvider, useGPX }** desde `./context/GPXContext`

### src/components/home/Home.jsx
- Importa **{ useGPX }** desde `../../context/GPXContext`
- Importa **{ useAuth }** desde `../../context/AuthContext`
- Importa **{ MotoAtlas26Logo }** desde `../shared`
- Importa **{ CloudIcon, CloudOffIcon, SyncIcon, CheckCircleIcon, LogOutIcon }** desde `../shared/Icons`
- Importa **{ getMotoModel }** desde `../../constants/motoModels`
- Importa **cfmoto800Img** desde `../../assets/motos/800MT-X.webp`
- Importa **ktm1290Img** desde `../../assets/motos/KTM-1290-S-Adv-S.webp`

### src/components/layout/MainLayout.jsx
- Importa **{ Outlet, useLocation }** desde `react-router-dom`
- Importa **{ Sidebar }** desde `./Sidebar`
- Importa **{ MotoAtlas26Logo }** desde `../shared`
- Importa **{ ErrorBoundary }** desde `../../App`

### src/components/layout/Sidebar.jsx
- Importa **React** desde `react`
- Importa **{ NavLink }** desde `react-router-dom`
- Importa **{ MotoIcon, RouteIcon, SettingsIcon, HomeIcon }** desde `../shared/Icons`
- Importa **{ MotoAtlas26Logo }** desde `../shared`

### src/components/moto/Documentacion.jsx
- Importa **{ useDatabase }** desde `../../hooks/useDatabase`
- Importa **{ useGPX }** desde `../../context/GPXContext`
- Importa **{ Modal, SectionHeader, BlobImage }** desde `../shared`
- Importa **{ formatDate, formatFileSize }** desde `../../utils/formatters`
- Importa **{ getMotoModel, getMotoModelsArray }** desde `../../constants/motoModels`
- Importa **{ TrashIcon, EditIcon, EyeIcon, DownloadIcon, AlertIcon, CheckIcon, CalendarIcon, PhoneIcon, ShieldIcon, FileIcon, UploadIcon }** desde `../shared/Icons`

### src/components/moto/Facturas.jsx
- Importa **{ Link }** desde `react-router-dom`
- Importa **{ ImageUpload }** desde `../upload/ImageUpload`
- Importa **{ db }** desde `../../services/db`
- Importa **{ useGPX }** desde `../../context/GPXContext`
- Importa **{ EmptyState, Modal, SectionHeader, BlobImage }** desde `../shared`
- Importa **{ formatFileSize, formatDate, getFileIcon }** desde `../../utils/formatters`
- Importa **{ getMotoModel, getMotoModelsArray }** desde `../../constants/motoModels`
- Importa **{ TrashIcon, UploadIcon }** desde `../shared/Icons`
- Importa **{ useBlobUrl }** desde `../../hooks/useBlobUrl`
- Importa **invoiceParser** desde `../../utils/invoiceParser`

### src/components/moto/Mantenimiento.jsx
- Importa **{ Link }** desde `react-router-dom`
- Importa **{ db }** desde `../../services/db`
- Importa **{ useGPX }** desde `../../context/GPXContext`
- Importa **{ useDatabase }** desde `../../hooks/useDatabase`
- Importa **{ EmptyState, Modal, SectionHeader, BlobImage }** desde `../shared`
- Importa **{ formatFileSize, formatDate, formatDateTime }** desde `../../utils/formatters`
- Importa **{ getMotoModelsArray, getDefaultMotoModel }** desde `../../constants/motoModels`
- Importa **{ TrashIcon, CheckIcon, EditIcon }** desde `../shared/Icons`

### src/components/moto/Moto.jsx
- Importa **{ Link }** desde `react-router-dom`
- Importa **{ ImageUpload }** desde `../upload/ImageUpload`
- Importa **{ useGPX }** desde `../../context/GPXContext`
- Importa **{ Modal, SectionHeader, BlobImage }** desde `../shared`
- Importa **{ formatFileSize, formatDateTime, getFileIcon }** desde `../../utils/formatters`
- Importa **{ getMotoModel, getMotoModelsArray }** desde `../../constants/motoModels`
- Importa **{ Mantenimiento }** desde `./Mantenimiento`
- Importa **{ Documentacion }** desde `./Documentacion`
- Importa **{ TrashIcon, UploadIcon, FileTextIcon }** desde `../shared/Icons`

### src/components/settings/Settings.jsx
- Importa **{ Link }** desde `react-router-dom`
- Importa **{ useGPX }** desde `../../context/GPXContext`
- Importa **{ useDatabase }** desde `../../hooks/useDatabase`
- Importa **{ useAuth }** desde `../../context/AuthContext`
- Importa **{ EmptyState, SectionHeader, SettingCard, Tabs, Modal, InstallAppButton, ThemeSelect }** desde `../shared`
- Importa **{ formatBackupName }** desde `../../utils/formatters`
- Importa **{ getMotoModelsArray, getMotoModel }** desde `../../constants/motoModels`
- Importa **{ getThemesList, THEMES }** desde `../../constants/themes`
- Importa **{ applyThemeToDocument, validateActiveTheme, refreshActiveCustomTheme, getSavedTheme }** desde `../../utils/themeEngine`
- Importa **{ TrashIcon, DownloadIcon, UploadIcon, FolderIcon, RefreshCwIcon, EditIcon, WrenchIcon, UserIcon, CheckCircleIcon, MotoIcon, PaletteIcon, PlusIcon, CloudIcon, CloudOffIcon, SyncIcon, LogOutIcon, UserCircleIcon }** desde `../shared/Icons`

### src/components/shared/BlobImage.jsx
- Importa **React** desde `react`
- Importa **{ useBlobUrl }** desde `../../hooks/useBlobUrl`

### src/components/shared/EmptyState.jsx
- Importa **React** desde `react`

### src/components/shared/Icons.jsx
- Importa **React** desde `react`
- Importa **{ MOTOATLAS26_GOLD, MOTOATLAS26_NEUTRAL_LIGHT }** desde `../../constants/colors`

### src/components/shared/MotoLogLogo.jsx
- Importa **React** desde `react`

### src/components/shared/SectionHeader.jsx
- Importa **React** desde `react`

### src/components/shared/SettingCard.jsx
- Importa **React** desde `react`

### src/components/shared/StatRow.jsx
- Importa **React** desde `react`

### src/components/shared/Tabs.jsx
- Importa **React** desde `react`

### src/components/tracks/MapContainer.jsx
- Importa **{ MapContainer, TileLayer, Polyline, Popup, Marker }** desde `react-leaflet`
- Importa **L** desde `leaflet`
- Importa **{ useGPX }** desde `../../context/GPXContext`
- Importa **{ simplifyTrack }** desde `../../utils/gpxHelpers`

### src/components/tracks/TrackList.jsx
- Importa **{ Link }** desde `react-router-dom`
- Importa **{ useGPX }** desde `../../context/GPXContext`
- Importa **{ EmptyState, SectionHeader, StatRow, StatGrid }** desde `../shared`
- Importa **{ formatDistance, formatTime, formatElevation, formatSpeed }** desde `../../utils/formatters`
- Importa **{ TrashIcon }** desde `../shared/Icons`
- Importa **{ useDatabase }** desde `../../hooks/useDatabase`

### src/components/upload/FileUpload.jsx
- Importa **{ useGPX }** desde `../../context/GPXContext`

### src/components/upload/ImageUpload.jsx
- Importa **{ useGPX }** desde `../../context/GPXContext`
- Importa **{ db }** desde `../../services/db`
- Importa **{ UploadIcon, ImageIcon }** desde `../shared/Icons`

### src/constants/colors.js
- Importa **{ THEMES }** desde `./themes`

### src/constants/motoModels.js
- Importa **cfmoto800mtx** desde `../assets/motos/800MT-X.webp`
- Importa **ktm1290** desde `../assets/motos/KTM-1290-S-Adv-S.webp`

### src/constants/themes.js
- Importa **{ db }** desde `../services/db`

### src/context/AuthContext.jsx
- Importa **{ db }** desde `../services/db`
- Importa **{ signIn, signOut, getCurrentUser, ensureMotoAtlas26Folder, findOrCreateDBFile, readDBFile, writeDBFile, syncFromDrive, syncToDrive, getConnectionStatus }** desde `../services/googleDrive`

### src/context/GPXContext.jsx
- Importa **{ db, initDB }** desde `../services/db`
- Importa **{ fileSystem }** desde `../services/fileSystem`

### src/hooks/useBlobUrl.js
- Importa **{ useState, useEffect }** desde `react`

### src/hooks/useDatabase.js
- Importa **{ useCallback }** desde `react`
- Importa **{ db }** desde `../services/db`

### src/main.jsx
- Importa **React** desde `react`
- Importa **ReactDOM** desde `react-dom/client`
- Importa **{ initTheme }** desde `./utils/themeEngine`
- Importa **{ AuthProvider }** desde `./context/AuthContext`
- Importa **{ GPXProvider }** desde `./context/GPXContext`
- Importa **App** desde `./App`

### src/services/db.js
- Importa **Dexie** desde `dexie`

### src/services/fileSystem.js
- Importa **React** desde `react`

### src/utils/themeEngine.js
- Importa **{ getThemeById, THEMES, getDefaultTheme }** desde `../constants/themes`
- Importa **{ db }** desde `../services/db`

---
*Generado automáticamente para agentes de IA.*
