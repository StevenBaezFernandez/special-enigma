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
                'type:util',
                'type:contracts',
                'type:domain',
              ],
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:contracts',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:contracts',
                'type:util',
                'type:infrastructure',
              ],
            },

            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:presentation',
                'type:infrastructure',
                'type:contracts',
                'type:util',
                'type:ui',
              ],
            },
            {
              sourceTag: 'type:presentation',
              onlyDependOnLibsWithTags: [
                'type:application',
                'type:domain',
                'type:contracts',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: [
                'type:contracts',
                'type:util',
                'type:ui',
              ],
            },
            {
              sourceTag: 'type:contracts',
              onlyDependOnLibsWithTags: ['type:util'],
            },

            // Domain Scopes (Strict Boundaries)
            {
              sourceTag: 'scope:finops',
              onlyDependOnLibsWithTags: ['scope:finops', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:platform',
              onlyDependOnLibsWithTags: ['scope:platform', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:accounting',
              onlyDependOnLibsWithTags: ['scope:accounting', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:billing',
              onlyDependOnLibsWithTags: ['scope:billing', 'scope:shared', 'scope:kernel', 'scope:subscription', 'scope:fiscal', 'scope:identity', 'scope:catalog', 'scope:platform']
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
              onlyDependOnLibsWithTags: ['scope:bi', 'scope:shared', 'scope:kernel', 'scope:accounting']
            },
            {
              sourceTag: 'scope:payroll',
              onlyDependOnLibsWithTags: ['scope:payroll', 'scope:shared', 'scope:kernel', 'scope:identity', 'scope:platform']
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
              sourceTag: 'scope:gateway',
              onlyDependOnLibsWithTags: [
                'scope:gateway',
                'scope:accounting',
                'scope:admin',
                'scope:bi',
                'scope:billing',
                'scope:catalog',
                'scope:crm',
                'scope:fiscal',
                'scope:fixed-assets',
                'scope:identity',
                'scope:inventory',
                'scope:manufacturing',
                'scope:payroll',
                'scope:projects',
                'scope:purchasing',
                'scope:subscription',
                'scope:treasury',
                'scope:shared',
                'scope:kernel',
              ]
            },
            {
              sourceTag: 'scope:fixed-assets',
              onlyDependOnLibsWithTags: ['scope:fixed-assets', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:subscription',
              onlyDependOnLibsWithTags: ['scope:subscription', 'scope:billing', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:notification',
              onlyDependOnLibsWithTags: ['scope:notification', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:store',
              onlyDependOnLibsWithTags: ['scope:store', 'scope:catalog', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:shopfloor',
              onlyDependOnLibsWithTags: ['scope:shopfloor', 'scope:manufacturing', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:wms',
              onlyDependOnLibsWithTags: ['scope:wms', 'scope:inventory', 'scope:shared', 'scope:kernel']
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
              sourceTag: 'scope:pos',
              onlyDependOnLibsWithTags: [
                'scope:pos',
                'scope:shared',
                'scope:kernel',
                'scope:billing',
                'scope:inventory'
              ]
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:kernel',
              onlyDependOnLibsWithTags: ['scope:kernel', 'scope:shared']
            },
            {
              sourceTag: 'scope:edge',
              onlyDependOnLibsWithTags: [
                'scope:edge',
                'scope:accounting',
                'scope:admin',
                'scope:bi',
                'scope:billing',
                'scope:catalog',
                'scope:crm',
                'scope:fiscal',
                'scope:fixed-assets',
                'scope:identity',
                'scope:inventory',
                'scope:manufacturing',
                'scope:payroll',
                'scope:projects',
                'scope:purchasing',
                'scope:subscription',
                'scope:treasury',
                'scope:shared',
                'scope:kernel',
              ]
            },
            {
              sourceTag: 'type:bff',
              onlyDependOnLibsWithTags: [
                'type:presentation',
                'type:application',
                'type:domain',
                'type:infrastructure',
                'type:contracts',
                'type:util',
                'type:ui',
              ],
            },
            {
              sourceTag: 'scope:web-portal',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:kernel',
                'scope:accounting',
                'scope:admin',
                'scope:bi',
                'scope:billing',
                'scope:catalog',
                'scope:crm',
                'scope:fiscal',
                'scope:fixed-assets',
                'scope:identity',
                'scope:inventory',
                'scope:manufacturing',
                'scope:payroll',
                'scope:projects',
                'scope:purchasing',
                'scope:subscription',
                'scope:treasury',
                'scope:notification',
                'scope:scheduler',
                'scope:pos',
              ]
            },
            {
              sourceTag: 'scope:cms',
              onlyDependOnLibsWithTags: ['scope:cms', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:desktop-portal',
              onlyDependOnLibsWithTags: ['scope:desktop-portal', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:domain-subscription',
              onlyDependOnLibsWithTags: ['scope:domain-subscription', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:mobile-app',
              onlyDependOnLibsWithTags: ['scope:mobile-app', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:portal',
              onlyDependOnLibsWithTags: ['scope:portal', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:site',
              onlyDependOnLibsWithTags: ['scope:site', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:support',
              onlyDependOnLibsWithTags: ['scope:support', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:web-cms',
              onlyDependOnLibsWithTags: ['scope:web-cms', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:web-site',
              onlyDependOnLibsWithTags: ['scope:web-site', 'scope:shared', 'scope:kernel']
            },
            {
              sourceTag: 'scope:web-support',
              onlyDependOnLibsWithTags: ['scope:web-support', 'scope:shared', 'scope:kernel']
            },
          ],
        },
      ],
    },
  },

  {
    files: ['libs/domain/**/domain/**/*.ts'],
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
    files: ['libs/domain/**/application/src/lib/use-cases/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@nestjs/common',
              importNames: ['NotFoundException', 'BadRequestException', 'ForbiddenException', 'UnauthorizedException', 'ConflictException'],
              message: 'Translate application/domain errors to HTTP only in presentation layer.'
            }
          ],
          patterns: ['@mikro-orm/*']
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
