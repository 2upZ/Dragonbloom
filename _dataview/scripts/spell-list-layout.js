// Helper para arrays y limpiar nombres
function asArray(x) { if (!x) return []; return Array.isArray(x) ? x : [x]; }
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

// Resolver páginas de hechizos
function resolveSpellPage(name) {
  if (!name) return null;
  return dv.page(name)
    || dv.page("Spells/" + name)
    || dv.page("Hechizos/" + name)
    || dv.pages().where(p => p.file && p.file.name === name).first()
    || null;
}

// Función para crear filas de tabla para un nivel (SOLO FILAS NECESARIAS)
function createTableRows(spells, level) {
  const rows = [];
  
  spells.forEach((spellEntry, index) => {
    const spellName = extractName(spellEntry);
    const page = resolveSpellPage(spellName);
    
    if (!page) {
      if (level === 0) {
        rows.push(`| ${spellName} (no encontrado) |  |  |  |  |`);
      } else {
        rows.push(`| \`INPUT[toggle:SP${level}-${index+1}]\` | ${spellName} (no encontrado) |  |  |  |  |`);
      }
      return;
    }
    
    const castingTime = page.casting_time || "—";
    const range = page.range || "—";
    const duration = page.duration || "—";
    const components = page.components || "—";
    
    if (level === 0) {
      rows.push(`| [[${spellName}]] | ${castingTime} | ${range} | ${duration} | ${components} |`);
    } else {
      rows.push(`| \`INPUT[toggle:SP${level}-${index+1}]\` | [[${spellName}]] | ${castingTime} | ${range} | ${duration} | ${components} |`);
    }
  });
  
  return rows.join("\n");
}

// Función para obtener el nombre del nivel
function getLevelName(level) {
  if (level === 0) return "Cantrips";
  if (level === 1) return "1st Level";
  if (level === 2) return "2nd Level";
  if (level === 3) return "3rd Level";
  return `${level}th Level`;
}

// Función principal
function generateSpellLayout() {
  const cur = dv.current();
  
  // ¡IMPORTANTE! Aquí obtienes el nombre del frontmatter
  // Cambia 'name' por el campo exacto que uses (ej: 'nombre', 'character_name')
  const characterName = (cur.name || 'my_character').replace(/\s+/g, '_').toLowerCase();
  
  let output = "> [!columns|no-t nmg] Spell List\n\n";
  
  // Definir todos los niveles posibles
  const allLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  allLevels.forEach(level => {
    const fieldName = `Lvl ${level} spells`;
    const spells = asArray(cur[fieldName] || []);
    
    // Si no hay hechizos, no mostrar nada para este nivel
    if (spells.length === 0) return;
    
    const levelName = getLevelName(level);
    
    if (level === 0) {
      // Cantrips - solo 5 columnas
      output += `> [!recite|t-w] ${levelName}\n`;
      output += `> | Spell | Casting Time | Range | Duration | Components |\n`;
      output += `> | ----- | ------------- | ------- | --------- | ------------- |\n`;
      
      const rows = createTableRows(spells, level);
      if (rows) {
        rows.split("\n").forEach(row => {
          output += `> ${row}\n`;
        });
      }
      
      output += "\n";
    } else {
      // Niveles 1-9 - 6 columnas (incluyendo Prep.)
      output += `> [!recite|t-w txt-s nmg] ${levelName}\n`;
      output += `> > [!recite|txt-s alt-line] LV${level} Spell Slots\n`;
      output += `> > \`\`\`consumable\n`;
      output += `> > items:\n`;
      output += `> >   - label: "Spell Slots LV${level}"\n`;
      // ¡AQUÍ USAMOS EL NOMBRE DEL PERSONAJE!
      output += `> >     state_key: ${characterName}_SPL${level}\n`;
      output += `> >     reset_on: long-rest\n`;
      output += `> >     uses: 0\n`;
      output += `> > \`\`\`\n>\n`;
      output += `> | Prep. | Spell | Casting Time | Range | Duration | Components |\n`;
      output += `> | ----- | ----- |------------- | ------- | --------- | ------------- |\n`;
      
      const rows = createTableRows(spells, level);
      if (rows) {
        rows.split("\n").forEach(row => {
          output += `> ${row}\n`;
        });
      }
      
      output += "\n";
    }
  });
  
  return output;
}

// Generar y mostrar el layout
const layout = generateSpellLayout();
dv.paragraph(layout);