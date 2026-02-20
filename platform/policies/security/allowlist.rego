package virteex.security.allowlist

default allow = false

allow {
    input.method == "GET"
    input.path == ["public", "health"]
}

allow {
    input.user.role == "admin"
}
