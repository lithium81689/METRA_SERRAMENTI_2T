function uid(){
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

/* ============================================================
   HELPERS
   ============================================================ */
function fmtDate(d){
  if(!d) return '';
  const [y,m,day] = d.split('-');
  if(!y||!m||!day) return d;
  return `${day}/${m}/${y}`;
}
function fmtNum(n){
  if (n===undefined || n===null || n==='') return '—';
  const num = parseFloat(n);
  if (isNaN(num)) return '—';
  const rounded = Math.round(num*10)/10;
  return (Number.isInteger(rounded) ? String(rounded) : rounded.toString()).replace('.',',');
}
function quantityVal(m){
  const q = parseInt(m && (m.quantita || m.quantity || 1), 10);
  return (!q || q < 1) ? 1 : q;
}
function readOptionalNumber(id){
  const v = document.getElementById(id).value;
  return v==='' ? null : parseFloat(v);
}
function balconeElementoLabel(v){
  if (v==='porta-finestra') return 'Porta-Finestra';
  if (v==='finestra') return 'Finestra';
  return '';
}
function cassonettoText(c){
  if (!c || !c.presente) return '';
  return `L ${fmtNum(c.larghezza)} mm · H ${fmtNum(c.altezza)} mm · P ${fmtNum(c.profondita)} mm`;
}
function measureDetailsText(m){
  const parts = [];
  if (m.tipo==='serranda'){
    if (m.misuraLuce) parts.push('Misura Luce');
  } else if (m.tipoMisura==='piena'){
    parts.push('Misura Piena');
  } else if (m.tipoMisura==='da_fare'){
    parts.push('Misura Da Fare');
  }
  if (m.tipo==='finestra' && m.numeroAnte){
    parts.push(`Ante: ${m.numeroAnte} ${String(m.numeroAnte)==='1' ? 'anta' : 'ante'}`);
  }
  if (m.tipo==='balcone'){
    if (m.balconeElemento) parts.push(`Elemento: ${balconeElementoLabel(m.balconeElemento)}`);
    if (m.balconeTipologia) parts.push(`Tipologia: ${m.balconeTipologia}`);
  }
  if (m.tipo==='zanzariera' && m.zanzarieraTipo){
    parts.push(`Tipo: ${zanzarieraTipoLabel(m.zanzarieraTipo)}`);
  }
  if (m.tipo==='tenda_oscurante' && m.cavoPosizione){
    parts.push(`Cavo: ${cavoPosizioneLabel(m.cavoPosizione)} (vista dall'interno)`);
  }
  return parts.join(' · ');
}
function escapeHtml(str){
  if(str===undefined||str===null) return '';
  return String(str).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function aperturaLabel(v){
  if (v==='destra') return 'Destra';
  if (v==='sinistra') return 'Sinistra';
  return 'Non specificato';
}
function zanzarieraTipoLabel(v){
  if (v==='laterale') return 'Laterale';
  if (v==='verticale') return 'Verticale';
  return '';
}
function cavoPosizioneLabel(v){
  if (v==='destra') return 'Destra';
  if (v==='sinistra') return 'Sinistra';
  return '';
}
function usesApertura(tipo){
  return ['porta','finestra','balcone'].includes(tipo);
}
