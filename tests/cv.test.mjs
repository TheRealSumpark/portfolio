import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initCV } from '../src/cv.mjs';
import { createPageNavigation } from '../src/navigation.mjs';

// Minimal DOM fixture for exercising rendering and events without a browser dependency.
class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.text = '';
  }
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(' '); }
  get lastElementChild() { return this.children.at(-1); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.text = ''; this.children = children; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name); }
  addEventListener(name, callback) { this.listeners.set(name, callback); }
  click() { this.listeners.get('click')?.(); }
}

function descendants(node) {
  return [node, ...node.children.flatMap(descendants)];
}

function fixture() {
  const root = new Element('document');
  // Use the real page's IDs so the test catches missing integration hooks.
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
  const section = html.match(/<section[^>]*id="cv"[\s\S]*?<\/section>/)[0];
  const ids = [...section.matchAll(/<([a-z0-9]+)[^>]*\bid="([^"]+)"/g)];
  ids.forEach(([, tag, id]) => {
    const node = new Element(tag);
    node.id = id;
    root.append(node);
  });
  root.createElement = tag => new Element(tag);
  root.querySelector = selector => descendants(root).find(node => node.id === selector.slice(1));
  return root;
}

const profile = {
  email: 'b.a.yassine.perso@gmail.com',
  github: 'https://github.com/TheRealSumpark',
  linkedin: 'https://www.linkedin.com/in/yassine-ben-azizi/',
};

test('CV starts in English with the current contact email and accessible section labels', () => {
  const root = fixture();
  initCV(profile, root);
  const content = root.querySelector('#cv-content');
  assert.equal(root.querySelector('#cv').lang, 'en');
  assert.match(content.textContent, /Cybersecurity Engineer/);
  assert.match(content.textContent, /Exchange Year in Engineering/);
  assert.match(content.textContent, /English — Bilingual/);
  assert.equal(root.querySelector('#cv-language-label').textContent, 'Français');
  assert.equal(root.querySelector('#cv-language-toggle').lang, 'fr');
  assert.equal(root.querySelector('#cv-language-status').textContent, '');
  assert.equal(descendants(content).filter(node => node.href === `mailto:${profile.email}`).length, 1);
  for (const node of descendants(content)) {
    if (node.tagName === 'SECTION') assert.ok(root.querySelector(`#${node.getAttribute('aria-labelledby')}`));
    if (node.target === '_blank') assert.equal(node.rel, 'noopener noreferrer');
    assert.ok(!node.href?.startsWith('tel:'));
  }
});

test('language button switches the entire CV both ways without replacing the control', () => {
  const root = fixture();
  initCV(profile, root);
  const toggle = root.querySelector('#cv-language-toggle');
  toggle.click();
  assert.equal(root.querySelector('#cv').lang, 'fr');
  assert.equal(root.querySelector('#cv-title-prefix').textContent, 'Mon');
  assert.match(root.querySelector('#cv-content').textContent, /Ingénieur cybersécurité/);
  assert.match(root.querySelector('#cv-content').textContent, /Année d’échange en école d’ingénieurs/);
  assert.match(root.querySelector('#cv-content').textContent, /Français — Bilingue/);
  assert.doesNotMatch(root.querySelector('#cv-content').textContent, /Exchange Year in Engineering/);
  assert.equal(root.querySelector('#cv-language-status').textContent, 'CV affiché en français.');
  assert.equal(root.querySelector('#cv-language-label').textContent, 'English');
  assert.equal(toggle.lang, 'en');
  assert.equal(toggle.getAttribute('aria-label'), 'Read the CV in English');
  assert.equal(root.querySelector('#cv-language-toggle'), toggle);
  toggle.click();
  assert.equal(root.querySelector('#cv').lang, 'en');
  assert.equal(root.querySelector('#cv-title-prefix').textContent, 'My');
  assert.equal(root.querySelector('#cv-language-status').textContent, 'CV displayed in English.');
  assert.match(root.querySelector('#cv-content').textContent, /Cybersecurity Engineer/);
  assert.doesNotMatch(root.querySelector('#cv-content').textContent, /Encadrement et mentorat/);
});

test('repeated switches keep one CV and default to English on a new visit', () => {
  const root = fixture();
  initCV(profile, root);
  const toggle = root.querySelector('#cv-language-toggle');
  for (let i = 0; i < 20; i++) toggle.click();
  assert.equal(root.querySelector('#cv-content').children.length, 2);
  const ids = descendants(root).map(node => node.id).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length);
  toggle.click();
  const fresh = fixture();
  initCV(profile, fresh);
  assert.equal(fresh.querySelector('#cv').lang, 'en');
});

test('CV waits for planet arrival and a stale arrival cannot reveal it', () => {
  const callbacks = [];
  const started = [];
  const revealed = [];
  const navigate = createPageNavigation({
    scene: { navigate(route, immediate, callback) { callbacks.push(callback); } },
    onStart: route => started.push(route),
    onComplete: route => revealed.push(route),
  });
  navigate('cv');
  assert.deepEqual(started, ['cv']);
  assert.deepEqual(revealed, []);
  callbacks[0]();
  assert.deepEqual(revealed, ['cv']);
  navigate('cv');
  navigate('contact');
  callbacks[1]();
  assert.deepEqual(revealed, ['cv']);
  callbacks[2]();
  assert.deepEqual(revealed, ['cv', 'contact']);
});
