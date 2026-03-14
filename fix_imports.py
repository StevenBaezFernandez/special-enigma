import os
import re

# Symbols that are interfaces or types
type_symbols = "AccountRepository|JournalEntryRepository|DashboardGateway|IntegrationGateway|TaxTableRepository|FixedAssetRepository|BillOfMaterialsRepository|ProductionOrderRepository|ProjectRepository|TransactionRepository|BankAccountRepository|InventoryRepository|WarehouseRepository|ProductGateway|ProductReadRepository|ProductWriteRepository|SatCatalogRepository|UserPayload|CreateAccountDto|RecordJournalEntryDto|AccountDto|JournalEntryDto|RegisterMovementInput|CreateWarehouseDto|CreateSaleDto|CreateCustomerDto|InventoryService|SaleRepository|CustomerRepository|CatalogService|Product".split("|")

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Handle imports: import { A, B } from '...'
    # Use a regex that finds the whole import block
    import_pattern = re.compile(r'import\s+\{([^}]*)\}\s+from\s+[\'"]([^\'"]+)[\'"]', re.MULTILINE)

    def replace_import(match):
        members = match.group(1)
        source = match.group(2)

        # If it's a relative import within the same library infrastructure, we might want to keep classes as values
        # But here we are mostly concerned with domain interfaces imported into application/presentation

        new_members = []
        for member in [m.strip() for m in members.split(',') if m.strip()]:
            name = member
            if ' as ' in member:
                name = member.split(' as ')[0].strip()

            if name in type_symbols and not member.startswith('type '):
                # Special check: if we are in infrastructure and importing a repository, it might be the class?
                # No, usually MikroOrmRepository is the class, Repository is the interface.
                new_members.append(f'type {member}')
            else:
                new_members.append(member)

        return f"import {{ {', '.join(new_members)} }} from '{source}'"

    new_content = import_pattern.sub(replace_import, content)

    # 2. Handle exports: export { A, B }
    export_pattern = re.compile(r'export\s+\{([^}]*)\}(?:\s+from\s+[\'"]([^\'"]+)[\'"])?', re.MULTILINE)

    def replace_export(match):
        members = match.group(1)
        source_part = match.group(0).split('}')[-1] # catch the ' from ...' part if exists

        new_members = []
        for member in [m.strip() for m in members.split(',') if m.strip()]:
            name = member
            if ' as ' in member:
                name = member.split(' as ')[0].strip()

            if name in type_symbols and not member.startswith('type '):
                new_members.append(f'type {member}')
            else:
                new_members.append(member)

        return f"export {{ {', '.join(new_members)} }}{source_part}"

    new_content = export_pattern.sub(replace_export, new_content)

    if new_content != content:
        # Emergency cleanup for things that should NEVER have 'type'
        # e.g. NestJS decorators or providers
        new_content = new_content.replace('type type', 'type')

        # If it's a provider or decorator usage, 'type' will cause syntax error
        # Revert 'type' in common value positions
        new_content = re.sub(r'provide:\s+type\s+', 'provide: ', new_content)
        new_content = re.sub(r'useClass:\s+type\s+', 'useClass: ', new_content)
        new_content = re.sub(r'@Inject\(type\s+', '@Inject(', new_content)
        new_content = re.sub(r'implements\s+type\s+', 'implements ', new_content)

        with open(filepath, 'w') as f:
            f.write(new_content)

# Apply to relevant domain libs first
libs_to_fix = ['libs/domain/accounting', 'libs/domain/inventory', 'libs/domain/catalog', 'libs/domain/identity', 'libs/domain/fixed-assets']
for lib_dir in libs_to_fix:
    for root, dirs, files in os.walk(lib_dir):
        for file in files:
            if file.endswith('.ts'):
                fix_file(os.path.join(root, file))
