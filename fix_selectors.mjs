import fs from 'fs';
const files = [
    { path: 'libs/domain/accounting/ui/src/lib/pages/dashboard/dashboard.component.ts', selector: 'app-accounting-dashboard' },
    { path: 'libs/domain/accounting/ui/src/lib/pages/chart-of-accounts/chart-of-accounts.component.ts', selector: 'app-chart-of-accounts' },
    { path: 'libs/domain/accounting/ui/src/lib/pages/journal-entries/journal-entries.component.ts', selector: 'app-journal-entries' },
    { path: 'libs/domain/billing/ui/src/lib/pages/invoice-list/invoice-list.component.ts', selector: 'app-invoice-list' },
    { path: 'libs/domain/billing/ui/src/lib/pages/invoice-detail/invoice-detail.component.ts', selector: 'app-invoice-detail' },
    { path: 'libs/domain/crm/ui/src/lib/pages/customer-list/customer-list.component.ts', selector: 'app-customer-list' },
    { path: 'libs/domain/crm/ui/src/lib/pages/lead-pipeline/lead-pipeline.component.ts', selector: 'app-lead-pipeline' }
];

files.forEach(f => {
    if (fs.existsSync(f.path)) {
        let content = fs.readFileSync(f.path, 'utf8');
        content = content.replace(/selector: '.*?'/, `selector: '${f.selector}'`);
        fs.writeFileSync(f.path, content);
    }
});
