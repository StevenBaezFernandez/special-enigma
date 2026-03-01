import fs from 'fs';
import path from 'path';

const subgraphs = [
    'accounting', 'billing', 'inventory', 'crm', 'fiscal', 'identity',
    'payroll', 'purchasing', 'treasury', 'fixed-assets', 'projects',
    'manufacturing', 'catalog', 'bi', 'subscription'
];

subgraphs.forEach(subgraph => {
    const filePath = `apps/api/${subgraph}/app/src/app/app.module.ts`;
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        if (content.includes('GraphQLModule.forRoot') && !content.includes('validationRules')) {
            console.log(`Hardening ${subgraph}...`);

            // Add imports if missing
            if (!content.includes('graphql-depth-limit')) {
                content = content.replace(
                    "import { GraphQLModule } from '@nestjs/graphql';",
                    "import { GraphQLModule } from '@nestjs/graphql';\nimport * as depthLimit from 'graphql-depth-limit';\nimport { createComplexityLimitRule } from 'graphql-query-complexity';"
                );
            }

            // Inject validationRules
            content = content.replace(
                'autoSchemaFile: true,',
                `autoSchemaFile: true,
      validationRules: [
        depthLimit(10),
        createComplexityLimitRule(1000)
      ],`
            );

            fs.writeFileSync(filePath, content);
        }
    }
});
