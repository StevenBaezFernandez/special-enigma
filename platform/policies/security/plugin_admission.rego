package virteex.security.plugins

default allow = false

# Un plugin debe estar firmado para ser admitido
allow {
    input.plugin.is_signed == true
    input.plugin.signature_valid == true
    not has_critical_vulnerabilities
    not violates_egress_policy
}

# Validación de vulnerabilidades críticas del SBOM del plugin
has_critical_vulnerabilities {
    input.plugin.sbom.vulnerabilities[_].severity == "CRITICAL"
}

# Validación de política de salida (egress)
# Los plugins solo pueden conectar a hosts en la allowlist
violates_egress_policy {
    destination := input.plugin.requested_egress[_]
    not is_allowed_host(destination)
}

is_allowed_host(host) {
    allowed_hosts := {"api.dian.gov.co", "nfe.fazenda.sp.gov.br", "api.taxjar.com"}
    allowed_hosts[host]
}
