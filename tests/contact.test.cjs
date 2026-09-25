const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const env = {
  GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/test-deployment/exec',
  GOOGLE_APPS_SCRIPT_SECRET: 'a-test-only-secret-with-at-least-32-characters',
  NODE_ENV: 'development',
  TURNSTILE_SECRET_KEY: 'test-only',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test-only',
};
const input = {
  id: '9a0e9f20-aafa-49b9-a6ab-2366e5c35221',
  name: 'Local Test', email: 'local@example.com', inquiryType: 'Booking',
  message: 'This is a local validation test.', privacyConsent: true,
  startedAt: Date.now() - 5000, captchaToken: 'test-token', website: '',
};

function setup({config = env, captcha = true, emailStatus = 200, emailData = {ok: true, sent: true}, failEmail = false, emailDelay = 0, timeoutEmail = false} = {}) {
  const calls = [];
  function load(file) {
    const js = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
    }).outputText;
    const context = {
      exports: {}, process: {env: config}, Date, Error, URLSearchParams, AbortSignal,
      require(name) {
        if (name === '@/lib/contact') return load('src/lib/contact.ts');
        if (name === '@/lib/contact-config') return load('src/lib/contact-config.ts');
        if (name === 'next/server') return {NextResponse: {json: (body, init) => Response.json(body, init)}};
        if (name === 'node:crypto') return require(name);
        throw new Error('Unexpected import: ' + name);
      },
      async fetch(url, options) {
        calls.push({url, ...options});
        if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
          return Response.json({success: captcha});
        }
        assert.equal(url, env.GOOGLE_APPS_SCRIPT_URL);
        if (timeoutEmail) {const error = new Error('Simulated timeout');error.name = 'TimeoutError';throw error;}
        if (failEmail) throw new Error('Simulated timeout');
        if (emailDelay) await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {options.signal.removeEventListener('abort', onAbort);resolve();}, emailDelay);
          function onAbort() {clearTimeout(timer);reject(options.signal.reason);}
          options.signal.addEventListener('abort', onAbort, {once: true});
          if (options.signal.aborted) onAbort();
        });
        return Response.json(emailData, {status: emailStatus});
      },
    };
    vm.runInNewContext(js, context);
    return context.exports;
  }
  const {POST} = load('src/app/api/contact/route.ts');
  const send = (body = input) => POST(new Request('http://localhost/api/contact', {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body),
  }));
  return {send, calls};
}

test('requires configuration and makes no external calls when missing', async () => {
  const {send, calls} = setup({config: {}});
  const response = await send();
  assert.equal(response.status, 503);
  assert.equal((await response.json()).sent, false);
  assert.equal(calls.length, 0);
});

test('rejects invalid input and failed CAPTCHA before sending email', async () => {
  const {send, calls} = setup({captcha: false});
  assert.equal((await send({...input, email: 'invalid'})).status, 400);
  assert.equal(calls.length, 0);
  assert.equal((await send()).status, 400);
  assert.equal(calls.length, 1);
});

test('forwards only validated contact fields with server secret and stable retry payload', async () => {
  const {send, calls} = setup();
  assert.equal((await send({...input, to: 'attacker@example.com'})).status, 200);
  assert.equal((await send({...input, captchaToken: 'refreshed-token'})).status, 200);
  const emails = calls.filter(call => call.url === env.GOOGLE_APPS_SCRIPT_URL);
  const email = JSON.parse(emails[0].body);
  assert.equal(email.secret, env.GOOGLE_APPS_SCRIPT_SECRET);
  assert.equal(email.type, 'contact');
  assert.equal(email.contact.email, input.email);
  assert.equal(email.contact.to, undefined);
  assert.equal(email.contact.message, input.message);
  assert.equal(emails[0].body, emails[1].body);
  assert.equal(emails[0].redirect, 'follow');

});

for (const [name, options] of [
  ['provider rejection', {emailStatus: 403, emailData: {message: 'unverified sender'}}],
  ['quota exhausted', {emailStatus: 429, emailData: {message: 'quota exceeded'}}],
  ['provider response without explicit send confirmation', {emailData: {ok: true}}],
  ['network failure', {failEmail: true}],
]) {
  test(name + ' never reports success', async () => {
    const {send} = setup(options);
    const response = await send();
    assert.equal(response.status, 502);
    const data = await response.json();
    assert.equal(data.sent, false);
    assert.match(data.error, /djsavanna.bookings@gmail.com/);
  });
}

test('production refuses development Turnstile keys', async () => {
  const {send, calls} = setup({config: {...env, NODE_ENV: 'production',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA'}});
  assert.equal((await send()).status, 503);
  assert.equal(calls.length, 0);
});

test('misconfigured webhook cannot receive visitor data or secret', async () => {
  const {send, calls} = setup({config: {...env, GOOGLE_APPS_SCRIPT_URL: 'https://example.com/exec'}});
  assert.equal((await send()).status, 503);
  assert.equal(calls.length, 0);
});

test('accepts Google confirmation arriving after the former 14-second cutoff', async () => {
  const {send} = setup({emailDelay: 14500});
  const response = await send();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).sent, true);
});

test('timeout explains uncertain delivery and never automatically resends', async () => {
  const {send, calls} = setup({timeoutEmail: true});
  const response = await send();
  assert.equal(response.status, 504);
  const data = await response.json();
  assert.equal(data.sent, false);
  assert.match(data.error, /may already be on its way/);
  assert.equal(calls.filter(call => call.url === env.GOOGLE_APPS_SCRIPT_URL).length, 1);
});
