// Templates/Scripts/weightBar.js
module.exports = {
  showWeightBar: function(character) {

    const strength = character.strength ?? 10;
    const maxCarry = 15 * strength;
    const encumbered = 5 * strength;
    const heavilyEncumbered = 10 * strength;

    const allItems = [
      ...(character.equipment ?? []),
      ...(character.backpack ?? []),
      ...(character.equipped ?? [])
    ];

    let totalWeight = 0;
    allItems.forEach(item => {
      let weight = 0;
      if (typeof item === "object" && item.weight) weight = item.weight;

      const pageName = typeof item === "string" ? item : item.item;
      // Buscar la nota por nombre
      const page = tp.app.plugins.plugins["templater-obsidian"].tp.helpers.dv.page(pageName);
      if (page && page.weight) weight = page.weight;

      if (typeof weight === "string") {
        const match = weight.match(/[\d.]+/);
        weight = match ? parseFloat(match[0]) : 0;
      }
      totalWeight += weight;
    });

    let color = "#4caf50";
    if (totalWeight > heavilyEncumbered) color = "#f44336";
    else if (totalWeight > encumbered) color = "#ff9800";

    let html = `
<div style="border: 1px solid #333; width: 300px; height: 25px; border-radius: 5px; overflow: hidden; background: #ccc;">
  <div style="width: ${Math.min(totalWeight / maxCarry * 100, 100)}%; height: 100%; background: ${color}; text-align: center; color: white; line-height: 25px; font-weight: bold;">
    ${totalWeight} / ${maxCarry} lb.
  </div>
</div>
`;

    let estado = "Carga ligera";
    if (totalWeight > heavilyEncumbered) estado = "Muy cargado";
    else if (totalWeight > encumbered) estado = "Cargado";

    html += `<p><strong>Estado:</strong> ${estado}</p>`;
    return html;
  }
};
