
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  // Deploy the SecureVoting contract
  const SecureVoting = await ethers.getContractFactory('SecureVoting');
  const secureVoting = await SecureVoting.deploy();

  await secureVoting.deployed();

  console.log('SecureVoting contract deployed to:', secureVoting.address);

  // Verify the contract on Etherscan (optional)
  if (network.name !== 'hardhat' && network.name !== 'localhost') {
    console.log('Waiting for block confirmations...');
    await secureVoting.deployTransaction.wait(6);
    
    console.log('Verifying contract on Etherscan...');
    try {
      await run('verify:verify', {
        address: secureVoting.address,
        constructorArguments: [],
      });
    } catch (e) {
      console.log('Verification failed:', e.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contractAddress: secureVoting.address,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: secureVoting.deployTransaction.blockNumber
  };

  console.log('Deployment Info:', JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
