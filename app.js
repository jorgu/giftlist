const listContainer = document.querySelector('#lists');
const searchInput = document.querySelector('#search');
const searchToolbar = document.querySelector('#search-toolbar');
const emptyState = document.querySelector('#empty-state');

const currentYear = new Date().getFullYear();
document.querySelector('#year-heading').textContent = currentYear;
document.querySelector('#footer-year').textContent = currentYear;
document.title = `Presentlista ${currentYear}`;

const imageExtensions = /\.(jpe?g|png|gif|webp|avif|bmp|svg|tiff?)$/i;

// Läs in och visa senast uppdaterad från data.js
const timestampElement = document.querySelector('#timestamp');

if (timestampElement && typeof timestamp !== 'undefined') {
  timestampElement.textContent = timestamp;
}

function getLink(item) {
  const label = (item.länktext || '').trim();
  if (imageExtensions.test(label)) {
    return { href: `underlag/${encodeURIComponent(label)}`, text: label.replace(imageExtensions, '') };
  }
  if (item.länk && /^https?:\/\//i.test(item.länk.trim())) {
    return { href: item.länk.trim(), text: label || 'Öppna länk' };
  }
  return { href: '', text: label || (item.länk || '').trim() };
}

function cell(className, text) {
  const el = document.createElement('div');
  el.className = className;
  el.textContent = text || '';
  return el;
}

function storeCell(item) {
  const el = document.createElement('div');
  el.className = 'store-cell';
  const info = getLink(item);
  if (!info.href) {
    el.textContent = info.text;
    return el;
  }
  const a = document.createElement('a');
  a.href = info.href;
  a.textContent = info.text;
  if (/^https?:\/\//i.test(info.href)) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  el.append(a);
  return el;
}

function render() {
  const query = searchInput.value.trim().toLocaleLowerCase('sv');
  const filtered = önskelista.filter(item => {
    const info = getLink(item);
    return [item.mottagare, item.paket, info.text, item.länk]
      .join(' ').toLocaleLowerCase('sv').includes(query);
  });

  listContainer.replaceChildren();
  [
    { type:'Julklapp', title:'Julklappslista', cls:'christmas' },
    { type:'Födelsedag', title:'Födelsedagslista', cls:'birthday' }
  ].forEach(section => {
    const items = filtered.filter(item => item.typ === section.type);
    if (!items.length) return;
    const block = document.createElement('section');
    block.className = `list-section ${section.cls}`;
    const heading = document.createElement('div');
    heading.className = 'table-heading';
    heading.append(cell('recipient','Mottagare'), cell('gift',section.title), cell('store-heading','Butik/Länk'));
    block.append(heading);
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'gift-row';
      row.append(cell('recipient',item.mottagare), cell('gift',item.paket), storeCell(item));
      block.append(row);
    });
    listContainer.append(block);
  });
  emptyState.hidden = filtered.length > 0;
}

const recipients = new Set(önskelista.map(x => (x.mottagare || '').trim()).filter(Boolean));
searchToolbar.hidden = recipients.size <= 1;
searchInput.addEventListener('input', render);
render();
