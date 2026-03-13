import fs from 'fs';

const results = JSON.parse(fs.readFileSync('results.json'));

let report = "# Informe de Análisis de Microservicios y Aplicaciones\n\n";

report += "## Resumen Ejecutivo\n\n";
const successCount = results.filter(r => r.status === 'Success').length;
const errorCount = results.filter(r => r.status === 'Error').length;
const unknownCount = results.filter(r => r.status === 'Timeout/Unknown').length;

report += "- **Total de servicios/apps analizados:** " + results.length + "\n";
report += "- **Servidos correctamente:** " + successCount + "\n";
report += "- **Con errores de consola:** " + errorCount + "\n";
report += "- **Timeout o estado desconocido:** " + unknownCount + "\n\n";

report += "## Detalle por Servicio\n\n";
report += "| Proyecto | Estado | Error Principal / Observación |\n";
report += "| --- | --- | --- |\n";

for (const res of results) {
  let errorMsg = "N/A";
  if (res.status !== 'Success') {
    const log = fs.readFileSync(res.logFile, 'utf8');
    const lines = log.split('\n');
    const errorLines = lines.filter(l => l.includes('ERROR') || l.includes('Error') || l.includes('TS') || l.includes('Failed'));
    if (errorLines.length > 0) {
      errorMsg = errorLines.slice(0, 3).join('<br>').replace(/\|/g, '\\|').replace(/\r/g, '');
    } else if (res.status === 'Timeout/Unknown') {
      errorMsg = "El proceso no terminó ni mostró errores claros en 45s (posiblemente sirviendo pero sin mensaje de éxito detectado).";
    }
  }
  report += "| " + res.project + " | " + res.status + " | " + errorMsg + " |\n";
}

report += "\n## Análisis Detallado de Errores\n\n";

for (const res of results) {
  if (res.status !== 'Success') {
    report += "### " + res.project + "\n\n";
    report += "```\n";
    const log = fs.readFileSync(res.logFile, 'utf8');
    const cleanLog = log.replace(/\u001b\[[0-9;]*m/g, '');
    const lines = cleanLog.split('\n');
    if (lines.length > 40) {
        report += lines.slice(0, 20).join('\n') + '\n... [intermedio] ...\n' + lines.slice(-20).join('\n');
    } else {
        report += cleanLog;
    }
    report += "\n```\n\n";
  }
}

fs.writeFileSync('service_analysis_report.md', report);
