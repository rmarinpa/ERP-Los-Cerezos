# ERP Condominio Los Cerezos

Sistema de administración para el Condominio Los Cerezos. El primer módulo es el **Conciliador**: compara la cartola del banco con el libro de ingresos y egresos de la administración, para que cada movimiento quede respaldado y a la vista de la comunidad.

## Demo de diseño (rama `design-demo`)

Prototipo navegable con **datos de ejemplo** (no son las cuentas reales del condominio):

👉 https://rmarinpa.github.io/ERP-Los-Cerezos/

| Pantalla | Para quién | Archivo |
|---|---|---|
| Vista vecino (móvil) | Vecinos | `docs/vecino.html` |
| Resumen del período | Administración y comité | `docs/resumen.html` |
| Mesa de conciliación (interactiva) | Administración y comité | `docs/conciliacion.html` |
| Importar cartola | Administración | `docs/importar.html` |

### Estructura

```
docs/            Sitio estático publicado en GitHub Pages
  assets/        Estilos compartidos y lógica de la mesa de conciliación
design/canvas/   Fuentes del diseño (artboards .dc.html del canvas de Claude)
```

El sitio no tiene dependencias ni build: son HTML, CSS y JS planos. Para verlo localmente basta con abrir `docs/index.html` o servir la carpeta:

```bash
python3 -m http.server -d docs 8080
```

## Alcance del módulo Conciliador

- Importar cartola bancaria y libro de la administración (Excel/CSV) con mapeo de columnas y validaciones.
- Emparejamiento automático con sugerencias explicadas, y manual (1:1, 1:N, N:1).
- Partidas en tránsito: cheques girados no cobrados, depósitos en tránsito, cargos bancarios sin registrar.
- Cierre mensual bloqueado con informe de conciliación y bitácora de cambios.
- Vista de solo lectura para vecinos con comprobantes.

Fuera de alcance por ahora: cálculo y cobro de gasto común, remuneraciones, reservas y comunicados.
