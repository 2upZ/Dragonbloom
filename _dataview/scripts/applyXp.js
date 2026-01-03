// _dataview/scripts/applyXp.js
(async () => {
  try {
    const archivoActual = app.workspace.getActiveFile();
    const cache = app.metadataCache.getFileCache(archivoActual);
    
    if (!cache?.frontmatter) {
      new Notice("❌ No se encontró el frontmatter.");
      return;
    }
    const fm = cache.frontmatter;
    
    // 1. LEER LA GANANCIA DE XP DEL FRONTMATTER
    const xpGain = Number(fm.xp_gain) || 0;
    
    if (xpGain <= 0) {
      new Notice("ℹ️ Introduce una cantidad positiva en 'xp_gain'.");
      return;
    }
    
    // 2. VALORES ACTUALES
    let xpTotal = Number(fm.xp_total) || 0;
    let xpNeeded = Number(fm.xp_needed) || 1000;
    let level = Number(fm.level) || 1;
    
    // 3. APLICAR XP
    xpTotal += xpGain;
    let levelsGained = 0;
    
    // Subidas de nivel automáticas
    while (xpTotal >= xpNeeded) {
      xpTotal -= xpNeeded;
      level += 1;
      levelsGained += 1;
      // Si quieres que la meta de XP aumente cada nivel:
      // xpNeeded = Math.round(xpNeeded * 1.1); // +10% por nivel
    }
    
    // 4. GUARDAR TODO EN EL FRONTMATTER
    await app.fileManager.processFrontMatter(archivoActual, (frontmatter) => {
      frontmatter.xp_total = xpTotal;
      frontmatter.xp_gain = 0; // ¡IMPORTANTE! Limpiamos el campo después de usar
      frontmatter.level = level;
      frontmatter.xp_needed = xpNeeded;
    });
    
    // 5. NOTIFICACIÓN
    if (levelsGained > 0) {
      new Notice(`✅ Ganaste ${xpGain} XP. Subiste ${levelsGained} nivel(es)! Nivel ${level} - ${xpTotal}/${xpNeeded} XP`);
    } else {
      new Notice(`✅ Ganaste ${xpGain} XP. Total: ${xpTotal}/${xpNeeded} XP (Nivel ${level})`);
    }
    
    // 6. ACTUALIZAR META-BIND
    const metaBindPlugin = app.plugins.getPlugin('obsidian-meta-bind-plugin');
    if (metaBindPlugin?.api?.updateAllBindings) {
      metaBindPlugin.api.updateAllBindings();
    }
    
  } catch (error) {
    console.error("Error en applyXp.js:", error);
    new Notice("❌ Error aplicando XP.");
  }
})();