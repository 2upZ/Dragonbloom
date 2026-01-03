// _dataview/scripts/xp-bar.js - VERSIÓN SIMPLIFICADA
const xpTotal = Number(dv.current().xp_total ?? 0);
const xpNeeded = Number(dv.current().xp_needed ?? 1000);
const level = Number(dv.current().level ?? 1);

const pct = Math.min(xpTotal / xpNeeded * 100, 100);
let color = "#4caf50";
if (pct > 90) color = "#ff9800";
if (pct >= 100) color = "#2196f3";

dv.el('div', `
<div style="margin: 10px 0;">
  <div style="position: relative; height: 26px; border-radius: 6px; background: #e6e6e6; overflow: hidden; border: 1px solid #333;">
    <div style="width: ${pct}%; height: 100%; background: ${color}; transition: width 0.3s;"></div>
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; text-align: center; color: white; font-weight: 600; line-height: 26px; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">
      Nivel ${level} — ${xpTotal} / ${xpNeeded} XP
    </div>
  </div>
</div>
`);