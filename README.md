# Savanna

Landing personal en inglés, construida con Next.js 16, React 19 y TypeScript. Inspirada en la estructura de Teuc y en el presskit de Savanna. Paleta negro, índigo y violeta inspirada en SoundCloud. Hero extendido con ImageGen; los originales se conservan. En móvil, la imagen precede a los textos.

## Ver en local

```sh
cd /Users/juancarlossainzponte/Desktop/savanna-landing
npm install
npm run dev
```

Abrir http://127.0.0.1:3005. Para compilar: `npm run build`. Para ejecutar la compilación: `npm start`.

## Contenido

- `/`: hero, About me, Presence, My music, My DJ sets y contacto.
- `/contact`: formulario y correo directo.
- `src/content/music.ts`: lanzamientos y sets. Incluye los enlaces del PDF, las fechas originales de lanzamiento y las tres playlists reales de SoundCloud.
- `public/images`: fotos suministradas y portadas extraídas del PDF. Las portadas tienen la resolución del presskit; sustituir por originales si se necesitan ampliaciones.
- `public/savanna-presskit-2026.pdf`: presskit descargable.

## Contacto

Sigue **[docs/ACTIVAR-CONTACTO.md](docs/ACTIVAR-CONTACTO.md)**. Envío con Google Apps Script + MailApp a djsavanna.bookings@gmail.com, sin Sheets ni dominio propio. El script independiente está en `docs/google-apps-script.js`. La guía explica autorización, despliegue y prueba local con las claves oficiales de prueba de Turnstile. Falta configurar la cuenta de Google y comprobar una entrega real.

La API responde 503 cuando faltan credenciales; solo confirma el envío cuando Apps Script informa que MailApp lo aceptó. Apps Script conserva una huella y fecha durante 24 horas para reconocer reintentos confirmados, sin guardar el contenido del mensaje. No hay una garantía de envío exactamente una vez si Google acepta un correo y falla antes de guardar esa huella. Las portadas y sus botones de play abren YouTube en una pestaña nueva. La Isla del Sol conserva su playlist de YouTube del presskit; el resto abre provisionalmente el canal de Savanna hasta recibir los enlaces específicos. Para sustituirlos, añade `youtubeUrl` a cada entrada de `src/content/music.ts`.

Pruebas locales sin enviar correos: `node --test tests/*.test.cjs`.

## Despliegue

Utiliza un hosting compatible con Next.js y sus rutas de servidor. Añade las cuatro variables de `.env.example` antes de compilar y desplegar, usando claves reales de Turnstile en producción. Las claves de prueba solo funcionan en desarrollo. Esta entrega está preparada y revisada en local; no se ha publicado.
