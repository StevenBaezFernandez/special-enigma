import { Project } from 'ts-morph';

describe('Accounting Domain Architecture Boundaries', () => {
  let project: Project;

  beforeAll(() => {
    project = new Project();
    project.addSourceFilesAtPaths([
      'libs/domain/accounting/domain/src/**/*.ts',
      'libs/domain/accounting/application/src/**/*.ts',
    ]);
  });

  it('domain layer should not import from application layer', () => {
    const domainFiles = project.getSourceFiles('libs/domain/accounting/domain/src/**/*.ts');

    domainFiles.forEach(file => {
      const imports = file.getImportDeclarations();
      imports.forEach(imp => {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        expect(moduleSpecifier).not.toContain('../application');
        expect(moduleSpecifier).not.toContain('@virteex/domain-accounting-application');
      });
    });
  });

  it('domain layer should not import from infrastructure layer', () => {
    const domainFiles = project.getSourceFiles('libs/domain/accounting/domain/src/**/*.ts');

    domainFiles.forEach(file => {
      const imports = file.getImportDeclarations();
      imports.forEach(imp => {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        expect(moduleSpecifier).not.toContain('../infrastructure');
        expect(moduleSpecifier).not.toContain('@virteex/domain-accounting-infrastructure');
      });
    });
  });
});
