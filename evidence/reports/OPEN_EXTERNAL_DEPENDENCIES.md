# Open External Dependencies

| Dependency | Impact | Status | Steps to Close |
|---|---|---|---|
| US Fiscal Partner | US Region blocked | **PENDING** | Sign contract with Avalara/TaxJar, get API keys, and configure `US_TAX_PARTNER_URL`. |
| AWS IAM Roles | Secrets Access | **PENDING** | Provision IAM roles with `secretsmanager:GetSecretValue` permissions for ECS/EKS. |
| Fiscal Certificates | CO/BR Signing | **CLIENT-DEPENDENT** | Upload P12/PFX certificates to Secrets Manager for each production tenant. |
