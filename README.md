# 📝 Todo PWA – React + TypeScript

Aplicación web progresiva (**PWA**) desarrollada con **React**, **TypeScript** y **Vite**, que permite gestionar una lista de tareas (To-Do) con estados, persistencia local y opción de instalación en dispositivos móviles y escritorio.

Este proyecto demuestra el uso de tecnologías web modernas, diseño responsivo y capacidades PWA.

---

## 🚀 Características

- ✅ Crear tareas con **título y descripción**
- ⏳ Estados de tareas:
  - Pendiente
  - En proceso
  - Completada
- 🕒 Registro de **fecha y hora** de creación y finalización
- 💾 Persistencia usando **localStorage**
- 📱 **PWA instalable** (Agregar a pantalla de inicio)
- 🔘 Botón manual de **Instalar aplicación**
- 📴 Detección de **estado de conexión** (online / offline)
- 📐 Diseño **responsivo** (móvil, tablet y escritorio)

---

## 🛠️ Tecnologías utilizadas

- ⚛️ React 18
- 🟦 TypeScript
- ⚡ Vite
- 🌐 PWA (Manifest + Service Worker)
- 📦 Netlify (despliegue)
- 🧠 localStorage

---

## 📂 Estructura del proyecto

```
todo-pwa/
├── public/
│   ├── icons/
│   │   ├── icon-48x48.png
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── manifest.webmanifest
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── sw.ts
│
├── netlify.toml
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📦 Instalación y uso local

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/todo-pwa.git
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

4. Abrir en el navegador:
```
http://localhost:5173
```

---

## 🏗️ Build para producción

```bash
npm run build
```

El resultado se genera en la carpeta `dist/`.

---

## 🌍 Despliegue en Netlify

Configuración usada:

```toml
[build]
command = "npm run build"
publish = "dist"
```

---

## 📲 Instalación como PWA

- En navegadores compatibles (Chrome, Edge, Android):
  - Aparece la opción **Instalar**
  - O se puede usar el botón manual incluido en la aplicación

- En móviles:
  - Se puede agregar a la pantalla de inicio
  - Funciona como una app nativa

---

## 🎯 Objetivo del proyecto

Proyecto desarrollado con fines **educativos y prácticos**, enfocado en:
- Desarrollo web moderno
- Aplicaciones Web Progresivas (PWA)
- React + TypeScript
- Despliegue en la nube

---

## 👤 Autor

**Orlando Delgado**  
Estudiante de Desarrollo de Software  
Universidad Tecnológica de Chihuahua (UTCH)

---

## 📄 Licencia

Proyecto de uso educativo y de aprendizaje.
