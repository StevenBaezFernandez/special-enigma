# Runbook L1 (pt-BR) — Virteex Brasil

## Classificação inicial

- **Sev-1**: indisponibilidade total (fiscal, faturamento, autenticação).
- **Sev-2**: degradação crítica parcial (SEFAZ, sync offline, pagamentos).
- **Sev-3**: erro funcional com workaround.
- **Sev-4**: dúvida operacional/parametrização.

## Checklist de triagem

1. Validar `status` do serviço (`/health`).
2. Confirmar região ativa (`MARKETPLACE_REGION`, shard BR).
3. Verificar fila fiscal BR (timeouts/retries/acuses).
4. Confirmar certificado digital (vigência e cadeia).
5. Abrir escalonamento L2 se Sev-1/Sev-2 > 30 min.
