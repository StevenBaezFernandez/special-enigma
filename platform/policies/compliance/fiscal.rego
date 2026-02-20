package virteex.compliance.fiscal

valid_fiscal_stamp[invoice] {
    invoice := input.invoice
    invoice.type == "fiscal"
    invoice.fiscal_stamp != null
    regex.match(`^[A-Za-z0-9+/=]{40,}$`, invoice.fiscal_stamp)
    time.parse_rfc3339_ns(invoice.issue_date) <= time.now_ns()
}

valid_withholdings[invoice] {
    invoice := input.invoice
    expected_withholdings := calculate_withholdings(invoice)
    invoice.withholdings == expected_withholdings
}

calculate_withholdings(invoice) = result {
    invoice.amount > 1000
    result := invoice.amount * 0.1
} else = 0 {
    invoice.amount <= 1000
}

within_fiscal_limits[invoice] {
    invoice := input.invoice
    limits := data.fiscal_limits[invoice.jurisdiction]
    invoice.total >= limits.min_amount
    invoice.total <= limits.max_amount
    count(invoice.transactions) <= limits.max_monthly_transactions
}
