import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
      "ignores": [
        "**/dist",
        "**/out-tsc",
        "**/vitest.config.*.timestamp*"
      ]
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Architectural Layers
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: [
                'type:contract',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:contract',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:contract',
                'type:util',
              ],
            },

            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:presentation',
                'type:application',
                'type:domain',
                'type:infrastructure',
                'type:contract',
                'type:util',
                'type:ui',
              ],
            },
            {
              sourceTag: 'type:presentation',
              onlyDependOnLibsWithTags: [
                'type:application',
                'type:domain',
                'type:infrastructure',
                'type:contract',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: [
                'type:contract',
                'type:util',
                'type:ui',
              ],
            },
            {
              sourceTag: 'type:contract',
              onlyDependOnLibsWithTags: ['type:util'],
            },

            // Domain Scopes (Strict Boundaries)
            {
              sourceTag: 'scope:accounting',
              onlyDependOnLibsWithTags: ['scope:accounting', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:billing',
              onlyDependOnLibsWithTags: ['scope:billing', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:purchasing',
              onlyDependOnLibsWithTags: ['scope:purchasing', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:crm',
              onlyDependOnLibsWithTags: ['scope:crm', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:bi',
              onlyDependOnLibsWithTags: ['scope:bi', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:payroll',
              onlyDependOnLibsWithTags: ['scope:payroll', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:manufacturing',
              onlyDependOnLibsWithTags: ['scope:manufacturing', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:inventory',
              onlyDependOnLibsWithTags: ['scope:inventory', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:admin',
              onlyDependOnLibsWithTags: ['scope:admin', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:identity',
              onlyDependOnLibsWithTags: ['scope:identity', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:fixed-assets',
              onlyDependOnLibsWithTags: ['scope:fixed-assets', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:projects',
              onlyDependOnLibsWithTags: ['scope:projects', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:treasury',
              onlyDependOnLibsWithTags: ['scope:treasury', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:catalog',
              onlyDependOnLibsWithTags: ['scope:catalog', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:fiscal',
              onlyDependOnLibsWithTags: ['scope:fiscal', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:kernel',
              onlyDependOnLibsWithTags: ['scope:kernel', 'scope:shared']
            },          ],
        },
      ],
    },
  },

  {
    files: ['libs/domains/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@nestjs/*', '@mikro-orm/*', '@nestjs', '@mikro-orm', 'class-validator', 'rxjs']
        }
      ]
    }
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
