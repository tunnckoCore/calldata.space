import fg from 'fast-glob';
import fs from 'node:fs/promises';

const nodemods = await fg(
  [
    '**/apps/*/node_modules',
    '**/apps/*/dist',
    '**/apps/*/.next',
    '**/packages/*/node_modules',
    '**/packages/*/dist',
  ],
  {
    absolute: true,
    onlyDirectories: true,
  },
);

for await (const fp of nodemods) {
  console.log(`Deleting ${fp}`);
  await fs.rmdir(fp, { recursive: true });
}

await fs.rmdir('./node_modules', { recursive: true });
await fs.rm('./bun.lockb', { force: true });

console.log('Done')
