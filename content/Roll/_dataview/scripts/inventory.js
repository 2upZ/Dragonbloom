// _dataview/scripts/inventory.js - VERSIÓN CON MUNICIÓN SEPARADA

// 1. PROTECCIÓN INICIAL
if (typeof dv === 'undefined' || !dv.current) {
    dv.paragraph("❌ Error: Dataview no está disponible");
    return;
}

try {
    const cur = dv.current();
    if (!cur) {
        dv.paragraph("❌ No se puede acceder a los datos de la nota actual");
        return;
    }

    // Helper functions
    function asArray(x) { 
        if (!x) return []; 
        return Array.isArray(x) ? x : [x]; 
    }
    
    const cleanName = s => typeof s === "string" ? s.replace(/^\s*\[\[|\]\]\s*$/g,"").trim() : s;
    
    function extractName(entry) {
        if (!entry) return null;
        if (typeof entry === "object") {
            if (entry.item) return cleanName(entry.item);
            if (entry.path) return cleanName(entry.path.replace(/\.md$/,""));
        }
        if (typeof entry === "string") return cleanName(entry);
        return String(entry);
    }

    function resolvePage(name) {
        if (!name) return null;
        return dv.page(name)
            || dv.page("Equipment/Weapons/" + name)
            || dv.page("Equipment/Armor/" + name)
            || dv.page("Equipment/" + name)
            || dv.pages().where(p => p.file && p.file.name === name).first()
            || null;
    }

    function parseWeight(w) {
        if (!w) return 0;
        if (typeof w === "number") return w;
        const match = w.toString().match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }

    // 2. OBTENER DATOS - ¡AHORA INCLUYENDO AMMUNITION!
    const equipmentList = asArray(cur.equipment || []);
    const equippedList = new Set(asArray(cur.equipped || []).map(cleanName));
    const backpackList = asArray(cur.backpack || []);
    const ammunitionList = asArray(cur.ammunition || []); // <-- NUEVO

    // Cantidades desde frontmatter
    let backpackQuantities = asArray(cur.backpack_quantities || []);
    if (backpackQuantities.length !== backpackList.length) {
        backpackQuantities = new Array(backpackList.length).fill(1);
    }
    
    // Cantidades para munición
    let ammoQuantities = asArray(cur.ammunition_quantities || []); // <-- NUEVO
    if (ammoQuantities.length !== ammunitionList.length) {
        ammoQuantities = new Array(ammunitionList.length).fill(1);
    }

    // Tabla de equipado
    const equippedRows = [];
    const allNamesSet = new Set([...equipmentList, ...backpackList, ...ammunitionList, ...Array.from(equippedList)]);
    
    allNamesSet.forEach(nameRaw => {
        const name = extractName(nameRaw);
        if (equippedList.has(name)) {
            const page = resolvePage(name);
            if (!page) {
                equippedRows.push([name, "No encontrada", "—", "—", "—"]);
                return;
            }
            const type = page.type ? String(page.type).toLowerCase() : (page.armor ? "armor" : (page.damage ? "weapon" : "item"));
            let detalles = "—";
            if (type === "weapon") {
                detalles = (page.damage ?? "—") + (page.damage_type ? " " + page.damage_type : "") + (page.range ? ` (alc ${page.range})` : "");
            } else if (type === "armor") {
                detalles = page.ac_base ? String(page.ac_base) : page.ac ? `AC ${page.ac}` : "—";
            }
            const weight = page.weight ?? "—";
            const props = page.properties ? (Array.isArray(page.properties) ? page.properties.join(", ") : page.properties) : "—";
            equippedRows.push([page.file.link, type, detalles, weight, props]);
        }
    });

    // Procesar MOCHILA normal
    const backpackItems = [];
    backpackList.forEach((item, index) => {
        const name = extractName(item);
        const page = resolvePage(name);
        const quantity = backpackQuantities[index] || 1;

        if (!page) {
            backpackItems.push({
                name,
                page: null,
                quantity,
                index,
                isAmmunition: false,
                type: "desconocido",
                detalles: "—",
                weight: "—",
                props: "—",
                source: "backpack" // Identificar de dónde viene
            });
            return;
        }

        const itemData = {
            name,
            page,
            quantity,
            index,
            isAmmunition: false, // En backpack, no es munición
            type: page.type ? String(page.type).toLowerCase() : (page.armor ? "armor" : (page.damage ? "weapon" : "item")),
            detalles: "—",
            weight: page.weight ?? "—",
            props: page.properties ? (Array.isArray(page.properties) ? page.properties.join(", ") : page.properties) : "—",
            source: "backpack"
        };

        if (itemData.type === "weapon") {
            itemData.detalles = (page.damage ?? "—") + (page.damage_type ? " " + page.damage_type : "") + (page.range ? ` (alc ${page.range})` : "");
        } else if (itemData.type === "armor") {
            itemData.detalles = page.ac_base ? String(page.ac_base) : page.ac ? `AC ${page.ac}` : "—";
        }

        backpackItems.push(itemData);
    });

    // Procesar MUNICIÓN separada - ¡NUEVA SECCIÓN!
    const ammoItems = [];
    ammunitionList.forEach((item, index) => {
        const name = extractName(item);
        const page = resolvePage(name);
        const quantity = ammoQuantities[index] || 1;

        if (!page) {
            ammoItems.push({
                name,
                page: null,
                quantity,
                index,
                isAmmunition: true,
                type: "ammunition",
                detalles: "—",
                weight: "—",
                props: "—",
                source: "ammunition" // Identificar que viene de ammunition
            });
            return;
        }

        // Forzar tipo "ammunition" aunque la página no lo tenga
        const isAmmo = page.ammunition || (page.type && page.type.toLowerCase() === "ammunition");
        const itemData = {
            name,
            page,
            quantity,
            index,
            isAmmunition: true, // Siempre true para ammunition list
            type: isAmmo ? "ammunition" : (page.type ? String(page.type).toLowerCase() : "ammunition"),
            detalles: page.description || page.notes || "—",
            weight: page.weight ?? "—",
            props: page.properties ? (Array.isArray(page.properties) ? page.properties.join(", ") : page.properties) : "—",
            source: "ammunition"
        };

        ammoItems.push(itemData);
    });

    // Calcular peso total (ahora incluye munición)
    let totalWeightAll = 0;
    equippedRows.forEach(row => totalWeightAll += parseWeight(row[3]));
    
    // Peso de la mochila
    backpackItems.forEach(item => {
        if (item.page) {
            totalWeightAll += parseWeight(item.weight) * item.quantity;
        }
    });
    
    // Peso de la munición
    ammoItems.forEach(item => {
        if (item.page) {
            totalWeightAll += parseWeight(item.weight) * item.quantity;
        }
    });

    // Mostrar equipado
    dv.header(2, "⚔️ Equipado");
    if (equippedRows.length) {
        dv.table(["Objeto","Tipo","Detalles","Peso","Propiedades"], equippedRows);
    } else {
        dv.paragraph("_No hay objetos equipados._");
    }

    // Función para mostrar tabla (actualizada para diferenciar origen)
    function showInventoryTable(title, items, sourceType) {
        if (!items.length) return;
        
        dv.header(2, title);
        
        const tableHTML = `
<div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
    <thead>
      <tr>
        <th style="border: 1px solid var(--background-modifier-border); padding: 6px; text-align: left;">Objeto</th>
        <th style="border: 1px solid var(--background-modifier-border); padding: 6px; text-align: left;">Tipo</th>
        <th style="border: 1px solid var(--background-modifier-border); padding: 6px; text-align: left;">Detalles</th>
        <th style="border: 1px solid var(--background-modifier-border); padding: 6px; text-align: left;">Peso</th>
        <th style="border: 1px solid var(--background-modifier-border); padding: 6px; text-align: left;">Propiedades</th>
        <th style="border: 1px solid var(--background-modifier-border); padding: 6px; text-align: left;">Cantidad</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
      <tr>
        <td style="border: 1px solid var(--background-modifier-border); padding: 6px;">
          ${item.page ? `<a href="${item.page.file.path}" data-href="${item.page.file.path}" class="internal-link">${item.page.file.name}</a>` : item.name}
        </td>
        <td style="border: 1px solid var(--background-modifier-border); padding: 6px;">${item.type || "—"}</td>
        <td style="border: 1px solid var(--background-modifier-border); padding: 6px;">${item.detalles}</td>
        <td style="border: 1px solid var(--background-modifier-border); padding: 6px;">${item.weight}</td>
        <td style="border: 1px solid var(--background-modifier-border); padding: 6px;">${item.props}</td>
        <td style="border: 1px solid var(--background-modifier-border); padding: 6px;">
          <input type="number" 
                 data-index="${item.index}" 
                 data-source="${sourceType}" 
                 value="${item.quantity}" 
                 min="0" 
                 step="1" 
                 class="inventory-quantity-input" 
                 style="width: 70px; padding: 4px; text-align: center; border-radius: 4px; border: 1px solid var(--background-modifier-border);">
        </td>
      </tr>
      `).join('')}
    </tbody>
  </table>
</div>
        `;
        
        dv.el('div', tableHTML);
    }

    // Mostrar tablas
    showInventoryTable("🎒 Mochila", backpackItems, "backpack");
    showInventoryTable("🏹 Munición", ammoItems, "ammunition");

    // Mostrar peso total
    dv.paragraph(`**Peso total:** ${totalWeightAll.toFixed(1)} lb.`);

    // Script para manejar cambios (actualizado para ambas listas)
    dv.el('script', `
setTimeout(() => {
    const inputs = document.querySelectorAll('.inventory-quantity-input');
    
    function updateQuantity(index, value, source) {
        const file = app.workspace.getActiveFile();
        if (!file) return;
        
        app.fileManager.processFrontMatter(file, (fm) => {
            if (source === "backpack") {
                if (!fm.backpack_quantities) fm.backpack_quantities = [];
                while (fm.backpack_quantities.length <= index) {
                    fm.backpack_quantities.push(1);
                }
                fm.backpack_quantities[index] = parseInt(value) || 1;
            } else if (source === "ammunition") {
                if (!fm.ammunition_quantities) fm.ammunition_quantities = [];
                while (fm.ammunition_quantities.length <= index) {
                    fm.ammunition_quantities.push(1);
                }
                fm.ammunition_quantities[index] = parseInt(value) || 1;
            }
        }).then(() => {
            new Notice('✓ Cantidad actualizada (' + source + ')');
        }).catch(err => {
            console.error('Error:', err);
            new Notice('✗ Error al guardar');
        });
    }
    
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.dataset.index);
            const source = this.dataset.source;
            const value = this.value;
            updateQuantity(index, value, source);
        });
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const index = parseInt(this.dataset.index);
                const source = this.dataset.source;
                const value = this.value;
                updateQuantity(index, value, source);
                this.blur();
            }
        });
    });
}, 100);
    `);

} catch (error) {
    dv.header(2, "❌ Error en el inventario");
    dv.paragraph(`**Error:** ${error.message}`);
    dv.paragraph(`**Stack:** ${error.stack || 'No disponible'}`);
    console.error("Inventory script error:", error);
}