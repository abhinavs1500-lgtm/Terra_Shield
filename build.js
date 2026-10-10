// TerraShield AI - Universal Build Runner for Netlify / CI / Local Deployments
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');
const frontendDist = path.join(frontendDir, 'dist');
const rootDist = path.join(rootDir, 'dist');

console.log('================================================================');
console.log('  TerraShield AI — Deployment Build Pipeline');
console.log('================================================================');

try {
  console.log('\n[1/3] Verifying and installing frontend dependencies...');
  execSync('npm install', {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true
  });

  console.log('\n[2/3] Building production bundle with TypeScript and Vite...');
  execSync('npm run build', {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true
  });

  console.log('\n[3/3] Synchronizing build artifacts to root dist/ directory...');
  if (fs.existsSync(rootDist)) {
    fs.rmSync(rootDist, { recursive: true, force: true });
  }

  fs.cpSync(frontendDist, rootDist, { recursive: true });

  console.log('\n================================================================');
  console.log('  Build complete! Assets ready in:');
  console.log('  - ' + frontendDist);
  console.log('  - ' + rootDist);
  console.log('================================================================\n');
} catch (error) {
  console.error('\n[BUILD FAILED] An error occurred during the build process:');
  console.error(error.message);
  process.exit(1);
}
