# CONTEXTO_CLAUDE_CODE.md
# seg-gestion-interna-frontend

Documento de referencia obligatorio para Claude Code. Leer completo antes de escribir cualquier línea de código. Es el equivalente de `contexto-gestion-interna-backend.md` (repo hermano `gestion-interna-backend`, misma carpeta padre `gestion-interna-seg/`) pero para el frontend — mismo criterio: se actualiza al cierre de cada fase verificada.

---

## Visión general del sistema

Panel de gestión interna de SEG Ingeniería. Consume la API REST de `gestion-interna-backend` (NestJS + Prisma, repo separado, sin prefijo `/api`). Reemplaza planillas Excel de procesos administrativos — el primer módulo real es **Órdenes de Compra (OC)**.

No existe todavía ningún módulo terminado más allá de las fundaciones (login + shell). Este documento es la fuente de verdad para retomar el trabajo sin tener que re-explorar el backend ni los repos hermanos de nuevo.

Repos relacionados de la misma empresa (SEG Ingeniería), usados como referencia de patrones ya validados:
- `gestion-interna-backend` — este backend (repo hermano en la misma carpeta padre).
- `mvp-control-de-equipos-seg/frontend-control-de-equipos-seg` — **repo de referencia principal**, Next.js 16 + TypeScript, patrón de auth/cliente HTTP/uploads más maduro. Se copian sus piezas base casi literal (ver sección "Piezas copiadas de repos hermanos").
- `mvp-licencias-seg/licencias-frontend` — Next.js + JavaScript, patrón más simple, **no se usa como base** (menos maduro: fetch manual sin React Query, sin `@theme` de Tailwind, sin uploads).

---

## Decisiones de arquitectura no negociables (ya tomadas, no reabrir sin razón nueva)

### 1. TypeScript sí, a pesar de que la guía de estilos original dice "sin TypeScript"
La guía de estilos que dio el usuario (`GUIA_ESTILOS.md`, ver más abajo) es en realidad la del **sitio público de marketing de SEG**, un proyecto distinto y más simple. Para este panel interno —formularios complejos, roles, máquina de estados de 8 valores en OC, backend 100% tipado— se decidió con el usuario usar TypeScript. Confirmado explícitamente en sesión.

### 2. Sin shadcn/ui — todo a mano
Decisión explícita del usuario: nada de librerías de componentes. Todo se construye siguiendo los patrones JSX de la guía de estilos (colores, tipografía, botones, cards), adaptados donde la guía no cubre necesidades de panel (tablas, formularios, badges de estado, modales).

### 3. 100% client-side — sin Server Actions, sin Route Handlers propios, sin `proxy.ts`/`middleware.ts`
Esta es la desviación más importante respecto a lo que recomienda por defecto la skill de Next.js (que empuja a Server Components + Server Actions + cookies httpOnly). Se decidió **no** seguir esa recomendación genérica y en cambio replicar el patrón **dos veces validado** en esta empresa (los dos repos hermanos resuelven Next.js + backend NestJS separado así):
- JWT guardado en `localStorage` (namespaced: `seg_gi_token`, `seg_gi_usuario`).
- Sesión manejada con Context API (`ProveedorAuth`/`useAuth`), hidratada en un `useEffect` tras el montaje (no se puede leer `localStorage` durante el render en servidor).
- Fetch directo desde Client Components a la API NestJS separada — todas las páginas bajo `(app)/` son Client Components.
- Sin `middleware.ts`/`proxy.ts`: protección de rutas 100% client-side vía componentes wrapper (`RequiereSesion`, `RequiereRol`), no a nivel de red.
- `NEXT_PUBLIC_API_URL` es necesariamente pública (no hay capa de servidor propia que oculte la URL del backend) — no es un descuido, es la consecuencia directa de esta arquitectura.

**Por qué se aceptó el trade-off de seguridad** (XSS podría robar el token de `localStorage`, a diferencia de una cookie httpOnly): es el mismo trade-off ya aceptado dos veces por este equipo en los repos hermanos, y coherente con el criterio que el usuario ya fijó sobre el backend (bug #1 del audit de QA: "empresa chica, todos se conocen, no vale la pena mitigar ese vector" — ver `contexto-gestion-interna-backend.md`).

**No reabrir esta decisión** salvo que el usuario lo pida explícitamente — ya se evaluó la alternativa "a la Next.js" y se descartó a propósito.

### 4. Sin paginación real en las listas
El backend no pagina de verdad — todo `GET` de listado trae todo el dataset y el envoltorio `{datos, total, pagina, porPagina}` siempre trae `pagina: 1, porPagina: datos.length`. El frontend no debe implementar controles de paginación que llamen al backend con `?pagina=`; si en algún momento una lista crece demasiado (ej. `/ordenes-compra` con miles de filas), la paginación tendría que ser client-side sobre el array ya traído, o esperar a que el backend la implemente de verdad primero.

---

## Guía de estilos SEG — qué se reusa literal y qué se adapta

El usuario pegó una guía de estilos completa (`GUIA_ESTILOS.md`, no versionada en este repo, ver el mensaje original en el historial de la sesión donde se creó el proyecto) que describe el sitio público de marketing SEG (Next.js con hero-sliders, anclas de sección, breadcrumbs, footer institucional). Ese sitio **no es este proyecto** — es otro repo que no existe localmente en `SEG/gestion-interna-seg/`. Se adaptó así:

**Se reusa literal:**
- Paleta de colores: `#ca3517` (rojo SEG), `#a82d12` (rojo oscuro/hover), `#8a2410` (rojo profundo), `#000000` (negro), `#1a1a1a` (casi negro/footer). Prohibido cualquier color temático de Tailwind (`sky`, `amber`, `green`, `blue`, `purple`) para diferenciar contenido — solo rojo + grises neutros.
- Tipografía: Red Hat Display vía `next/font/google`, pesos 300-900, variable CSS `--font-red-hat`.
- Escala tipográfica, botones (`rounded-full`, mismas clases de padding/hover), patrón de cards (cabecera roja, borde-top rojo), patrón de encabezado de sección (ícono rojo + `h2` + línea `w-16 h-1 bg-seg-rojo`), alternancia `bg-white`/`bg-gray-50`.

**Se adapta (la guía es de un sitio sin tablas/formularios/estados):**
- Sin hero-slider ni "Hero de página interior" con breadcrumb en cada pantalla — en su lugar `EncabezadoApp` fijo (barra roja + nav negra) + título de página simple.
- Sin navegación interna por anclas sticky — el detalle de una OC (a construir en Fase 3) usa tabs normales entre Datos / Historial / Comentarios, no scroll-anchors.
- Íconos: la guía especifica SVG propios en `viewBox="0 0 64 64"` (arte custom del sitio de marketing, que no tenemos). Se usan en cambio íconos simples `viewBox="0 0 24 24"` estilo stroke (mismo criterio de "SVG inline, sin librerías, `fill`/`stroke="currentColor"`, `aria-hidden="true"`", solo que con un grid de diseño distinto porque no hay acceso al set de arte original). Ver `components/ui/Iconos.tsx`.
- Badges de estado de OC (8 valores de `EstadoOC`): la guía prohíbe colores temáticos — se resuelve con el componente `Insignia` (copiado del repo hermano, ver abajo) que solo usa 5 tonos monocromáticos: `gris | negro | apagado | rojo | rojo-outline`. Mapeo propuesto (a aplicar en Fase 3, todavía no implementado):
  - `BORRADOR` → gris · `PENDIENTE` → rojo-outline · `EN_CONSULTA` → apagado · `APROBADO` → negro · `RECHAZADO` → rojo sólido (terminal negativo) · `PAGO_OBSERVADO` → rojo-outline · `PAGADO` → negro (terminal positivo) · `ANULADO` → apagado (terminal, muted). Diferenciar además por ícono, nunca solo por color.
- Tablas: sin patrón en la guía (el sitio de marketing no tiene tablas) — se construyó `Tabla`/`TablaEncabezadoCelda`/`TablaCelda`/`TablaFila` genéricos con el mismo lenguaje visual.
- Sin dark mode: la guía no define uno, y se removió el bloque `@media (prefers-color-scheme: dark)` que traía el scaffolding de `create-next-app` por defecto — la app es de tema fijo claro.

---

## Mapa completo de la API del backend (fuente de verdad — no hace falta re-explorar el backend)

Relevado exhaustivamente en sesión (ver también `contexto-gestion-interna-backend.md` del repo hermano para el detalle de reglas de negocio). Resumen operativo para el frontend:

### Generalidades
- **Sin prefijo global** (`main.ts` no llama `setGlobalPrefix`) → rutas tal cual, sin `/api`.
- **CORS**: abierto en dev (`NODE_ENV !== 'production'`); en producción solo permite `FRONTEND_URL`.
- **Envoltorio de respuesta única**: `{ datos: T, mensaje: string }` — ver `lib/tipos/respuesta-api.ts` (`RespuestaExitosa<T>`).
- **Envoltorio de lista**: `{ datos: T[], total, pagina, porPagina }` — **sin paginación real** (ver arriba). Ver `RespuestaLista<T>`.
- **Errores**: shape propio del filtro global, siempre `{ error: string, mensaje: string }` (código + mensaje en español ya armado, mensajes de validación ya joineados con `"; "` server-side). **Excepción**: errores de `ParseFilePipe` (validación de PDF en uploads) pueden no pasar por el filtro custom y traer el shape default de Nest (`{ message: string | string[] }`). El cliente HTTP (`lib/http/cliente.ts`) ya maneja ambos casos.
- **Roles**: `SOLICITANTE | ENCARGADO | PAGOS | ADMIN`.
- **JWT**: payload `{ sub, email, rol, sectorId, iat, exp }`. La respuesta de `POST /auth/login` **no** incluye `sectorId` en `usuario` — el frontend lo extrae decodificando el JWT (`jwt-decode`, ver `lib/auth/api.ts`).
- **Pipe de validación global**: `whitelist + forbidNonWhitelisted + transform` — cualquier campo no declarado en el DTO del backend hace fallar la request con 400. Ojo con esto al construir formularios: nunca mandar campos "de más" (ej. nunca mandar `clienteId`/`proyectoId`/`tareaId`/`solicitanteId` en el form de crear OC, se derivan server-side).

### Auth
| Método | Ruta | Auth | Body | Respuesta |
|---|---|---|---|---|
| POST | `/auth/login` | pública | `{email, contrasena}` | `{token, usuario:{id,nombre,email,rol}}` |
| GET | `/auth/perfil` | JWT (cualquier rol) | — | `{id,nombre,email,rol}` |

Error login: 401 `CREDENCIALES_INVALIDAS`. Ya implementado en `lib/auth/api.ts` + `lib/auth/contexto.tsx`.

### Usuarios (`/usuarios`) — ADMIN salvo `mi-contrasena`
CRUD estándar. `PATCH /usuarios/mi-contrasena` (cualquier rol autenticado): `{contrasenaActual, contrasenaNueva}`. Campos: `nombre, email, contrasena(solo crear), rol, sectorId?, activo?(solo actualizar)`. Baja es **lógica** (`activo=false`), nunca DELETE físico real en negocio aunque el endpoint HTTP es `DELETE`. Errores: 409 `EMAIL_YA_REGISTRADO`, 404 `USUARIO_NO_ENCONTRADO`, 401 `CONTRASENA_ACTUAL_INCORRECTA`.

### Sectores (`/sectores`) — ADMIN todo
`{nombre}` (único). Errores: 409 `SECTOR_YA_EXISTE`, 422 `SECTOR_CON_USUARIOS_ASIGNADOS` / `SECTOR_CON_ORDENES_COMPRA_ASOCIADAS` al eliminar.

### Clientes (`/clientes`) — cualquier rol autenticado
`{nombre, rut, email?, telefono?}`. Errores: 409 `CLIENTE_YA_EXISTE`, 422 `CLIENTE_CON_PROYECTOS_ASOCIADOS`/`CLIENTE_CON_ORDENES_COMPRA_ASOCIADAS`.

### Proveedores (`/proveedores`) — mixto
`GET`/`POST`: cualquier rol. `PATCH`/`DELETE`: `ADMIN, PAGOS, ENCARGADO`. Campos: `{nombre, rut, email?, telefono?, banco, tipoCuenta: TipoCuentaBancaria, numeroCuenta}` — banco/tipoCuenta/numeroCuenta **siempre obligatorios**. Errores: 409 `PROVEEDOR_YA_EXISTE`, 422 `PROVEEDOR_CON_COTIZACIONES_ASOCIADAS`/`PROVEEDOR_CON_ORDENES_COMPRA_ASOCIADAS`.

### Proyectos (`/proyectos`) — cualquier rol autenticado
`{nombre, clienteId}`. Errores: 404 `CLIENTE_NO_ENCONTRADO` (FK inválida), 422 al eliminar (`PROYECTO_CON_COTIZACIONES_ASOCIADAS`/`_CON_TAREAS_ASOCIADAS`/`_CON_ORDENES_COMPRA_ASOCIADAS`).

### Tareas — rutas repartidas entre `/tareas` y `/proyectos/:proyectoId/tareas`
`{nombre, proyectoId}` al crear. **`ActualizarTareaDto` exige `nombre` obligatorio** (no opcional, a diferencia del resto de los módulos). Errores: 404 `TAREA_NO_ENCONTRADA`/`PROYECTO_NO_ENCONTRADO`, 422 `TAREA_CON_REGISTROS_ASOCIADOS`.

### Cotizaciones — versionado inmutable, sin PATCH/DELETE
Rutas: `/cotizaciones/:id`, `/cotizaciones/:id/archivo` (PDF, `StreamableFile`), `/proyectos/:proyectoId/cotizaciones[/activa]`, `/tareas/:tareaId/cotizaciones[/activa]`, `POST /cotizaciones` (**multipart**, campo `archivo` opcional, PDF máx 10MB). Body: `{proyectoId, tareaId?, proveedorId, montoTotal: number, moneda: Moneda}`. Cada `POST` marca la versión anterior como `REEMPLAZADA` automáticamente (lógica server-side). Respuesta: `{id, proyectoId, tareaId, proveedorId, montoTotal: string /* Decimal */, moneda, estado, archivoPdfRuta}`. Errores: 404 `COTIZACION_NO_ENCONTRADA`/`COTIZACION_ACTIVA_NO_ENCONTRADA`/`PROYECTO_O_PROVEEDOR_NO_ENCONTRADO`.

### Órdenes de Compra (`/ordenes-compra`) — el núcleo, todavía no construido en el frontend
CRUD + 7 endpoints de transición + comentarios + historial. **Sin `@Roles` en el CRUD** — el control fino está en el service: `actualizar`/`eliminar` solo si `estado === BORRADOR` **y** (solicitante dueño, o mismo sector, o ADMIN); si no, 403 `SIN_PERMISO_SOBRE_ORDEN_COMPRA` / 409 `ORDEN_COMPRA_NO_ES_BORRADOR`.

- `POST /ordenes-compra` — **multipart**, campo `factura` opcional (PDF ≤10MB). Body: `{tipo: TipoOC, fecha: ISO string, sectorId, proveedorId, cotizacionId?, moneda, monto: number, concepto, formaPago, pagaIva: boolean, ivaIncluido: boolean, observaciones?}`. **Nunca mandar** `clienteId`/`proyectoId`/`tareaId`/`solicitanteId` — se derivan.
- `PATCH /ordenes-compra/:id` — JSON normal (no toca factura), mismos campos opcionales.
- `PATCH /ordenes-compra/:id/factura` — multipart, `factura` **obligatoria**.
- `GET /ordenes-compra/:id/factura` — `StreamableFile` PDF.
- `DELETE /ordenes-compra/:id` — 422 `ORDEN_COMPRA_CON_COMENTARIOS_ASOCIADOS` si ya tiene comentarios.
- Validaciones de negocio (solo si hay `cotizacionId`): proveedor debe coincidir con el de la cotización (422 `PROVEEDOR_NO_COINCIDE_CON_COTIZACION`), suma de montos de OCs vinculadas no debe superar `cotizacion.montoTotal` (422 `MONTO_EXCEDE_COTIZACION`).
- Respuesta (`RespuestaOrdenCompraDto`): `{id, numero, tipo, fecha, solicitanteId, sectorId, proveedorId, clienteId, proyectoId, tareaId, cotizacionId, moneda, monto: string, concepto, formaPago, pagaIva, ivaIncluido, observaciones, facturaPdfRuta, estado}`.

**Transiciones de estado** (`/ordenes-compra/:id/{enviar|aprobar|rechazar|observar-pago|resolver-observacion|confirmar-pago|anular}`, todas `POST`, `HttpCode 200`, más `GET /ordenes-compra/:id/historial`):

| Endpoint | Roles | Body | Chequeo extra |
|---|---|---|---|
| `enviar` | cualquiera | — | BORRADOR→PENDIENTE |
| `aprobar` | ENCARGADO | — | mismo sector (403 `SIN_PERMISO_SOBRE_SECTOR`) |
| `rechazar` | ENCARGADO | `{motivo}` obligatorio | mismo sector |
| `observar-pago` | PAGOS | `{motivo}` obligatorio | — |
| `resolver-observacion` | PAGOS | `{motivo?}` opcional | — |
| `confirmar-pago` | PAGOS | — | — |
| `anular` | ADMIN, ENCARGADO | `{motivo}` obligatorio | si ENCARGADO, mismo sector; ADMIN sin restricción |
| `historial` (GET) | cualquiera | — | lista `{id, estadoAnterior, estadoNuevo, usuarioId, motivo, creadoEn}` |

Tabla completa de transiciones válidas (para decidir qué botones mostrar según `orden.estado`):
```
BORRADOR        → [PENDIENTE, ANULADO]
PENDIENTE       → [EN_CONSULTA, APROBADO, RECHAZADO, ANULADO]
EN_CONSULTA     → [PENDIENTE, ANULADO]
APROBADO        → [PAGO_OBSERVADO, PAGADO, ANULADO]
RECHAZADO       → []  (terminal)
PAGO_OBSERVADO  → [APROBADO, ANULADO]
PAGADO          → []  (terminal)
ANULADO         → []  (terminal)
```
Error genérico de transición inválida: 409 `TRANSICION_INVALIDA`.

**Importante**: `EN_CONSULTA`↔`PENDIENTE` **no tienen endpoint HTTP propio** — se disparan automáticamente al comentar (`POST /ordenes-compra/:id/comentarios`, `{texto}`): si un ENCARGADO del sector comenta una OC en PENDIENTE → pasa a EN_CONSULTA; si el solicitante comenta una OC en EN_CONSULTA → vuelve a PENDIENTE. **El frontend debe refrescar la OC después de postear un comentario**, el estado puede haber cambiado como efecto lateral.

### Auditoría (`/auditoria`) — solo ADMIN
`GET /auditoria?accion=&entidad=&usuarioEmail=` (filtros opcionales). Respuesta: `{id, usuarioId, usuarioEmail, accion, descripcion, entidad, entidadId, creadoEn}`. Catálogo completo de `accion` disponible en `ACCIONES_AUDITORIA` del backend (`src/auditoria/acciones-auditoria.constantes.ts`) — útil para un `<select>` de filtro, no se copió acá porque es largo, revisar ese archivo si se construye la pantalla de Auditoría (Fase 4).

### Notificaciones
Sin endpoints REST — el frontend no consume nada de este módulo directamente (mails automáticos por evento, transparente).

---

## Enums completos (usar estos valores literales exactos)

```ts
RolUsuario:          "SOLICITANTE" | "ENCARGADO" | "PAGOS" | "ADMIN"
TipoCuentaBancaria:  "CAJA_AHORRO" | "CUENTA_CORRIENTE" | "EXTERIOR"
Moneda:              "UYU" | "USD" | "EUR"
EstadoCotizacion:    "ACTIVA" | "REEMPLAZADA"
TipoOC:               "ARTICULO" | "SERVICIO"                                                        ← pendiente, Fase 3
FormaPago:            "CONTADO_CONTRA_ENTREGA" | "TARJETA_CREDITO" | "DIFERIDO" | "GIRO_RED_COBRANZA" | "TRANSFERENCIA_BANCARIA"  ← pendiente, Fase 3
EstadoOC:             "BORRADOR" | "PENDIENTE" | "EN_CONSULTA" | "APROBADO" | "RECHAZADO" | "PAGO_OBSERVADO" | "PAGADO" | "ANULADO"  ← pendiente, Fase 3
```
`RolUsuario` → `lib/auth/tipos.ts` (Fase 0). `TipoCuentaBancaria` → `lib/proveedores/tipos.ts` (Fase 1). `Moneda` y `EstadoCotizacion` → `lib/cotizaciones/tipos.ts` (Fase 2). Faltan `TipoOC`, `FormaPago`, `EstadoOC`, se agregan en Fase 3 cuando se construya OC.

---

## Piezas copiadas/adaptadas de `frontend-control-de-equipos-seg` (repo hermano)

Ya implementadas en este repo, con estos ajustes respecto al original (el backend de ese repo hermano es distinto al nuestro):

1. **`lib/http/cliente.ts`**: función `peticion<T>()`/`peticionBinaria()` copiada casi literal, con dos ajustes obligatorios:
   - `URL_BASE` default `http://localhost:3000` **sin** `/api` (nuestro backend no tiene prefijo global; el hermano sí).
   - `normalizarMensaje` lee `datos?.mensaje` (shape de nuestro `ExcepcionGlobalFiltro`) con fallback a `datos?.message` (por si un error de `ParseFilePipe` no pasa por el filtro custom) — el hermano solo lee `.message` porque su backend no tiene filtro propio.
   - Se agregó también `codigo: string | null` a `ErrorApi` (el código `error` del backend, ej. `"TRANSICION_INVALIDA"`) para poder discriminar casos específicos en la UI más adelante (útil en Fase 3 para mensajes de error a medida en vez de solo mostrar el mensaje genérico).
2. **`lib/auth/contexto.tsx`**: patrón `ProveedorAuth`/`useAuth` copiado tal cual (hidratación en `useEffect`, `jwt-decode` para validar `exp`, `registrarManejadorExpiracion` para logout automático en 401). Diferencias: nuestro login devuelve `{token, usuario}` (no `{access_token, usuario}`), y se suma la extracción de `sectorId` desde el JWT decodificado en `lib/auth/api.ts` (no viene en el `usuario` de la respuesta de login). El contexto expone `{usuario, cargando, iniciarSesion, cerrarSesion}` — **no expone `token`** (a diferencia del hermano) porque nada lo necesita fuera de `lib/http/cliente.ts`, que lee `localStorage` directo vía `obtenerToken()`.
3. **`components/layout/RequiereSesion.tsx` / `RequiereRol.tsx`**: mismo patrón (`RequiereSesion` redirige a `/login` si no hay sesión tras cargar; `RequiereRol` bloquea con mensaje si el rol no alcanza, no oculta la ruta).
4. **`components/ui/Insignia.tsx`**: copiado literal, 5 tonos (`gris|negro|apagado|rojo|rojo-outline`) — ya alineados con los nombres de color de nuestro `@theme` (`--color-seg-rojo`).
5. **Lint gotcha heredado**: el hook `useEffect` que hidrata la sesión desde `localStorage` dispara `react-hooks/set-state-in-effect` en el linter de Next 16 — se resuelve con `// eslint-disable-next-line react-hooks/set-state-in-effect` (mismo comentario que ya usaba el repo hermano), **solo en la rama `if` que setea sesión válida** — la rama `else` no lo necesitó (el linter no lo marcó ahí, no agregar el disable de más o queda un "unused eslint-disable directive").
6. **Patrón de upload multipart** (`lib/documentos/{tipos,api,hooks}.ts` del hermano) — adaptado en Fase 2 a `lib/cotizaciones/{tipos,api,hooks}.ts` para subir el PDF de cotización. Mismo criterio: `FormData` directo vía `.set()` (nunca `JSON.stringify`), constantes `TIPO_ARCHIVO_COTIZACION_ACEPTADO = "application/pdf"` y `TAMANO_MAXIMO_ARCHIVO_COTIZACION_BYTES = 10 * 1024 * 1024` (coincide con el límite real del backend), validación de tipo/tamaño client-side en el `register(..., {validate})` de React Hook Form antes de subir, descarga vía `peticionBinaria` + blob + `<a download>` (mismo motivo: un `<a>` normal no manda `Authorization`). **Pendiente para Fase 3**: mismo patrón para `lib/ordenes-compra/` (factura).
   - Gotcha de sesión (no del código): al probar el upload con `curl` desde Git Bash en Windows, `-F archivo=@/tmp/...` falla con `curl: (26) Failed to read local file` — el `curl.exe` nativo de este entorno no traduce paths POSIX. Hay que pasar la ruta estilo `C:\Users\...` al `-F`.

---

## Estado actual (actualizado 2026-08-18, cierre de Fase 2)

Repo: `gestion-interna-frontend` dentro de `SEG/gestion-interna-seg/` (misma carpeta padre que el backend). **Corrección sobre lo que decía este documento antes**: sí hay un `git init` con un commit (`9cf5de1 Initial commit from Create Next App`) — lo que sigue sin haber es cualquier commit del trabajo real (Fase 0, 1 y 2 siguen sin commitear, todo vive como working tree sucio). No commitear nada salvo que el usuario lo pida explícitamente (regla general del asistente, no específica de este repo).

### ✅ Fase 0 — Fundaciones: completa
Scaffolding con `create-next-app` (Next.js 16.3.1, React 19.2.8, TypeScript, Tailwind v4, App Router, ESLint flat config, Turbopack, **sin `src/`** — `app/`/`components/`/`lib/` en la raíz, igual que el repo hermano). Dependencias extra instaladas: `@tanstack/react-query`, `react-hook-form`, `clsx`, `jwt-decode`.

Archivos creados (lista completa, no hace falta re-listar el árbol en la próxima sesión):
```
app/globals.css                       → @theme con paleta SEG + font-family Red Hat Display, sin dark mode
app/layout.tsx                        → next/font/google Red Hat Display + ProveedorQuery + ProveedorAuth
app/page.tsx                          → redirect("/dashboard")
app/login/page.tsx                    → formulario de login (react-hook-form) contra useAuth().iniciarSesion
app/(app)/layout.tsx                  → RequiereSesion + EncabezadoApp + <main>
app/(app)/dashboard/page.tsx          → placeholder, saluda al usuario logueado

components/layout/RequiereSesion.tsx  → redirige a /login si no hay sesión tras cargar
components/layout/RequiereRol.tsx     → bloquea con EstadoVacio si el rol no alcanza
components/layout/EncabezadoApp.tsx   → header fijo (barra roja + nav negra), nav filtrada por rol, logout

components/ui/Boton.tsx               → <Boton> (button nativo) y <BotonLink> (next/link), variantes rojo/outline/outline-blanco, tamaños sm/normal/lg
components/ui/Insignia.tsx            → badge, 5 tonos monocromáticos (copiado del hermano)
components/ui/Campo.tsx               → input con label + error, forwardRef (compatible con react-hook-form register)
components/ui/Select.tsx              → select con label + error, forwardRef
components/ui/TextArea.tsx            → textarea con label + error, forwardRef
components/ui/Modal.tsx               → overlay + panel centrado, "use client"
components/ui/Tarjeta.tsx             → TarjetaBordeSuperior, TarjetaCabeceraRoja
components/ui/Tabla.tsx               → Tabla, TablaEncabezadoCelda, TablaCelda, TablaFila
components/ui/EstadoVacio.tsx         → mensaje centrado con ícono opcional
components/ui/EstadoError.tsx         → banner rojo, lee ErrorApi.message
components/ui/Cargando.tsx            → spinner + etiqueta
components/ui/Iconos.tsx              → IconoCerrar, IconoUsuario, IconoSalir, IconoMenu, IconoChevronAbajo (viewBox 24x24, stroke)

lib/tipos/respuesta-api.ts            → RespuestaExitosa<T>, RespuestaLista<T>
lib/http/cliente.ts                   → peticion<T>(), peticionBinaria(), ErrorApi, registrarManejadorExpiracion()
lib/auth/tipos.ts                     → RolUsuario, Usuario, CredencialesLogin, SesionIniciada, PayloadJwt
lib/auth/almacen-token.ts             → guardarSesion/obtenerToken/obtenerUsuarioGuardado/borrarSesion (localStorage)
lib/auth/api.ts                       → iniciarSesion() — llama POST /auth/login y decodifica sectorId del JWT
lib/auth/contexto.tsx                 → ProveedorAuth/useAuth
lib/query-cliente.tsx                 → ProveedorQuery (React Query, staleTime 30s, sin retry, sin refetchOnWindowFocus)
```

**Decisiones tomadas durante la Fase 0:**
- El menú de navegación de `EncabezadoApp` está **hardcodeado** con los items previstos para todas las fases (`/ordenes-compra`, `/proyectos`, `/clientes`, `/proveedores`, `/usuarios`, `/sectores`, `/auditoria`) aunque esas rutas **todavía no existen** — van a dar 404 hasta que se construyan en las fases siguientes. Es intencional (define el mapa de navegación desde ahora), no un bug.
- No se construyó `components/layout/MenuUsuario.tsx` por separado (estaba en el plan original) — se simplificó: el nombre del usuario + botón de logout están inline en `EncabezadoApp`. Extraer a un componente aparte solo si se necesita agregar un dropdown con más opciones.
- No se construyó menú mobile (hamburguesa) — el nav de `EncabezadoApp` es `hidden md:flex`, en mobile hoy no hay forma de navegar salvo por URL directa. Explícitamente diferido a la Fase 5 ("pulido, responsive").
- No se creó `app/(app)/mi-cuenta/page.tsx` todavía (cambiar contraseña propia, `PATCH /usuarios/mi-contrasena`) — el link a `/mi-cuenta` en `EncabezadoApp` ya existe pero hoy da 404. Se construye junto con Fase 1 (catálogo de usuarios) o antes si se prioriza.
- Type helpers de Next 16 (`LayoutProps<'/'>`, generados por `next typegen`): se usó `LayoutProps<"/">` en el layout raíz (`app/layout.tsx`, típed automáticamente por el scaffolding) pero **no** en `app/(app)/layout.tsx` — ahí se tipeó `children: ReactNode` a mano porque un route group cubre múltiples rutas hijas y no hay un único path canónico para pasarle al helper. Es válido, no es un error, `LayoutProps` es azúcar opcional.

### ✅ Fase 1 — Catálogos simples: completa (2026-08-18)
CRUD completo para los 4 catálogos, patrón `lib/<dominio>/{tipos,api,hooks}.ts` con React Query validado y replicado 4 veces sin sorpresas:
```
lib/clientes/{tipos,api,hooks}.ts        → CRUD completo, cualquier rol autenticado
lib/proveedores/{tipos,api,hooks,presentacion}.ts → CRUD, alta abierta a todos, editar/eliminar solo ADMIN/PAGOS/ENCARGADO (regla del backend)
lib/sectores/{tipos,api,hooks}.ts        → CRUD, todo ADMIN
lib/usuarios/{tipos,api,hooks,presentacion}.ts → alta/edición ADMIN; "eliminar" es baja lógica (DELETE → activo=false), botón "Reactivar" hace PATCH {activo:true}; incluye cambiarContrasenaPropia (mi-contrasena)

components/{clientes,proveedores,sectores,usuarios}/{Tabla*.tsx,Modal*.tsx} → un solo Modal por dominio sirve para crear y editar (prop `entidad: T | null`, null = crear)
components/ui/BotonAccionFila.tsx, IconoMas/Editar/Eliminar en Iconos.tsx    → nuevos, para acciones de fila en tablas (se van a reusar en Fase 3)

app/(app)/{clientes,proveedores,sectores,usuarios,mi-cuenta}/page.tsx
```
**Decisión de patrón para todas las fases siguientes**: el modal de create/edit se monta condicionalmente (`{modalAbierto && <ModalX .../>}`), no con un prop `abierto` en un componente siempre montado — así el `useForm` arranca limpio cada vez que se abre, sin necesitar `useEffect`+`reset` para sincronizar `defaultValues` con la entidad que se está editando.

### ✅ Fase 2 — Proyectos / Tareas / Cotizaciones: completa (2026-08-18)
```
lib/proyectos/{tipos,api,hooks}.ts
lib/tareas/{tipos,api,hooks}.ts          → ActualizarTareaDto.nombre es obligatorio (no opcional), a diferencia del resto
lib/cotizaciones/{tipos,api,hooks,presentacion}.ts → Moneda/EstadoCotizacion declarados acá; patrón de upload multipart (ver sección "Piezas copiadas" más arriba)

lib/clientes/hooks.ts, lib/proveedores/hooks.ts → se agregó useMapaClientes()/useMapaProveedores() (Map<id,entidad> vía useMemo), porque ningún DTO del backend devuelve nombres anidados, solo IDs — hay que resolverlos del lado del cliente contra los catálogos de Fase 1

components/proyectos/{TablaProyectos,ModalProyecto,FichaCliente,ProveedoresInvolucrados}.tsx
components/tareas/{TablaTareas,ModalTarea}.tsx
components/cotizaciones/{TablaCotizaciones,ModalCotizacion}.tsx

app/(app)/proyectos/page.tsx             → lista, Cliente resuelto vía mapa
app/(app)/proyectos/[id]/page.tsx        → el expediente: ficha de Cliente + "Proveedores involucrados" (derivado en el front, filtrando cotizaciones estado=ACTIVA, no es un endpoint nuevo) + Tareas + Cotizaciones (agrupadas por tarea o "General del proyecto", con Insignia Activa/Reemplazada y descarga de PDF)
```
Hallazgo clave de la API que ahorra llamadas: `GET /proyectos/:id/cotizaciones` devuelve **todas** las cotizaciones del proyecto (las generales y las de cada tarea) en una sola llamada — no hace falta pedir tarea por tarea. El agrupado por alcance se hace 100% client-side con `.filter()`.

**Petición del usuario, todavía no resuelta del todo** (ver sección "Pendientes" más abajo): el nombre "Tarea" no es descriptivo para lo que representa acá (no es una tarea de gestión de proyecto, es una subdivisión de compras/presupuesto dentro de un proyecto). Se decidió cambiar la etiqueta visible a "Rubro" — pendiente de implementar.

### Mejoras post-Fase 2 aplicadas sobre Proyectos (2026-08-18)

Antes de codear, se armó un **canvas de diseño** (skill `design`, Claude Design preview) con mockups de Dashboard mejorado, listado de Proyectos, detalle con tabs, y comparación de estados de carga — publicado como Artifact: `https://claude.ai/code/artifact/35731477-4ffd-4654-b3a0-d1a240750d3f`. De ese mockup se aplicó una parte y se descartó/difirió otra explícitamente con el usuario:
- **Dashboard**: NO se tocó — el mockup mostraba KPIs de Órdenes de Compra que todavía no existen (Fase 3) ni Auditoría (Fase 4); el usuario eligió esperar a esas fases en vez de hardcodear números falsos. `app/(app)/dashboard/page.tsx` sigue siendo el placeholder de Fase 0.
- **Etiqueta "Rubro"**: el mockup la mostraba, pero el usuario pidió mantener "Tarea" por ahora (ver "Pendientes").
- **Lo que sí se aplicó** (todo con datos reales, sin números inventados):
  - `app/(app)/proyectos/page.tsx`: buscador por nombre + filtro por cliente (client-side, sobre `proyectos.data` ya cacheado). `TablaProyectos` ahora recibe `hayFiltrosActivos` para diferenciar el mensaje de "no hay proyectos" vacío real vs. "no hay proyectos que coincidan con el filtro".
  - `components/proyectos/ResumenFilaProyecto.tsx` (nuevo): agrega 2 columnas a la tabla de proyectos — cantidad de Tareas y "Cotizaciones activas" (cantidad + monto si todas comparten moneda). Usa `useTareasDeProyecto`/`useCotizacionesDeProyecto` **por fila** — es un patrón N+1 (2 requests extra por proyecto listado), igual que los `mapa` de clientes/proveedores; aceptable a esta escala, pero si la lista de proyectos crece mucho el backend necesitaría un endpoint de resumen agregado.
  - `app/(app)/proyectos/[id]/page.tsx`: reorganizado en **tabs** (Resumen / Tareas / Cotizaciones) en vez de las secciones apiladas de Fase 2 — reduce el scroll. Arriba de las tabs, 3 tarjetas fijas: Cliente, **Comprometido** (suma de cotizaciones activas por moneda, ver abajo) y **Proveedores activos** (cantidad de proveedores distintos con cotización activa).
  - **`BarraComprometido`** (`components/proyectos/BarraComprometido.tsx`, nuevo): dentro de la tarjeta "Comprometido", una barra apilada horizontal con el desglose por proveedor. Se descartó la torta que pidió el usuario originalmente a favor de esto siguiendo la skill `dataviz` (para "parte de un total" recomienda barra apilada, más fácil de comparar que ángulos). Color: **secuencial de un solo tono** (rojo más oscuro = mayor monto, usando los 3 tonos ya en `@theme`: `seg-rojo-profundo`→`seg-rojo-oscuro`→`seg-rojo`), nunca colores por categoría — respeta la regla de "solo rojo + grises" y evita el problema de que un monocromático no puede pasar el validador de paleta categórica (no aplica: la guía dice explícitamente que el validador categórico no se corre sobre una rampa secuencial). A partir del 4to proveedor se agrupan en "Otros proveedores" (gris) en vez de generar más tonos. Solo se muestra si hay **2+ proveedores distintos** activos en esa moneda — con uno solo, el número ya cuenta toda la historia y no amerita gráfico (regla "¿es esto un gráfico?" de la skill `dataviz`).
    - `lib/cotizaciones/presentacion.ts`: `calcularComprometido()` ahora devuelve `{moneda, total, porProveedor: [{proveedorId, total}]}[]` (antes solo `{moneda, total}`) — cambio no rompe a los consumidores existentes porque solo agrega un campo.
    - **Gotcha de negocio importante para cuando se retome esto**: las cotizaciones se reemplazan por **alcance** (proyecto general, o una tarea puntual), **no por proveedor** — un segundo `POST /cotizaciones` con `tareaId` igual (o ambos generales) reemplaza la anterior sin importar si es otro proveedor. Para tener 2 proveedores simultáneamente activos en la misma moneda hacen falta 2 alcances distintos (ej. uno general + uno en una tarea).
  - **Estados de carga y transición** (toda la app, cero dependencias nuevas): `components/ui/EsqueletoTabla.tsx` (nuevo, skeleton genérico con `animate-pulse` de Tailwind) usado en `loading.tsx` de `/proyectos`, `/clientes`, `/proveedores`, `/sectores`, `/usuarios` (convención nativa de Next App Router — se muestra mientras carga el chunk JS de la ruta, no reemplaza el `<Cargando/>` que ya cubre la espera de datos de React Query). `/proyectos/[id]/loading.tsx` tiene su propio skeleton a medida (cabecera + 3 tarjetas + bloque). Además, `@keyframes fade-in` en `app/globals.css` + clase `animate-[fade-in_200ms_ease-out]` agregada al `<div>` raíz de las 8 páginas de `(app)/` — como cada `page.tsx` monta un nodo DOM nuevo en cada navegación (aunque el `<main>` del layout no se desmonta), la animación se re-dispara sola en cada cambio de ruta sin necesitar `key` ni hacer cliente el layout.

### Verificación hecha en Fase 1 y Fase 2
- `npx tsc --noEmit` y `npx eslint .` sin errores en ningún punto de las dos fases (incluidas las mejoras post-Fase 2 de más arriba).
- Todo el CRUD de los 4 catálogos de Fase 1 probado con `curl` contra el backend real (crear/listar/actualizar/dar de baja/reactivar/eliminar), confirmando que los shapes de request/response coinciden exactamente con los tipos declarados. Registros de prueba limpiados después (`DELETE`) salvo donde no aplica (ver Fase 2).
- Fase 2: creé cliente/proveedor/proyecto/tarea de prueba y subí una cotización real con PDF adjunto por multipart contra el backend; confirmé que el reemplazo automático de versión funciona (`estado` pasa a `REEMPLAZADA` en la versión vieja) y que la descarga (`GET /cotizaciones/:id/archivo`) devuelve `200 application/pdf`.
- **No hay `DELETE` para Cotizaciones en el backend** (son inmutables a propósito, son el historial de versiones) → los registros de prueba de Fase 2 (`Proyecto QA Fase2`, `Cliente QA Fase2`, `Proveedor QA Fase2`, `Tarea QA`) **quedaron sin poder limpiar** porque el proyecto/tarea no se pueden eliminar teniendo cotizaciones asociadas (422). Van a aparecer en las listas hasta que se borren a mano en la base o se decida qué hacer con ellos.
- **Datos de prueba adicionales (2026-08-18, para demostrar `BarraComprometido`)**: sobre `Proyecto QA` (**un proyecto de prueba creado por el usuario, distinto de mi `Proyecto QA Fase2`**), agregué el proveedor `Proveedor QA 2` y la tarea `Tarea QA demo barra` con una cotización activa en UYU, para que hubiera 2 proveedores activos en la misma moneda y la barra mostrara 2 segmentos. No se limpió (mismo motivo: no hay `DELETE` de cotizaciones).
- Confirmado con `curl` que Tailwind compiló realmente la animación `fade-in` (keyframes + clase `animate-[fade-in_200ms_ease-out]`) en el CSS servido — no se pudo ver el efecto visual en sí sin navegador.
- **La extensión Claude in Chrome sigue sin conectar** en esta sesión — toda la verificación de este bloque fue por `tsc`/`eslint`/`curl` directo a la API. **Pero el usuario sí probó Fase 2 en un navegador real por su cuenta** (mandó una captura de `/proyectos/[id]`) y confirmó que la UI funciona — primera confirmación visual real del proyecto, aunque no la hice yo.

### Header (cambios post-Fase 0, 2026-08-18)
- Logo real (`public/seg ingenieria logo.png`) reemplaza el texto "SEG" en `EncabezadoApp` y aparece también arriba del form de `/login`.
- Favicon: el logo se copió a `app/icon.png` (convención de Next App Router, mismo patrón que el repo hermano) y se borró el `app/favicon.ico` default de `create-next-app` para que no compita.
- Nav centrado (`justify-center` en el `<nav>`) y orden final: Inicio, Órdenes de Compra, Proyectos, Clientes, Proveedores, **Sectores, Usuarios**, Auditoría (Sectores antes de Usuarios — orden pedido explícitamente por el usuario, no es el orden original de Fase 0).

### Gotcha de entorno — histórico, no repetir sin chequear primero
En la sesión de Fase 0 el puerto 3000 estaba ocupado por otro proyecto (`dashboard segEmove`) y se corrió el backend en 3001. **En la sesión de Fase 1/2 el 3000 estaba libre** — backend corrió en el 3000 default, frontend en 3100 (`npm run dev -- --port 3100`), `.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3000`. No asumir cuál de los dos casos aplica: correr `Get-NetTCPConnection -LocalPort 3000` (o `docker ps`/`curl` directo) antes de decidir el puerto en la próxima sesión.

### Cómo levantar el entorno local (para la próxima sesión)
1. Postgres: `docker ps` para ver si el contenedor `seg-gestion-interna-postgres` (imagen `postgres:16`, puerto `5432`) ya está corriendo. Si no, el usuario tiene que levantarlo.
2. Backend: `cd gestion-interna-backend && npm run start:dev` (puerto 3000 por defecto, usar `PORT=xxxx` si está ocupado — chequear primero, ver gotcha arriba).
3. Frontend: `cd gestion-interna-frontend && npm run dev` (puerto 3000 por defecto también — **conflicto entre sí**, correr en otro puerto con `npm run dev -- --port 3100` si el backend ya toma el 3000). Revisar que `.env.local` apunte al puerto real del backend.
4. Usuarios de prueba (seed del backend, contraseña `Cambiar123!` para los 4, confirmado funcionando con login real vía API en esta sesión):
   | Rol | Email |
   |---|---|
   | ADMIN | `admin@segingenieria.com` |
   | ENCARGADO | `encargado@segingenieria.com` |
   | PAGOS | `pagos@segingenieria.com` |
   | SOLICITANTE | `solicitante@segingenieria.com` |

### Producción (Railway)

Desplegado: frontend `https://frontend-production-cbe52.up.railway.app`, backend `https://backend-production-dc81.up.railway.app`, mismos 4 usuarios de prueba de la tabla de arriba ya seedeados ahí (misma contraseña). Detalle completo del deploy (servicios, builder, gotchas, variables, estado de notificaciones por mail) en `contexto-gestion-interna-backend.md` → sección "Comandos de Railway" / "Despliegue actual en producción".

## Pendientes / decisiones abiertas

- **Renombrar "Tarea" → "Rubro" (solo la etiqueta visible)** — decidido con el usuario el 2026-08-18, **todavía no implementado**.
  - **Por qué**: "Tarea" sugiere gestión de proyecto (fechas, responsable, estado, checklist), pero la entidad no tiene nada de eso — solo sirve para agrupar cotizaciones/compras dentro de un proyecto. Es una subdivisión presupuestaria, y "Rubro" es el término estándar de esa jerga en ingeniería/construcción (se prefirió sobre "Partida"/"Ítem").
  - **Alcance acordado — solo texto visible, nada de código**: el backend sigue siendo `Tarea`/`/tareas` (modelo Prisma, rutas, DTOs) tal cual, no se toca. Tampoco se renombran identificadores del frontend (`lib/tareas/*`, `components/tareas/*`, variables/tipos `tarea`/`Tarea` siguen igual) — únicamente cambia el string que ve el usuario.
  - **Dónde hay que tocar cuando se implemente**: `app/(app)/proyectos/[id]/page.tsx` (título de sección "Tareas" y botón "Nueva tarea"), `components/tareas/TablaTareas.tsx` (`EstadoVacio`, botones), `components/tareas/ModalTarea.tsx` (título del modal), `components/cotizaciones/ModalCotizacion.tsx` (label del `Select` "Alcance" y "General del proyecto" quedan igual, pero listar tareas ahí también es "Rubro"), `components/cotizaciones/TablaCotizaciones.tsx` y `components/proyectos/ProveedoresInvolucrados.tsx` (donde se muestra el nombre de la tarea como "alcance").
  - **Si en el futuro se pide el rename completo** (código + backend + rutas + migración Prisma en `gestion-interna-backend`), es un cambio de otro orden — evaluarlo aparte, no mezclarlo con el cambio de etiqueta.
- **Datos de prueba de Fase 2 sin limpiar** en la base local (`Proyecto QA Fase2`, `Cliente QA Fase2`, `Proveedor QA Fase2`, `Tarea QA` + 3 cotizaciones) — ver sección de verificación de Fase 2 arriba, no se pueden borrar vía API porque las cotizaciones no tienen `DELETE`.
- **Verificación visual en navegador real** sigue pendiente desde Fase 0 — la extensión Claude in Chrome no conectó en ninguna sesión hasta ahora. Todo lo construido en Fase 0/1/2 se probó por `tsc`/`eslint`/`curl`, nunca clickeando la UI. **Actualización 2026-08-18**: el usuario sí probó Fase 2 en un navegador real fuera de esta sesión (mandó una captura) — la UI funciona, confirmado independientemente de esta limitación.
- **Tipo de cambio / conversión de moneda — decidido el enfoque, todavía no implementado.** En el detalle de Proyecto, la tarjeta "Comprometido" muestra el monto por separado para cada moneda activa (UYU/USD/EUR) más una `BarraComprometido` por proveedor (ver Fase 2). El usuario pidió poder ver el total convertido a una sola moneda, con un selector para elegirla. Se descartó fabricar un tipo de cambio fijo en el código o llamar a una API externa (evaluar como integración aparte si se quiere) — **se decidió que el tipo de cambio lo ingresa/actualiza un ADMIN dentro de la app**, lo que requiere:
  - **Backend** (`gestion-interna-backend`, no tocado todavía): nuevo modelo Prisma `TipoCambio {id, moneda: Moneda @unique, valorEnUyu: Decimal, actualizadoEn}` (UYU es la moneda base, no necesita fila propia; solo USD/EUR). Nuevo módulo `tipos-cambio/` (controller+service+repositorio+interfaz+módulo) siguiendo el patrón de `sectores/` como plantilla más simple ya relevado: `GET /tipos-cambio` (cualquier rol autenticado, lo necesita el front para convertir), `PATCH /tipos-cambio/:moneda` (solo ADMIN, actualiza `valorEnUyu`) — sin POST/DELETE porque las filas son fijas (USD, EUR), se seedean con valor `1` para que el GET nunca truene. Agregar acción a `ACCIONES_AUDITORIA` (`ACTUALIZAR_TIPO_CAMBIO`) y registrar el módulo en `app.module.ts`. Migración nueva vía `npx prisma migrate dev` (no craftear el timestamp a mano).
  - **Frontend**: `lib/tipos-cambio/{tipos,api,hooks}.ts`, una UI para que ADMIN edite los valores (¿nueva página `/configuracion` o una sección en `/sectores`? no decidido), y un selector de moneda en la tarjeta "Comprometido" que convierta todos los montos activos a la moneda elegida usando esas tasas (conversión: origen→UYU con `valorEnUyu` de origen, luego UYU→destino dividiendo por `valorEnUyu` de destino).
  - **No arrancar esto sin confirmar con el usuario primero** — quedó pausado explícitamente ("dejalo para más adelante") antes de crear ningún archivo nuevo, así que no hay nada a medio construir por limpiar.

---

## Plan de fases (retomar desde acá)

### ✅ Fase 0 — Fundaciones (completa, ver arriba)

### ✅ Fase 1 — Catálogos simples (completa, ver "Estado actual" arriba)

### ✅ Fase 2 — Proyectos / Tareas / Cotizaciones (completa, ver "Estado actual" arriba)

### ✅ Fase 3 — Órdenes de Compra (completa, 2026-08-18)

El módulo real es más rico que el resumen original de este documento — antes de codear se releyó el backend completo (cadena de validaciones, eventos, servicio de aprobación separado del CRUD) y se armó un plan de negocio con el usuario (ver decisiones abajo). Estructura final:

```
lib/ordenes-compra/{tipos,api,hooks,presentacion}.ts → TipoOC/FormaPago/EstadoOC declarados acá. presentacion.ts centraliza TODAS las reglas de permiso por acción (puedeEditar, puedeEnviar, puedeAprobarORechazar, puedeObservarPago, puedeConfirmarPago, puedeResolverObservacion, puedeAnular) como funciones puras {orden, usuario}→boolean — un solo lugar, no repetir la lógica en cada botón. También calcularSaldoDisponible(cotizacion, ordenes) para el selector de cotización del formulario.
lib/comentarios/{tipos,api,hooks}.ts → useCrearComentario invalida ordenes-compra + historial además del hilo, porque comentar puede cambiar el estado como efecto lateral.

lib/sectores/hooks.ts, lib/usuarios/hooks.ts → se agregó useMapaSectores()/useMapaUsuarios() (mismo patrón mapa que clientes/proveedores). OJO: GET /usuarios es ADMIN-only en el backend — useMapaUsuarios() falla (403) para el resto de los roles y el mapa queda vacío (sin crash, sin reintentos por la config global de React Query). Por eso HistorialOrdenCompra/HiloComentarios comparan primero contra el usuario logueado y muestran "Vos" antes de caer al mapa — así todos los roles pueden identificar al menos sus propias acciones.
lib/cotizaciones/{api,hooks}.ts → se agregó obtenerCotizacion(id)/useCotizacion(id) (GET /cotizaciones/:id), no existía porque Fase 2 solo necesitaba listados anidados.

components/ordenes-compra/{FormularioOrdenCompra,TablaOrdenesCompra,TablaOrdenesCompraProyecto,HistorialOrdenCompra,HiloComentarios,ModalMotivoTransicion,ModalAdjuntarFactura}.tsx

app/(app)/ordenes-compra/page.tsx              → lista + accesos rápidos por rol (Mis borradores / Pendientes de mi aprobación si ENCARGADO / Para pagar si PAGOS) + filtros manuales Estado/Sector
app/(app)/ordenes-compra/nueva/page.tsx        → página completa (no modal — el form tiene ~12 campos + selector de cotización + factura, no entra cómodo en el Modal de 512px que usan los demás dominios)
app/(app)/ordenes-compra/[id]/page.tsx         → detalle: datos, botones de transición (gateados por las funciones de presentacion.ts), factura, historial, comentarios
app/(app)/ordenes-compra/[id]/editar/page.tsx  → reusa FormularioOrdenCompra con ordenExistente
```

**El modelo de negocio, para no tener que releer el backend de nuevo:**
- Una OC puede existir "suelta" (sin cliente/proyecto/tarea) o vinculada a una Cotización — si se vincula, `clienteId`/`proyectoId`/`tareaId` se derivan solos en el backend (el DTO de creación solo manda `cotizacionId`, nunca esos tres campos). El vínculo a la cotización es **inmutable** — `ActualizarOrdenCompraDto` no tiene `cotizacionId`.
- **Varias OC pueden vincularse a la misma cotización** (compras parciales contra un saldo) — el backend valida que la suma de montos de OCs no-ANULADAS no supere `cotizacion.montoTotal`. El formulario de alta muestra "saldo disponible" calculado en el front con `calcularSaldoDisponible()`, pero el backend es la autoridad final (puede rechazar con 422 igual si hay una carrera).
- **La máquina de estados NO es "ADMIN puede todo"**: `aprobar`/`rechazar` son `@Roles(ENCARGADO)` — ni ADMIN puede. `observar-pago`/`resolver-observacion`/`confirmar-pago` son `@Roles(PAGOS)` — tampoco ADMIN. Solo `anular` acepta ADMIN (sin restricción) o ENCARGADO (de ese sector). Verificado con los 4 usuarios de prueba contra el backend real, incluyendo los 403 esperados cuando el rol no corresponde.
- `EN_CONSULTA`↔`PENDIENTE` no son botones — se disparan solos al comentar (ENCARGADO del sector comenta una OC PENDIENTE→EN_CONSULTA; el solicitante responde→PENDIENTE). Verificado end-to-end con curl.
- **Decisión tomada con el usuario**: el backend permite que CUALQUIER usuario autenticado llame `enviar` sobre cualquier OC (no chequea pertenencia, a diferencia de editar/eliminar) — se decidió restringirlo en el front al mismo criterio que editar/eliminar (solicitante, mismo sector, o ADMIN), aunque el backend sea más laxo.
- Adjuntar/reemplazar factura funciona **en cualquier estado**, no solo BORRADOR (verificado sobre una OC ya PAGADA).
- Se agregó una 4ª tab "Órdenes de Compra" en `/proyectos/[id]` (pedido explícito del usuario: "ver las OC agrupadas a tareas y a proyectos") — reusa `useOrdenesCompra()` global filtrado client-side por `proyectoId`, agrupado por tarea igual que `TablaCotizaciones` de Fase 2.
- El Dashboard **sigue sin tocarse**, se decidió explícitamente dejarlo para Fase 5 aunque ahora ya hay datos reales de OC (para que el resumen salga completo junto con Auditoría).

**Verificación exhaustiva contra el backend real** (no solo `tsc`/`eslint`, que también salieron limpios): se corrió el ciclo de vida completo de una OC con los 4 roles de prueba — creación → enviar → comentario de ENCARGADO (PENDIENTE→EN_CONSULTA, confirmado) → respuesta del solicitante (→PENDIENTE, confirmado) → aprobar (ENCARGADO) → observar-pago (PAGOS) → resolver-observación → confirmar-pago (PAGADO) — más los permisos negativos (ADMIN no puede aprobar: 403: ENCARGADO no puede observar-pago: 403; PAGOS no puede anular: 403; anular sobre PAGADA: 409 TRANSICION_INVALIDA), las validaciones de cotización (`PROVEEDOR_NO_COINCIDE_CON_COTIZACION`, `MONTO_EXCEDE_COTIZACION`, derivación correcta de cliente/proyecto/tarea), factura en cualquier estado, y los permisos de editar/eliminar (403 `SIN_PERMISO_SOBRE_ORDEN_COMPRA`, 409 `ORDEN_COMPRA_NO_ES_BORRADOR`). **12 escenarios, todos coincidieron exactamente con lo codeado, cero sorpresas.**

Quedó una OC de prueba sin poder limpiar (#16, terminó PAGADA con factura adjunta — no se puede eliminar fuera de BORRADOR, mismo patrón que los datos de prueba de fases anteriores).

### ✅ Fase 4 — Auditoría (completa, 2026-08-18)

```
lib/auditoria/{tipos,api,hooks,presentacion}.ts
components/auditoria/TablaAuditoria.tsx
app/(app)/auditoria/page.tsx → RequiereRol(["ADMIN"])
```

- `ENTIDADES_AUDITORIA` (8 valores: Usuario, Sector, Cliente, Proveedor, Proyecto, Tarea, Cotizacion, OrdenCompra) y `ACCIONES_AUDITORIA` (32 valores) están **hardcodeados a mano** en `presentacion.ts` — el backend filtra por igualdad exacta y no tiene un endpoint de "valores distintos", así que si se agrega una acción/entidad nueva en `gestion-interna-backend/src/auditoria/acciones-auditoria.constantes.ts` hay que actualizar esta lista a mano. `formatearAccion()` humaniza el string (`APROBAR_ORDEN_COMPRA` → "Aprobar orden compra") con una transformación genérica en vez de mapear las 32 etiquetas a mano.
- El filtro de Usuario usa `useUsuarios()` (ADMIN-only, pero esta página también lo es, así que no hay problema de 403 como en Fase 3).

**Paginación real agregada al backend — la primera del proyecto.** Auditoría es la única tabla que crece sin límite natural (cada acción de cualquier módulo genera una fila, para siempre), a diferencia de los catálogos que se estabilizan chicos — por eso se decidió con el usuario que ésta sí necesitaba paginación de verdad, y no alcanzaba con limitar el renderizado del lado del cliente (eso no reduce lo que se transfiere por red). Cambios en `gestion-interna-backend` (cross-repo):
  - `GET /auditoria` ahora acepta `?pagina=&porPagina=` (default 1/50, `porPagina` clampeado a un máximo de 200) además de los filtros existentes.
  - `IAuditoriaRepositorio` ganó `PaginacionAuditoria` y `contarConFiltros()` — `buscarConFiltros()` ahora aplica `skip`/`take`.
  - El envoltorio `{datos, total, pagina, porPagina}` ahora es **real** acá (en el resto del backend `total`/`pagina`/`porPagina` son siempre `datos.length`/`1`/`datos.length`, una paginación "de mentira" — ver decisión no negociable #4 al principio de este documento, que sigue aplicando para todo lo demás).
  - Verificado con curl: `porPagina=10` trae 10 de 79, `pagina=2` trae el siguiente bloque, `porPagina=500` clampea a 200, sin parámetros trae 50 por defecto.
- **Frontend**: `lib/auditoria/api.ts` es el único `api.ts` del proyecto que devuelve el sobre completo (`{datos, total, ...}`) en vez de desenvolver `.datos` — necesita `total` para el botón "Cargar más". `useAuditoriaPaginada(filtrosBase, paginasCargadas, porPagina)` en `hooks.ts` pide las páginas `1..paginasCargadas` con `useQueries` (cada página queda cacheada por separado — "Cargar más" solo pide la página nueva) y devuelve el array ya combinado — **a propósito no se usó un acumulador de estado + `useEffect`** (la primera versión sí lo hacía y el linter la rechazó con `react-hooks: no-set-state-in-effect`, correctamente — ver ese error si se repite el patrón en otro lado).
- Cambiar cualquier filtro reinicia `paginasCargadas` a 1.

**Gotcha de esta sesión (herramienta, no del código)**: mientras se iteraba sobre la versión con `useEffect`, el dev server logueó varios "Fast Refresh had to perform a full reload due to a runtime error" — si alguien tenía `/auditoria` abierto en el navegador en ese momento pudo ver un error parpadear. Se resolvió al reescribir con `useQueries`; las cargas posteriores quedaron limpias sin warnings.

### Mejora post-Fase 4 — Costo/rentabilidad en la tarjeta "Comprometido" (2026-08-19)

La tarjeta "Comprometido" de `/proyectos/[id]` (antes: solo el total comprometido + barra por proveedor) ahora muestra Costo aproximado, Honorarios, Costo SEG (editable), Gastado y Margen de equipo, con un gráfico nuevo (`BarraCostosProyecto`, Costo cliente/Costo SEG/Gastado) que **reemplazó y borró** `BarraComprometido` (quedó sin otros usos). También se borró `calcularComprometido`/`ComprometidoPorProveedor`/`ComprometidoPorMoneda` de `lib/cotizaciones/presentacion.ts` (quedaron sin consumidores).

- `lib/proyectos/presentacion.ts` (nuevo) → `calcularResumenCostos(proyecto, cotizaciones, ordenesCompra, monedaSeleccionada?)` + `obtenerMonedasDisponibles(cotizaciones, ordenesCompra)`. Todo el cálculo se hace **en una sola moneda a la vez**, elegible con un selector en la tarjeta (ver `TarjetaComprometido`, actualización 2026-08-19 más abajo) — nunca se mezclan montos de distinta moneda en una resta. Por defecto arranca en la moneda de la cotización general ACTIVA del proyecto. Costo aproximado/Honorarios/Margen de equipo dependen de esa cotización general, así que solo tienen valor cuando la moneda elegida coincide con la suya — en cualquier otra moneda salen `null` (la tarjeta muestra "—"); Costo SEG (calculado) y Gastado sí se recalculan para la moneda que se esté mirando. Si no hay ninguna moneda con actividad (sin cotizaciones activas de ningún tipo), `calcularResumenCostos` devuelve `null` y la tarjeta cae al estado "Sin cotizaciones activas" de siempre.
- **Actualización 2026-08-19 (mismo día, ajuste post-implementación)**: se agregó el selector de moneda pedido por el usuario — la tarjeta muestra la moneda actual arriba a la derecha (junto al título "Comprometido", que se movió de `page.tsx` a dentro de `TarjetaComprometido` para poder ponerlos en la misma fila) con un botón "Cambiar" que cicla entre `monedasDisponibles` (solo aparece si hay más de una). El override manual de "Costo SEG" (`costoSegManual`, un solo campo en `Proyecto`, sin moneda propia) solo es editable cuando la moneda mostrada coincide con la de la cotización general (`resumen.costoSegEditable`) — en cualquier otra moneda se ve el valor calculado sin botón de editar. Se sacó `hayOtrasMonedas` (ya no hace falta advertir, ahora se puede simplemente cambiar de moneda y ver esos montos).
- `components/proyectos/TarjetaComprometido.tsx` (nuevo, reemplaza el bloque inline que había en `page.tsx`) → encapsula la edición de "Costo SEG": un valor manual se guarda vía `useActualizarProyecto(id).mutateAsync({ costoSegManual })` y queda fijo hasta tocar "Volver a calcular" (`useRecalcularCostoSegProyecto`, `POST /proyectos/:id/recalcular-costo-seg`). Es el primer campo editable de este tipo en la app — no existe (ni se creó) un componente `CampoEditable` genérico, la edición vive local a este componente.
- `components/cotizaciones/ModalCotizacion.tsx` → nuevo campo "Honorarios" (opcional), visible **solo** cuando el alcance elegido es "General del proyecto" (`watch("tareaId") === GENERAL`) — para una cotización de tarea ni se muestra el campo, y si igual se manda, el backend lo rechaza con 422.
- Sin restricción de rol nueva para ver/editar costo SEG o margen — decisión explícita del usuario, mismo criterio abierto que ya tenía Proyectos/Cotizaciones.

### ⬜ Fase 5 — Pulido
Dashboard real por rol (mis borradores / pendientes de mi aprobación si ENCARGADO / para pagar si PAGOS — hoy `app/(app)/dashboard/page.tsx` es un placeholder que solo saluda). Estados de carga consistentes, manejo de errores consistente en toda la app, **responsive/mobile** (hoy `EncabezadoApp` no tiene menú mobile, ver Fase 0). Verificación visual real en navegador (pendiente desde la Fase 0 por falta de extensión Chrome conectada).

---

## Convenciones (heredadas del backend, aplican igual acá)

- **Todo en español**: componentes, hooks, variables, rutas, mensajes — salvo restricciones técnicas de Next.js/React (`layout.tsx`, `page.tsx`, decoradores/convenciones de archivo, nombres de variables de entorno como `NEXT_PUBLIC_API_URL`).
- **Sin comentarios que expliquen el qué** — solo para el porqué cuando no es obvio (ver ejemplo real en `lib/auth/contexto.tsx`, el comentario sobre por qué la hidratación de sesión tiene que ir en un `useEffect`).
- Nombres de archivo: `PascalCase.tsx` para componentes, `kebab-case.ts` para el resto (`lib/http/cliente.ts`, `lib/auth/almacen-token.ts`).
- No agregar abstracciones para casos hipotéticos futuros — construir cada fase con lo que necesita, no de más (ej. no se construyeron los enums `EstadoOC`/`Moneda`/etc. en Fase 0 porque nada los usa todavía).
