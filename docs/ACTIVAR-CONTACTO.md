# Activar el contacto de Savanna sin dominio

**Formulario → servidor Next.js → Google Apps Script → MailApp → djsavanna.bookings@gmail.com.**

No necesitas dominio, Google Sheets, Resend ni contraseña de aplicación de Gmail. El script es un proyecto independiente. Al pulsar «Responder» en Gmail, responderás al visitante.

**Estado:** código preparado. Falta autorizar tu cuenta, publicar el script y verificar una entrega real. Las pruebas automáticas simulan Google; no envían correos.

## 1. Crear el proyecto

1. Abre https://script.google.com/ con **djsavanna.bookings@gmail.com**.
2. Pulsa **Nuevo proyecto** y llámalo **Savanna — Contact form**.
3. Abre [google-apps-script.js](google-apps-script.js) y copia su contenido completo.
4. En Google, reemplaza el contenido inicial de **Código.gs / Code.gs** por ese código y guarda.

No crees una hoja de cálculo ni reutilices el proyecto de TEUC.

## 2. Autorizar y crear el secreto

1. En el selector de funciones de la barra superior, elige **authorizeServices** y pulsa **Ejecutar**.
2. Revisa y autoriza el permiso de envío con tu cuenta de bookings. Esta función no envía correos.
3. Si Google avisa de una aplicación no verificada, comprueba que estás en el proyecto que acabas de crear y que el código es el de Savanna. Revisa tú el consentimiento; no autorices un proyecto desconocido.
4. Abre **Configuración del proyecto → Propiedades de la secuencia de comandos**.
5. Verás **WEBHOOK_SECRET**, generado automáticamente. Copia su valor para el paso 5. No lo compartas en el chat ni lo pongas en código público.

El secreto protege el envío: conocer la URL pública por sí solo no permite mandar correos. Solo el servidor de la web usa ese secreto. Ejecutar authorizeServices otra vez conserva el mismo valor.

## 3. Probar MailApp

1. Elige **sendTestEmail** en el selector de funciones y pulsa **Ejecutar** una vez.
2. Esta función SÍ envía un correo real a **djsavanna.bookings@gmail.com**, con asunto **Savanna — MailApp test**.
3. Comprueba tu bandeja de entrada y Spam.

Esto verifica MailApp. Después probaremos el formulario completo.

## 4. Publicar el script

1. Pulsa **Implementar → Nueva implementación**.
2. En el selector de tipo (engranaje), elige **Aplicación web**.
3. Pon una descripción, por ejemplo **Savanna contact v1**.
4. En **Ejecutar como**, selecciona **Yo**.
5. En **Quién tiene acceso**, selecciona **Cualquier persona**, para que el servidor pueda llamarlo sin iniciar sesión.
6. Pulsa **Implementar**, completa la autorización si Google la solicita y copia la URL de la aplicación web que termina en **/exec**.

No uses el enlace del editor ni /dev. El script exige el secreto para procesar envíos. [Referencia de Google](https://developers.google.com/apps-script/guides/web).

Al abrir /exec en el navegador debe aparecer:

`{"ok":true,"service":"Savanna contact"}`

Esto solo comprueba que la URL es accesible; no manda correo.

## 5. Conectar la landing local

En `/Users/juancarlossainzponte/Desktop/savanna-landing`, crea **.env.local** copiando **.env.example**. Si ya existe, edítalo conservando otras variables. Pon:

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_IMPLEMENTACION/exec
GOOGLE_APPS_SCRIPT_SECRET=PEGA_AQUI_EL_VALOR_DE_WEBHOOK_SECRET
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Sustituye los primeros dos valores por los tuyos. Las últimas dos líneas son las claves oficiales de prueba de Cloudflare: funcionan en localhost y 127.0.0.1 sin registrar dominio. No protegen de bots y son exclusivamente para desarrollo; el código impide activar producción con ellas. [Referencia de Cloudflare](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

Las variables antiguas RESEND_API_KEY, CONTACT_FROM_EMAIL y GOOGLE_SHEETS_* ya no se utilizan.

## 6. Reiniciar y probar el formulario completo

En la terminal donde está la web, pulsa **Ctrl+C** y arranca otra vez:

```sh
cd /Users/juancarlossainzponte/Desktop/savanna-landing
npm run dev
```

Abre http://127.0.0.1:3005/contact.

1. Rellena nombre, un email al que tengas acceso, tipo de consulta y mensaje de prueba.
2. Marca el consentimiento. El widget de prueba debería validar automáticamente.
3. Pulsa **Send inquiry**.
4. La web debe indicar que el mensaje está en camino.
5. Comprueba que llega a **djsavanna.bookings@gmail.com**, con asunto **Savanna | Booking | Tu nombre**.
6. Pulsa **Responder** y verifica que apunta al email que escribiste en el formulario.

Considera la conexión lista cuando llegue esta segunda prueba. Los campos no se borran si falla el envío.

## Más adelante: publicar la landing

El script está alojado en Google. La web local necesita el ordenador encendido; para visitas públicas usa un hosting compatible con Next.js y rutas de servidor. Puedes usar el subdominio que te asigne el hosting, sin comprar dominio.

Antes de publicarla, crea un widget real de Turnstile para ese hostname, sustituye las claves de prueba, añade las cuatro variables en el hosting y vuelve a desplegar. Cambiar la clave pública requiere nueva compilación. El secreto nunca debe aparecer en el código del navegador.

## Límites y mantenimiento

- Gmail personal permite actualmente 100 destinatarios diarios mediante Apps Script, compartidos entre scripts de esa cuenta. Cada consulta envía a una dirección y cada prueba también consume cuota. [Cuotas de Google](https://developers.google.com/apps-script/guides/services/quotas).
- MailApp envía correo sin necesitar acceso a leer tu bandeja. [Referencia de MailApp](https://developers.google.com/apps-script/reference/mail/mail-app).
- El script valida campos, fija el destinatario y comprueba la cuota. Si el envío falla, la web muestra un error y ofrece el correo directo.
- Google puede tardar en confirmar. La web espera hasta 45 segundos al script y muestra un aviso mientras envía; el navegador espera hasta 65 segundos para recibir la respuesta del servidor. Si se agota ese margen, indica que el correo podría estar en camino. Al publicar, el hosting debe permitir al menos los 60 segundos configurados para esta ruta.
- Para reconocer reintentos, guarda solo una huella y fecha del envío confirmado durante 24 horas. No guarda mensajes ni emails en esas propiedades. Las huellas caducadas se limpian en la siguiente solicitud válida.
- No hay cola de reenvío ni garantía de envío exactamente una vez: si Google manda el correo y falla antes de guardar la huella, un reintento podría duplicarlo. La aceptación tampoco garantiza llegada a la bandeja de entrada.
- Tras editar el script, usa **Implementar → Gestionar implementaciones → Editar → Nueva versión → Implementar**, conservando la URL.
- No ejecutes doPost desde el botón Ejecutar: necesita la solicitud enviada por la web.
- Si aparece «The form is opening soon», revisa variables, URL /exec, secreto de al menos 32 caracteres y reinicio. En producción revisa además las claves reales de Turnstile.
- Si /exec muestra una página de acceso o HTML, revisa **Cualquier persona**, **Ejecutar como: Yo** y el enlace. En **Ejecuciones** de Apps Script puedes ver si doPost se ejecutó; no registres secretos ni datos de visitantes.
