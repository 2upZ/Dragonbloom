// _dataview/scripts/encumbrance.js
const strength = dv.current().strength ?? 10;
const maxCarry = 15 * strength;
const encumbered = 5 * strength;
const heavilyEncumbered = 10 * strength;

// Calcular peso
const allItems = [...(dv.current().equipment ?? []), ...(dv.current().backpack ?? []), ...(dv.current().equipped ?? [])];
let totalWeight = 0;

allItems.forEach(item => {
    let weight = 0;
    if (typeof item === "object" && item.weight) weight = item.weight;
    const page = dv.page(typeof item === "string" ? item : item.item);
    if (page && page.weight) weight = page.weight;
    if (typeof weight === "string") {
        const match = weight.match(/[\d.]+/);
        weight = match ? parseFloat(match[0]) : 0;
    }
    totalWeight += weight;
});

// Determinar estado y símbolo
let estado = "";
let simbolo = "";
let color = "#4caf50"; // verde por defecto
let mostrarEstado = false;

if (totalWeight > heavilyEncumbered) {
    estado = "Muy cargado";
    simbolo = "⚠️"; // o "⚡", "🔥", "💀"
    color = "#f44336"; // rojo
    mostrarEstado = true;
} else if (totalWeight > encumbered) {
    estado = "Cargado";
    simbolo = "⚠️";  // Advertencia
    color = "#ff9800"; // naranja
    mostrarEstado = true;
}

const porcentaje = Math.min(totalWeight / maxCarry * 100, 100);

// Crear la barra con símbolo
dv.el('div', `
<div style="border: 1px solid #333; width: 100%; max-width: 300px; height: 25px; border-radius: 5px; overflow: hidden; background: #ccc; margin-bottom: 8px; position: relative;">
  <!-- Barra de progreso coloreada -->
  <div style="width: ${porcentaje}%; height: 100%; background: ${color};"></div>
  
  <!-- Contenido superpuesto -->
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 10px; box-sizing: border-box;">
    <!-- Peso a la izquierda -->
    <span style="color: white; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.7); font-size: 0.9em;">
      ${totalWeight.toFixed(1)} / ${maxCarry} lb.
    </span>
    
    <!-- Símbolo a la derecha (solo si hay estado) -->
    ${mostrarEstado ? `
    <span style="color: white; font-weight: bold; font-size: 1.1em; text-shadow: 1px 1px 2px rgba(0,0,0,0.9);">
      ${simbolo}
    </span>
    ` : ''}
  </div>
</div>
`);

// Mostrar estado solo si está cargado o muy cargado
//if (mostrarEstado) {
//    dv.paragraph(`<small><em>${estado}</em></small>`);
//}