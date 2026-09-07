import { access, readFile } from 'node:fs/promises';
const roots = ['apps/web', 'apps/api', 'apps/worker', 'packages/domain', 'packages/attestcoin', 'packages/underwriting', 'packages/config'];
for (const root of roots) {
  const pkg = JSON.parse(await readFile(`${root}/package.json`, 'utf8'));
  if (!pkg.private || !pkg.name.startsWith('@nodra/')) throw new Error(`Invalid workspace: ${root}`);
  await access(`${root}/src`);
}
for (const path of ['docs/build-plan.md', 'docs/architecture.md', 'docs/integrations.md', 'contracts/foundry.toml']) await access(path);
const fixture = JSON.parse(await readFile('fixtures/operator.example.json', 'utf8'));
if (fixture.synthetic !== true || fixture.verificationMode !== 'mock') throw new Error('Fixture must be labeled synthetic/mock');
console.log(`Scaffold checks passed (${roots.length} workspaces). Run test:e2e separately for frontend checks; live protocol tests are not implemented.`);
