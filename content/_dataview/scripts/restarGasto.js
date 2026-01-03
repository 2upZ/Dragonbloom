// restarGasto.js - Sistema completo de monedas con conversiones
(async () => {
  try {
    const archivoActual = app.workspace.getActiveFile();
    const cache = app.metadataCache.getFileCache(archivoActual);
    
    if (!cache?.frontmatter) {
      new Notice("❌ No se encontró el frontmatter.");
      return;
    }
    const fm = cache.frontmatter;
    
    // FACTORES DE CONVERSIÓN A BRONCE
    const factores = {
      platino: 1000,
      oro: 100,
      electrum: 50,
      plata: 10,
      bronce: 1
    };
    
    const monedas = Object.keys(factores);
    
    // 1. CALCULAR EL TOTAL ACTUAL EN BRONCE (solo en la primera ejecución)
    let totalBronceActual = Number(fm.total_bronce) || 0;
    if (totalBronceActual === 0) {
      for (const moneda of monedas) {
        totalBronceActual += (Number(fm[moneda]) || 0) * factores[moneda];
      }
    }
    
    // 2. SUMAR LOS GASTOS INTRODUCIDOS (convertidos a bronce)
    let gastoTotalBronce = 0;
    for (const moneda of monedas) {
      const gasto = Number(fm[`gasto_${moneda}`]) || 0;
      gastoTotalBronce += gasto * factores[moneda];
    }
    
    if (gastoTotalBronce <= 0) {
      new Notice("ℹ️ Introduce un gasto en al menos una moneda.");
      return;
    }
    
    if (gastoTotalBronce > totalBronceActual) {
      new Notice("❌ No tienes suficientes fondos.");
      return;
    }
    
    // 3. CALCULAR NUEVO TOTAL
    const nuevoTotalBronce = totalBronceActual - gastoTotalBronce;
    
    // 4. RECONVERTIR EL NUEVO TOTAL A CADA MONEDA (algoritmo de cambio)
    let resto = nuevoTotalBronce;
    const nuevosValores = {};
    
    // Orden descendente (de moneda más valiosa a menos)
    const monedasOrdenadas = ['platino', 'oro', 'electrum', 'plata', 'bronce'];
    for (const moneda of monedasOrdenadas) {
      nuevosValores[moneda] = Math.floor(resto / factores[moneda]);
      resto = resto % factores[moneda];
    }
    
    // 5. GUARDAR TODOS LOS VALORES EN EL FRONTMATTER
    await app.fileManager.processFrontMatter(archivoActual, (frontmatter) => {
      // Guardar los nuevos totales por moneda
      for (const moneda of monedas) {
        frontmatter[moneda] = nuevosValores[moneda];
      }
      // Guardar el total en bronce para futuros cálculos rápidos
      frontmatter.total_bronce = nuevoTotalBronce;
      // Reiniciar TODOS los campos de gasto a 0
      for (const moneda of monedas) {
        frontmatter[`gasto_${moneda}`] = 0;
      }
    });
    
    // 6. NOTIFICACIÓN DE ÉXITO
    new Notice(`✅ Gastado: ${gastoTotalBronce} bronce. Total restante: ${nuevoTotalBronce} bronce.`);
    
    // 7. ACTUALIZAR VISTA DE META BIND
    const metaBindPlugin = app.plugins.getPlugin('obsidian-meta-bind-plugin');
    if (metaBindPlugin?.api?.updateAllBindings) {
      metaBindPlugin.api.updateAllBindings();
    }
    
  } catch (error) {
    console.error("Error en el sistema de monedas:", error);
    new Notice("❌ Error. Revisa la consola.");
  }
})();