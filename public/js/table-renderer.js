(function initializeTableRenderer(root, factory) {
  const renderer = factory();
  if (typeof module === 'object' && module.exports) module.exports = renderer;
  if (root) root.HargeisaTable = renderer;
})(typeof window !== 'undefined' ? window : null, function createTableRenderer() {
  function createElement(container, tagName) {
    const doc = container.ownerDocument || globalThis.document;
    return doc.createElement(tagName);
  }

  function appendTextCell(row, value) {
    const cell = createElement(row, 'td');
    cell.textContent = value == null ? '' : String(value);
    row.appendChild(cell);
    return cell;
  }

  function appendStatusCell(row, status) {
    const safeStatus = status === 'Paid' ? 'Paid' : 'Unpaid';
    const cell = createElement(row, 'td');
    const badge = createElement(row, 'span');
    badge.className = `status-badge ${safeStatus.toLowerCase()}`;
    badge.textContent = safeStatus;
    cell.appendChild(badge);
    row.appendChild(cell);
    return cell;
  }

  function appendActionCell(row, recordId, actions) {
    const cell = createElement(row, 'td');
    actions.forEach(({ action, label, accessibleLabel }) => {
      const button = createElement(row, 'button');
      button.type = 'button';
      button.className = 'action-btn';
      button.dataset.action = action;
      button.dataset.id = String(recordId);
      button.textContent = label;
      // Repeated "Edit"/"Delete" buttons need a row-specific name for screen readers.
      if (accessibleLabel) button.setAttribute('aria-label', String(accessibleLabel));
      cell.appendChild(button);
    });
    row.appendChild(cell);
    return cell;
  }

  function appendEmptyRow(tableBody, columnCount, message) {
    const row = createElement(tableBody, 'tr');
    const cell = createElement(tableBody, 'td');
    cell.colSpan = columnCount;
    cell.textContent = message;
    row.appendChild(cell);
    tableBody.appendChild(row);
  }

  return Object.freeze({ appendTextCell, appendStatusCell, appendActionCell, appendEmptyRow });
});
