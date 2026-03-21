import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Script for generating an SBOM in CycloneDX format.
 * Requirement for security compliance 10/10.
 */
function generateSbom() {
  console.log('--- Generating SBOM ---');
  try {
    const output = execSync('npx cyclonedx-npm --output-format JSON --output-file sbom.json', { encoding: 'utf-8' });
    console.log(output);
    console.log('SBOM generated successfully at sbom.json');
  } catch (error) {
    console.error('Failed to generate SBOM:', error);

    const isRelease = process.env.RELEASE_STAGE === 'production' || process.env.CI === 'true';

    if (isRelease) {
      console.error('❌ CRITICAL: SBOM generation is MANDATORY for release/CI. Failing the build.');
      process.exit(1);
    }

    // Create a fallback placeholder ONLY for local development
    const placeholder = {
        bomFormat: "CycloneDX",
        specVersion: "1.5",
        version: 1,
        components: [],
        metadata: {
          description: "NON-RELEASE PLACEHOLDER"
        }
    };
    writeFileSync(join(process.cwd(), 'sbom.json'), JSON.stringify(placeholder, null, 2));
    console.log('⚠️ Created placeholder sbom.json for local development ONLY.');
  }
}

generateSbom();
