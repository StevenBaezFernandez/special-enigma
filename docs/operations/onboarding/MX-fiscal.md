# Playbook de Onboarding Fiscal - México (MX)

## Pre-requisitos
- RFC válido.
- Certificado de Sello Digital (CSD) vigente (.cer y .key).
- Contraseña de la llave privada.
- Registro con PAC autorizado (SAT).

## Pasos de configuración en Virteex
1. Navegar a **Admin > Configuración Fiscal**.
2. Seleccionar **País: MX**.
3. Cargar archivos CSD y validar vigencia.
4. Configurar régimen fiscal y datos del emisor.
5. Ejecutar prueba de timbrado en modo Sandbox.

## Verificación de salida
- Generación de XML CFDI 4.0.
- Timbrado exitoso con UUID.
- Generación de representación impresa (PDF).

## Resolución de problemas comunes
- Certificado revocado: Validar en LCO (Lista de Contribuyentes Obligados).
- Error de sello: Verificar contraseña y vigencia del CSD.
