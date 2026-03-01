/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'This dependency is part of a circular relationship.',
      from: {},
      to: {
        circular: true,
        dependencyTypesNot: ['type-only']
      }
    },
    {
      name: 'domain-no-infra-app-presentation',
      severity: 'error',
      comment: 'Domain must not depend on Infrastructure, Application or Presentation',
      from: { path: '^libs/domain/.+/domain' },
      to: {
        path: [
          '^libs/.*infrastructure',
          '^libs/.*application',
          '^libs/.*presentation'
        ]
      }
    },
    {
      name: 'infra-no-presentation',
      severity: 'error',
      comment: 'Infrastructure must not depend on Presentation',
      from: { path: '^libs/.*infrastructure' },
      to: { path: '^libs/.*presentation' }
    },
    {
      name: 'app-isolation',
      severity: 'error',
      comment: 'Applications must not depend on other applications',
      from: { path: '^apps/([^/]+)/' },
      to: {
        path: '^apps/([^/]+)/',
        pathNot: '^apps/$1/'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.base.json'
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
    },
  }
};
