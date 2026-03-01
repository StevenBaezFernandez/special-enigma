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

        // Remove validationRules if they exist but are not inside GraphQLModule (sanity check)
        // Then re-inject correctly.

        if (content.includes('GraphQLModule.forRoot')) {
            console.log(`Hardening ${subgraph}...`);

            // 1. Ensure imports are present
            if (!content.includes('graphql-depth-limit')) {
                content = content.replace(
                    "import { GraphQLModule } from '@nestjs/graphql';",
                    "import { GraphQLModule } from '@nestjs/graphql';\nimport * as depthLimit from 'graphql-depth-limit';\nimport { createComplexityLimitRule } from 'graphql-query-complexity';"
                );
            }

            // 2. Clear any existing validationRules to avoid duplicates/mismatches
            content = content.replace(/validationRules: \[[\s\S]*?\],?/, '');

            // 3. Inject validationRules inside GraphQLModule.forRoot
            content = content.replace(
                /GraphQLModule\.forRoot<ApolloFederationDriverConfig>\(\{([\s\S]*?)\}\)/,
                (match, p1) => {
                    let inner = p1.trim();
                    if (!inner.endsWith(',')) inner += ',';
                    return `GraphQLModule.forRoot<ApolloFederationDriverConfig>({\n      ${inner}\n      validationRules: [\n        depthLimit(10),\n        createComplexityLimitRule(1000)\n      ],\n    })`;
                }
            );

            fs.writeFileSync(filePath, content);
        }
    }
});
