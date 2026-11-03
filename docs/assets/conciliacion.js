// Mesa de conciliación — demo interactiva con datos de ejemplo.
// Todo el estado vive en memoria: recargar la página vuelve al estado inicial.
(function () {
  'use strict';

  // Movimientos de ejemplo (muestra de 10 de los 118 del mes)
  var BASE = [
    { id: 'r1', status: 'conciliado', b: { f: '01-10', g: 'TRANSF 15.678.234-K CASA 58 GC OCT', m: '+$65.000' }, l: { f: '01-10', g: 'Pago gasto común · Casa 58', m: '+$65.000' }, razon: 'Mismo monto y fecha, y la glosa del banco indica la Casa 58.', doc: { t: 'Comprobante de transferencia', meta: '01-10-2026 · Casa 58', amt: '$65.000' }, by: 'el sistema (automático) · 01-11 09:15' },
    { id: 'r2', status: 'conciliado', b: { f: '03-10', g: 'TRANSF PAGO GC CASA 21 Y 22', m: '+$130.000' }, l: { f: '03-10', g: 'Pago gasto común · Casas 21 y 22 (2 registros)', m: '+$130.000' }, razon: 'Un solo abono del banco cubre dos registros del libro (1 a 2).', doc: { t: 'Comprobante de transferencia', meta: '03-10-2026 · Casas 21 y 22', amt: '$130.000' }, by: 'Administración · 01-11 09:21' },
    { id: 'r3', status: 'conciliado', b: { f: '05-10', g: 'PAC ELECTRICIDAD', m: '−$412.180' }, l: { f: '05-10', g: 'Luz áreas comunes · boleta 88412', m: '−$412.180' }, razon: 'Mismo monto y fecha. Es un pago automático (PAC).', doc: { t: 'Boleta de electricidad N° 88412', meta: 'Áreas comunes · emitida el 28-09-2026', amt: '$412.180' }, by: 'el sistema (automático) · 01-11 09:15' },
    { id: 'r4', status: 'sugerido', score: '92%', b: { f: '08-10', g: 'TRANSF DE M SOTO', m: '+$65.000' }, l: { f: '08-10', g: 'Pago gasto común · Casa 34', m: '+$65.000' }, razon: 'Mismo monto y fecha. «M. Soto» es el titular registrado de la Casa 34.', doc: { t: 'Comprobante de transferencia', meta: '08-10-2026 · M. Soto', amt: '$65.000' } },
    { id: 'r5', status: 'sugerido', score: '88%', b: { f: '10-10', g: 'TRANSF A SERV PISCINAS SPA', m: '−$180.000' }, l: { f: '09-10', g: 'Mantención piscina · factura 1182', m: '−$180.000' }, razon: 'Mismo monto, fecha a 1 día y el proveedor del libro coincide con la glosa del banco.', doc: { t: 'Factura electrónica N° 1182', meta: 'Servicios de Piscinas SpA · 09-10-2026', amt: '$180.000' } },
    { id: 'r6', status: 'conciliado', b: { f: '30-10', g: 'REMUNERACIONES OCT', m: '−$2.310.000' }, l: { f: '30-10', g: 'Remuneraciones octubre · 3 trabajadores', m: '−$2.310.000' }, razon: 'Mismo monto y fecha.', doc: { t: 'Liquidaciones de sueldo (3)', meta: 'Octubre 2026 · incluye cotizaciones', amt: '$2.310.000' }, by: 'el sistema (automático) · 01-11 09:15' },
    { id: 'r7', status: 'transito', b: null, l: { f: '28-10', g: 'Cheque N° 00318 · Jardinería', m: '−$420.000' }, razon: 'Cheque girado el 28-10 que el proveedor aún no cobra.', doc: { t: 'Factura N° 5531 · Jardinería', meta: 'Pagada con cheque N° 00318', amt: '$420.000' }, comments: true },
    { id: 'r8', status: 'transito', b: null, l: { f: '29-10', g: 'Cheque N° 00319 · Mantención portón', m: '−$320.000' }, razon: 'Cheque girado el 29-10 que el proveedor aún no cobra.', doc: { t: 'Boleta de honorarios N° 214', meta: 'Mantención del portón eléctrico', amt: '$320.000' } },
    { id: 'r9', status: 'transito', b: null, l: { f: '31-10', g: 'Pago gasto común · Casa 12', m: '+$65.000' }, razon: 'Depositado el 31-10. El banco lo abonó el 02-11, así que aparece en la cartola de noviembre.', doc: { t: 'Comprobante de depósito', meta: '31-10-2026 · Casa 12', amt: '$65.000' } },
    { id: 'r10', status: 'pendiente', b: { f: '31-10', g: 'COMISION MANTENCION CTA', m: '−$8.330' }, l: null, razon: 'Cargo del banco que todavía no está registrado en el libro.', doc: null }
  ];

  var LABELS = { conciliado: 'Conciliado', sugerido: 'Sugerido', transito: 'En tránsito', pendiente: 'Por conciliar' };
  var FILTERS = [
    { key: 'todos', label: 'Todos' },
    { key: 'sugerido', label: 'Sugeridos' },
    { key: 'pendiente', label: 'Por conciliar' },
    { key: 'transito', label: 'En tránsito' },
    { key: 'conciliado', label: 'Conciliados' }
  ];
  // Movimientos del banco que parten sin conciliar (115 de 118 ya conciliados)
  var BANK_PENDING = ['r4', 'r5', 'r10'];
  var BANK_TOTAL = 118;
  var BANK_BASE_CONC = 115;

  var state = { filter: 'todos', selected: 'r4', ov: {}, q: '' };

  var ICON_ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>';
  var ICON_SPARK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v4"></path><path d="M12 17v4"></path><path d="M3 12h4"></path><path d="M17 12h4"></path></svg>';
  var ICON_INFO = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#475467" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none; margin-top: 1px"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5"></path><path d="M12 8h.01"></path></svg>';
  var ICON_CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>';

  function rowsWithState() {
    return BASE.map(function (r) {
      var status = state.ov[r.id] || r.status;
      var l = r.l;
      if (r.id === 'r10' && status === 'conciliado') {
        l = { f: '31-10', g: 'Comisión mantención de cuenta (registrada)', m: '−$8.330' };
      }
      return {
        id: r.id, base: r.status, status: status, b: r.b, l: l, razon: r.razon, doc: r.doc,
        by: r.by || '', score: r.score, comments: !!r.comments,
        label: status === 'sugerido' ? 'Sugerido · ' + r.score : LABELS[status],
        changed: status !== r.status
      };
    });
  }

  function chip(r) {
    return '<span class="chip chip-' + r.status + '"><span class="dot"></span>' + r.label + '</span>';
  }

  function side(x, mono, emptyText) {
    if (!x) return '<span class="ghost">' + emptyText + '</span>';
    return '<span class="side"><span class="f">' + x.f + '</span>' +
      '<span class="g' + (mono ? ' num' : '') + '" style="font-size: ' + (mono ? '12.5px; color: #344054' : '14px; color: #101828') + '">' + x.g + '</span>' +
      '<span class="m num">' + x.m + '</span></span>';
  }

  function matchesQuery(r) {
    if (!state.q) return true;
    var hay = [r.b && r.b.g, r.b && r.b.m, r.l && r.l.g, r.l && r.l.m].join(' ').toLowerCase();
    return hay.indexOf(state.q) >= 0;
  }

  function render() {
    var rows = rowsWithState();
    var count = function (s) { return rows.filter(function (x) { return x.status === s; }).length; };
    var sugCount = count('sugerido');
    var pending = sugCount + count('pendiente');
    var conc = BANK_BASE_CONC + rows.filter(function (x) { return BANK_PENDING.indexOf(x.id) >= 0 && x.status === 'conciliado'; }).length;
    var pct = Math.floor((conc / BANK_TOTAL) * 100);

    // Avance
    document.getElementById('pct').textContent = pct + '%';
    document.getElementById('conc').textContent = conc;
    var bar = document.getElementById('bar');
    bar.style.width = pct + '%';
    bar.style.background = pct === 100 ? '#0E6E5C' : '#4F46E5';

    // Acciones principales
    var actions = '';
    if (sugCount > 0) {
      actions += '<button type="button" class="btn-primary" data-action="applyAll">' + ICON_SPARK + '<span>Aceptar sugerencias (<span class="num">' + sugCount + '</span>)</span></button>';
    }
    if (pending === 0) {
      actions += '<a href="resumen.html" class="btn-primary btn-dark">Enviar a revisión del comité' + ICON_ARROW + '</a>';
    } else {
      actions += '<button type="button" class="btn-disabled" disabled>Faltan <span class="num">' + pending + '</span> por resolver</button>';
    }
    document.getElementById('actions').innerHTML = actions;

    // Filtros
    document.getElementById('filters').innerHTML = FILTERS.map(function (f) {
      var n = f.key === 'todos' ? rows.length : count(f.key);
      var on = state.filter === f.key;
      return '<button type="button" class="filter' + (on ? ' on' : '') + '" data-action="filter" data-key="' + f.key + '" aria-pressed="' + on + '">' +
        f.label + ' <span class="count num">' + n + '</span></button>';
    }).join('');

    // Filas
    var shown = rows.filter(function (x) { return (state.filter === 'todos' || x.status === state.filter) && matchesQuery(x); });
    var rowsEl = document.getElementById('rows');
    if (shown.length === 0) {
      rowsEl.innerHTML = '<div style="padding: 48px 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center">' +
        '<div style="width: 44px; height: 44px; border-radius: 999px; background: #E3F4EF; color: #0E6E5C; display: flex; align-items: center; justify-content: center">' + ICON_CHECK + '</div>' +
        '<span style="font-size: 15px; font-weight: 600">' + (state.q ? 'Sin resultados para la búsqueda' : 'Nada pendiente en este filtro') + '</span>' +
        '<span style="font-size: 13px; color: #667085">' + (state.q ? 'Prueba con otra glosa, casa o monto.' : 'Todo lo que había aquí ya quedó resuelto.') + '</span></div>';
    } else {
      rowsEl.innerHTML = shown.map(function (r) {
        var sel = r.id === state.selected;
        return '<button type="button" class="mov-row mov-grid' + (sel ? ' sel' : '') + '" data-action="select" data-id="' + r.id + '" aria-pressed="' + sel + '">' +
          side(r.b, true, 'Sin movimiento en la cartola') +
          '<span style="display: flex; justify-content: center">' + chip(r) + '</span>' +
          side(r.l, false, 'Sin registro en el libro') +
          '</button>';
      }).join('');
    }

    // Detalle
    var s = rows.filter(function (x) { return x.id === state.selected; })[0] || rows[0];
    var title = s.l ? s.l.g : s.b.g;
    var whyTitle = s.status === 'transito' ? 'Por qué está abierta' : (s.status === 'pendiente' ? 'Qué falta' : 'Por qué coinciden');
    var card = function (label, x, emptyText, mono) {
      var inner = x
        ? '<span class="num" style="font-size: 17px; font-weight: 600">' + x.m + '</span>' +
          '<span style="font-size: 12px; color: #667085">' + x.f + '-2026</span>' +
          '<span' + (mono ? ' class="num"' : '') + ' style="font-size: ' + (mono ? '12px' : '13px') + '; color: #344054; word-break: break-word">' + x.g + '</span>'
        : '<span style="font-size: 13px; color: #667085; line-height: 1.45">' + emptyText + '</span>';
      return '<div style="border: 1px solid #EAECF0; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 6px; min-width: 0">' +
        '<span style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #475467">' + label + '</span>' + inner + '</div>';
    };

    var d = '';
    d += '<div style="display: flex; flex-direction: column; gap: 10px"><span style="align-self: flex-start">' + chip(s) + '</span>' +
      '<h2 style="margin: 0; font-size: 19px; font-weight: 600; letter-spacing: -0.015em; line-height: 1.3">' + title + '</h2></div>';
    d += '<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">' +
      card('Banco', s.b, 'Todavía no aparece en la cartola', true) +
      card('Libro', s.l, 'No está registrado en el libro', false) + '</div>';
    d += '<div style="display: flex; gap: 10px; padding: 14px; border-radius: 12px; background: #F6F7F9">' + ICON_INFO +
      '<div style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 12px; font-weight: 600; color: #475467">' + whyTitle + '</span>' +
      '<span style="font-size: 14px; line-height: 1.5; color: #344054">' + s.razon + '</span></div></div>';
    if (s.status === 'transito') {
      d += '<p style="margin: 0; font-size: 13px; line-height: 1.55; color: #475467">No es un error: ya está en el libro y va a aparecer en la cartola cuando el banco la procese. Queda abierta y pasa al período siguiente.</p>';
    }
    if (s.doc) {
      d += '<div style="display: flex; flex-direction: column; gap: 8px"><span style="font-size: 12px; font-weight: 600; color: #475467">Comprobante</span>' +
        '<div style="border-radius: 14px; background: #F2F4F7; padding: 16px; display: flex; gap: 16px; align-items: center">' +
        '<div aria-hidden="true" style="width: 92px; height: 116px; flex: none; border-radius: 6px; background: #FFFFFF; border: 1px solid #E4E7EC; padding: 10px; box-sizing: border-box; display: flex; flex-direction: column; gap: 6px">' +
        '<div style="height: 6px; width: 60%; border-radius: 3px; background: #101828"></div><div style="height: 4px; width: 85%; border-radius: 2px; background: #D0D5DD"></div><div style="height: 4px; width: 70%; border-radius: 2px; background: #D0D5DD"></div>' +
        '<div style="height: 4px; width: 80%; border-radius: 2px; background: #EAECF0; margin-top: 8px"></div><div style="height: 4px; width: 65%; border-radius: 2px; background: #EAECF0"></div><div style="height: 4px; width: 75%; border-radius: 2px; background: #EAECF0"></div>' +
        '<div style="height: 6px; width: 45%; border-radius: 3px; background: #4F46E5; margin-top: auto; align-self: flex-end"></div></div>' +
        '<div style="display: flex; flex-direction: column; gap: 4px; min-width: 0"><span style="font-size: 14px; font-weight: 600; line-height: 1.35">' + s.doc.t + '</span>' +
        '<span style="font-size: 13px; color: #667085; line-height: 1.4">' + s.doc.meta + '</span>' +
        '<span class="num" style="font-size: 15px; font-weight: 600; margin-top: 4px">' + s.doc.amt + '</span>' +
        '<span style="font-size: 13px; font-weight: 500; margin-top: 4px; color: #667085">Archivo de ejemplo</span></div></div></div>';
    } else {
      d += '<div style="padding: 14px; border-radius: 12px; border: 1px dashed #D0D5DD; font-size: 13px; color: #667085">Cargo automático del banco: el respaldo es la propia cartola.</div>';
    }
    if (s.status === 'sugerido') {
      d += '<div style="display: flex; gap: 10px"><button type="button" class="btn-primary" style="flex: 1" data-action="accept" data-id="' + s.id + '">Aceptar coincidencia</button>' +
        '<button type="button" class="btn-secondary" data-action="dismiss" data-id="' + s.id + '">Descartar</button></div>';
    }
    if (s.id === 'r10' && s.status === 'pendiente') {
      d += '<button type="button" class="btn-primary" data-action="accept" data-id="r10">Registrar en el libro y conciliar</button>';
    }
    if (s.changed) {
      var note = s.status === 'conciliado' ? (s.id === 'r10' ? 'Registrado en el libro recién.' : 'Aceptaste esta coincidencia.') : 'Descartaste la sugerencia.';
      d += '<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 12px; background: #F6F7F9">' +
        '<span style="font-size: 13px; color: #475467">' + note + '</span>' +
        '<button type="button" class="btn-secondary" style="height: 40px; font-size: 13px" data-action="undo" data-id="' + s.id + '">Deshacer</button></div>';
    } else if (s.status === 'conciliado') {
      d += '<span style="font-size: 13px; color: #667085">Conciliado por ' + s.by + '</span>';
    }
    document.getElementById('detail').innerHTML = d;

    document.getElementById('comments').innerHTML = s.comments
      ? '<div style="display: flex; gap: 10px"><div style="width: 28px; height: 28px; flex: none; border-radius: 999px; background: #F2F4F7; color: #344054; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600">CO</div>' +
        '<div style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; color: #667085"><span style="font-weight: 600; color: #101828">Comité</span> · 02-11 20:31</span>' +
        '<span style="font-size: 14px; line-height: 1.5; color: #344054">¿Cuándo se cobra este cheque? Aparece en el libro pero no en la cartola.</span></div></div>' +
        '<div style="display: flex; gap: 10px"><div style="width: 28px; height: 28px; flex: none; border-radius: 999px; background: #EEF0FF; color: #3730A3; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600">AD</div>' +
        '<div style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; color: #667085"><span style="font-weight: 600; color: #101828">Administración</span> · 03-11 09:05</span>' +
        '<span style="font-size: 14px; line-height: 1.5; color: #344054">El proveedor lo cobra la primera semana de noviembre. Adjunté la factura.</span></div></div>'
      : '<span style="font-size: 13px; color: #667085">Sin comentarios todavía.</span>';
  }

  function setStatus(id, status) {
    state.ov[id] = status;
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t) return;
    var id = t.getAttribute('data-id');
    switch (t.getAttribute('data-action')) {
      case 'filter': state.filter = t.getAttribute('data-key'); break;
      case 'select': state.selected = id; break;
      case 'accept': setStatus(id, 'conciliado'); break;
      case 'dismiss': setStatus(id, 'pendiente'); break;
      case 'undo': delete state.ov[id]; break;
      case 'applyAll':
        rowsWithState().forEach(function (x) { if (x.status === 'sugerido') setStatus(x.id, 'conciliado'); });
        break;
      default: return;
    }
    render();
  });

  document.getElementById('search').addEventListener('input', function (e) {
    state.q = e.target.value.trim().toLowerCase();
    render();
  });

  render();
})();
