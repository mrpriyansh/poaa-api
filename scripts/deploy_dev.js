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

console.log('Starting cross-platform development deployment...');

// 1. Try to kill the existing container if it exists
runCommand('docker container kill poaa-api', true);

// 2. Try to remove the existing container if it exists
runCommand('docker container remove poaa-api', true);

// 3. Build the Docker image
runCommand(
  'docker build . -t northamerica-northeast1-docker.pkg.dev/poaa-389702/api/poaa-api:latest'
);

// 4. Run the new Docker container
runCommand(
  'docker run -d -p 4000:8080 --env NODE_ENV=development --name poaa-api northamerica-northeast1-docker.pkg.dev/poaa-389702/api/poaa-api:latest'
);

console.log('Deployment completed successfully!');
