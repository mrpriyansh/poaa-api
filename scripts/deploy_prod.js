const { execSync } = require('child_process');

function runCommand(command, ignoreError = false) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    if (ignoreError) {
      console.log(`Command failed but error was ignored: ${error.message}`);
    } else {
      console.error(`Command failed: ${command}`);
      process.exit(1);
    }
  }
}

const versionType = process.argv[2];
if (!versionType) {
  console.error('Error: Please specify a version bump type (patch, minor, or major).');
  console.error('Example: node scripts/deploy_prod.js patch');
  process.exit(1);
}

console.log(`Starting production deployment with version bump: ${versionType}`);

// 1. Checkout master branch
runCommand('git checkout master');

// 2. Pull latest changes from master
runCommand('git pull origin master');

// 3. Increment the package version using yarn
runCommand(`yarn version --${versionType}`);

// 4. Push git changes
runCommand('git push');

// 5. Build docker image
runCommand('docker build . -t northamerica-northeast1-docker.pkg.dev/poaa-389702/api/poaa-api:latest');

// 6. Push docker image
runCommand('docker push northamerica-northeast1-docker.pkg.dev/poaa-389702/api/poaa-api:latest');

// 7. Deploy to GCloud Run
runCommand('gcloud run deploy poaa-api --image northamerica-northeast1-docker.pkg.dev/poaa-389702/api/poaa-api:latest --set-env-vars "NODE_ENV=production"');

console.log('Production deployment completed successfully!');
