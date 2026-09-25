// Savanna contact — standalone Google Apps Script. No spreadsheet required.
// Paste into Code.gs, run authorizeServices, then deploy as a Web app.
const OWNER_EMAIL = 'djsavanna.bookings@gmail.com';
const SENT_PREFIX = 'sent_';
const DEDUP_MS = 24 * 60 * 60 * 1000;

function authorizeServices() {
  const quota = MailApp.getRemainingDailyQuota(); // Requests permission, sends nothing.
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('WEBHOOK_SECRET')) {
    properties.setProperty('WEBHOOK_SECRET', Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''));
  }
  console.log('Ready. Remaining daily recipients: ' + quota + '. Copy WEBHOOK_SECRET from Project Settings > Script properties.');
}

// Run manually from the editor to send ONE real test email to Savanna.
function sendTestEmail() {
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: 'Savanna — MailApp test',
    body: 'MailApp is working. Next, test the contact form on the Savanna website.',
    name: 'Savanna Bookings',
  });
  console.log('Test accepted by MailApp. Check the inbox and spam folder.');
}

function doGet() {
  return jsonResponse({ok: true, service: 'Savanna contact'});
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const contents = e && e.postData && e.postData.contents;
    if (typeof contents !== 'string' || contents.length > 16000) return failure('invalid_request');
    const body = JSON.parse(contents);
    const properties = PropertiesService.getScriptProperties();
    const secret = properties.getProperty('WEBHOOK_SECRET');
    if (!secret || secret.length < 32 || !body || body.secret !== secret || body.type !== 'contact') {
      return failure('unauthorized');
    }
    const c = normalizeContact(body.contact);
    if (!c) return failure('invalid_contact');
    if (!lock.tryLock(5000)) return failure('busy');

    const now = Date.now();
    const saved = properties.getProperties();
    Object.keys(saved).forEach(function(key) {
      if (key.indexOf(SENT_PREFIX) === 0 && (!Number(saved[key]) || now - Number(saved[key]) >= DEDUP_MS)) {
        properties.deleteProperty(key);
      }
    });
    // Persist only a digest and timestamp, never the visitor's message or email.
    // Changing content produces a different key; a retry of the same content does not.
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(c), Utilities.Charset.UTF_8);
    const key = SENT_PREFIX + Utilities.base64EncodeWebSafe(digest);
    if (properties.getProperty(key)) return jsonResponse({ok: true, sent: true});
    if (MailApp.getRemainingDailyQuota() < 1) return failure('quota_exceeded');

    MailApp.sendEmail({
      to: OWNER_EMAIL,
      replyTo: c.email,
      subject: 'Savanna | ' + c.inquiryType + ' | ' + c.name,
      body: [
        'New inquiry from the Savanna website', '',
        'Name: ' + c.name, 'Email: ' + c.email,
        'Inquiry: ' + c.inquiryType, '', c.message, '',
        'Consent to reply: yes', 'Reference: ' + c.id,
      ].join('\n'),
      name: 'Savanna Bookings',
    });
    // MailApp has accepted the message. This is not an inbox-delivery receipt.
    properties.setProperty(key, String(now));
    return jsonResponse({ok: true, sent: true});
  } catch (error) {
    // Do not log the request, secret or visitor data.
    console.error('Contact delivery could not be confirmed.');
    return failure('delivery_failed');
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function normalizeContact(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const fields = ['id', 'name', 'email', 'inquiryType', 'message'];
  const c = {};
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (typeof raw[field] !== 'string') return null;
    c[field] = raw[field].trim();
  }
  c.email = c.email.toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(c.id)) return null;
  if (c.name.length < 2 || c.name.length > 80 || /[\r\n]/.test(c.name)) return null;
  if (c.email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return null;
  if (['Booking', 'Collaboration', 'Press & media', 'Other'].indexOf(c.inquiryType) === -1) return null;
  if (c.message.length < 10 || c.message.length > 3000 || raw.privacyConsent !== true) return null;
  c.privacyConsent = true;
  return c;
}

function failure(code) {
  return jsonResponse({ok: false, sent: false, code: code});
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
