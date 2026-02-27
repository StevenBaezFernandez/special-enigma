# BR/CO Fiscal Beta -> GA Checklist

## Brasil (SEFAZ)

- [ ] Emissão NFe homologação com certificado válido A1/A3.
- [ ] Cancelamento dentro de janela legal por UF.
- [ ] Retry idempotente (timeout/rede) + deduplicação por chave fiscal.
- [ ] Contingência (SVC/FS-DA) testada e documentada.
- [ ] Acuse/recibo persistido para reconciliação diária.
- [ ] Evidencia de homologação por UF anexada no dossiê de release.

## Colombia (DIAN)

- [ ] Emisión UBL 2.1 validada por esquema y reglas DIAN.
- [ ] Acuse de recepción y estado final persistidos.
- [ ] Reintentos controlados + conciliación de eventos/acuse.
- [ ] Flujo de contingencia probado (indisponibilidad DIAN).
- [ ] Certificación sandbox/prod por NIT completada.

## Gate comercial

Hasta completar los checks anteriores, BR/CO permanecen en **Beta controlada** y no deben ofertarse como GA fiscal.
