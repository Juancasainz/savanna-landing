const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const script = fs.readFileSync(require('node:path').join(__dirname, '../docs/google-apps-script.js'), 'utf8');
const secret = 'test-only-secret-with-at-least-32-characters';
const contact = {
  id: '9a0e9f20-aafa-49b9-a6ab-2366e5c35221', name: 'Test Visitor',
  email: 'visitor@example.com', inquiryType: 'Booking',
  message: 'A local test inquiry for Savanna.', privacyConsent: true,
};
function setup({quota = 10, failMail = false, busy = false} = {}) {
  const values = new Map([['WEBHOOK_SECRET', secret]]);
  const sent = [];
  let locked = false;
  const properties = {
    getProperty: key => values.get(key) || null,
    setProperty: (key, value) => values.set(key, value),
    getProperties: () => Object.fromEntries(values),
    deleteProperty: key => values.delete(key),
  };
  const context = {
    Date, console: {log() {}, error() {}},
    PropertiesService: {getScriptProperties: () => properties},
    LockService: {getScriptLock: () => ({
      tryLock() {locked = !busy; return locked;},
      hasLock: () => locked, releaseLock() {locked = false;},
    })},
    MailApp: {
      getRemainingDailyQuota: () => quota,
      sendEmail(data) {
        if (failMail) throw new Error('Simulated mail failure');
        sent.push(JSON.parse(JSON.stringify(data)));
      },
    },
    Utilities: {
      getUuid: crypto.randomUUID,
      DigestAlgorithm: {SHA_256: 'sha256'}, Charset: {UTF_8: 'utf8'},
      computeDigest: (algorithm, data) => crypto.createHash(algorithm).update(data).digest(),
      base64EncodeWebSafe: data => data.toString('base64url'),
    },
    ContentService: {
      MimeType: {JSON: 'application/json'},
      createTextOutput: text => ({setMimeType: () => JSON.parse(text)}),
    },
  };
  vm.createContext(context);
  vm.runInContext(script, context);
  return {context, values, sent, call: (body = {secret, type: 'contact', contact}) =>
    context.doPost({postData: {contents: JSON.stringify(body)}})};
}
test('setup creates a secret once, authorizes without sending and does not require Sheets', () => {
  const {context, values, sent} = setup();
  values.delete('WEBHOOK_SECRET');
  context.authorizeServices();
  const created = values.get('WEBHOOK_SECRET');
  assert.equal(created.length, 64);
  context.authorizeServices();
  assert.equal(values.get('WEBHOOK_SECRET'), created);
  assert.equal(sent.length, 0);
});
test('sends to fixed owner, uses visitor reply-to, and deduplicates retries', () => {
  const {call, sent, values} = setup();
  const body = {secret, type: 'contact', contact: {...contact, to: 'wrong@example.com'}};
  assert.equal(call(body).sent, true);
  assert.equal(call(body).sent, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'djsavanna.bookings@gmail.com');
  assert.equal(sent[0].replyTo, contact.email);
  assert.ok(sent[0].body.includes(contact.message));
  assert.equal(sent[0].htmlBody, undefined);
  for (const [key, value] of values) {
    if (key !== 'WEBHOOK_SECRET') assert.match(value, /^\d+$/);
  }
  assert.equal(call({...body, contact: {...contact, message: 'Changed message for a new inquiry.'}}).sent, true);
  assert.equal(sent.length, 2);
});
test('rejects wrong secrets, missing consent and injected subject headers', () => {
  const {call, sent} = setup();
  assert.equal(call({secret: 'wrong', type: 'contact', contact}).code, 'unauthorized');
  assert.equal(call({secret, type: 'contact', contact: {...contact, privacyConsent: false}}).code, 'invalid_contact');
  assert.equal(call({secret, type: 'contact', contact: {...contact, name: 'Test\r\nBcc: wrong@example.com'}}).code, 'invalid_contact');
  assert.equal(sent.length, 0);
});
for (const [name, options, code] of [
  ['exhausted quota', {quota: 0}, 'quota_exceeded'],
  ['concurrent busy execution', {busy: true}, 'busy'],
  ['MailApp failure', {failMail: true}, 'delivery_failed'],
]) {
  test(name + ' never reports sent', () => {
    const {call, sent, values} = setup(options);
    const result = call();
    assert.equal(result.sent, false);
    assert.equal(result.code, code);
    assert.equal(sent.length, 0);
    assert.equal(values.size, 1);
  });
}
test('cleans expired fingerprints without removing the secret', () => {
  const {values, call} = setup();
  values.set('sent_old', String(Date.now() - 25 * 60 * 60 * 1000));
  assert.equal(call().sent, true);
  assert.equal(values.has('sent_old'), false);
  assert.equal(values.get('WEBHOOK_SECRET'), secret);
});
test('health check sends nothing; manual mail test sends only to owner', () => {
  const {context, sent} = setup();
  assert.equal(context.doGet().ok, true);
  assert.equal(sent.length, 0);
  context.sendTestEmail();
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'djsavanna.bookings@gmail.com');
});
