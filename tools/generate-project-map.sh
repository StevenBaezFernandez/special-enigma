#!/bin/bash

# Script para generar el mapa completo del proyecto
# Uso: ./tools/generate-project-map.sh o npm run docs:generate-map

MAP_FILE="MAPA_PROYECTO.md"

echo "Generando mapa completo del proyecto en $MAP_FILE..."

echo "# Mapa Completo del Proyecto" > "$MAP_FILE"
echo "" >> "$MAP_FILE"
echo "Este archivo se genera automáticamente. Para actualizarlo, ejecuta: \`npm run docs:generate-map\`" >> "$MAP_FILE"
echo "" >> "$MAP_FILE"
echo '```' >> "$MAP_FILE"
tree -a >> "$MAP_FILE"
echo '```' >> "$MAP_FILE"

echo "¡Mapa generado con éxito!"
