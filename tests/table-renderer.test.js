const test = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { resolve } = require('node:path');
const {
  appendTextCell,
  appendStatusCell,
  appendActionCell,
  appendEmptyRow
} = require('../public/js/table-renderer');

function fakeDocument() {
  return {
    createElement(tagName) {
      return {
        tagName,
        ownerDocument: this,
        children: [],
        dataset: {},
        attributes: {},
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        appendChild(child) {
          this.children.push(child);
          return child;
        }
      };
    }
  };
}

function container(tagName = 'tr') {
  const doc = fakeDocument();
  return doc.createElement(tagName);
}

test('renders untrusted property values as text instead of markup', () => {
  const row = container();
  const payload = '<img src=x onerror="alert(1)">';

  const cell = appendTextCell(row, payload);

  assert.equal(cell.textContent, payload);
  assert.equal(cell.children.length, 0);
  assert.equal(row.children[0], cell);
});

test('normalizes status badges and creates safe action buttons', () => {
  const row = container();
  const statusCell = appendStatusCell(row, '<script>alert(1)</script>');
  const actionCell = appendActionCell(row, 'property-7', [
    { action: 'edit', label: 'Edit' },
    { action: 'delete', label: 'Delete' }
  ]);

  assert.equal(statusCell.children[0].textContent, 'Unpaid');
  assert.equal(statusCell.children[0].className, 'status-badge unpaid');
  assert.deepEqual(
    actionCell.children.map((button) => ({
      type: button.type,
      action: button.dataset.action,
      id: button.dataset.id,
      label: button.textContent
    })),
    [
      { type: 'button', action: 'edit', id: 'property-7', label: 'Edit' },
      { type: 'button', action: 'delete', id: 'property-7', label: 'Delete' }
    ]
  );
});

test('gives repeated action buttons a row-specific accessible name when provided', () => {
  const row = container();
  const actionCell = appendActionCell(row, 3, [
    { action: 'edit', label: 'Edit', accessibleLabel: 'Edit HPT-003 (Mohamed Mooge)' },
    { action: 'delete', label: 'Delete' }
  ]);

  assert.equal(actionCell.children[0].textContent, 'Edit');
  assert.equal(actionCell.children[0].attributes['aria-label'], 'Edit HPT-003 (Mohamed Mooge)');
  assert.equal(actionCell.children[1].attributes['aria-label'], undefined);
});

test('creates an empty-state row with the requested column span', () => {
  const body = container('tbody');

  appendEmptyRow(body, 11, 'No properties found.');

  assert.equal(body.children[0].children[0].colSpan, 11);
  assert.equal(body.children[0].children[0].textContent, 'No properties found.');
});

test('property tables load the renderer and avoid dynamic row innerHTML', async () => {
  for (const page of ['properties', 'reports']) {
    const html = await readFile(resolve(__dirname, `../public/${page}.html`), 'utf8');
    const script = await readFile(resolve(__dirname, `../public/js/${page}.js`), 'utf8');
    assert.ok(html.indexOf('js/table-renderer.js') < html.indexOf(`js/${page}.js`));
    assert.doesNotMatch(script, /innerHTML/);
  }
});
