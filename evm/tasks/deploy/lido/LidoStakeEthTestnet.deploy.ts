import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import {
  CONTRACT_NAME,
  DEFAULT_ENV,
  DEPLOY_LIDO_STAKE_ETH_TESTNET_ADAPTER,
  NATIVE,
  VERIFY_LIDO_STAKE_ETH_TESTNET_ADAPTER,
  WNATIVE,
} from "../../constants";
import { task } from "hardhat/config";
import {
  ContractType,
  IDeploymentAdapters,
  getDeployments,
  recordAllDeployments,
  saveDeployments,
} from "../../utils";
import {
  LIDO_ST_ETH,
  LIDO_REFERRAL_ADDRESS,
  LIDO_WST_ETH,
  LIDO_OPTIMISM_GATEWAY,
  SCROLL_MESSAGING_QUEUE,
  LIDO_SCROLL_GATEWAY,
} from "./constants";

const contractName: string = CONTRACT_NAME.LidoStakeEthTestnet;
const contractType = ContractType.LiquidStaking;

task(DEPLOY_LIDO_STAKE_ETH_TESTNET_ADAPTER)
  .addFlag("verify", "pass true to verify the contract")
  .setAction(async function (
    _taskArguments: TaskArguments,
    _hre: HardhatRuntimeEnvironment
  ) {
    let env = process.env.ENV;
    if (!env) env = DEFAULT_ENV;

    const network = await _hre.getChainId();

    console.log(`Deploying ${contractName} Contract on chainId ${network}....`);
    const factory = await _hre.ethers.getContractFactory(contractName);

    const instance = await factory.deploy(
      NATIVE,
      WNATIVE[env][network],
      LIDO_ST_ETH[network],
      LIDO_WST_ETH[network],
      LIDO_REFERRAL_ADDRESS,
      LIDO_OPTIMISM_GATEWAY[network],
      LIDO_SCROLL_GATEWAY[network],
      SCROLL_MESSAGING_QUEUE[network],
      LIDO_WST_ETH["11155420"]
    );

    await instance.deployed();

    const deployment = await recordAllDeployments(
      env,
      network,
      contractType,
      contractName,
      instance.address
    );

    await saveDeployments(contractType, deployment);

    console.log(`${contractName} contract deployed at`, instance.address);

    if (_taskArguments.verify === true) {
      await _hre.run(VERIFY_LIDO_STAKE_ETH_TESTNET_ADAPTER);
    }
  });

task(VERIFY_LIDO_STAKE_ETH_TESTNET_ADAPTER).setAction(async function (
  _taskArguments: TaskArguments,
  _hre: HardhatRuntimeEnvironment
) {
  let env = process.env.ENV;
  if (!env) env = DEFAULT_ENV;

  const network = await _hre.getChainId();

  const deployments = getDeployments(contractType) as IDeploymentAdapters;
  let address;
  for (let i = 0; i < deployments[env][network].length; i++) {
    if (deployments[env][network][i].name === contractName) {
      address = deployments[env][network][i].address;
      break;
    }
  }
  console.log(`Verifying ${contractName} Contract....`);
  await _hre.run("verify:verify", {
    address,
    constructorArguments: [
      NATIVE,
      WNATIVE[env][network],
      LIDO_ST_ETH[network],
      LIDO_WST_ETH[network],
      LIDO_REFERRAL_ADDRESS,
      LIDO_OPTIMISM_GATEWAY[network],
      LIDO_SCROLL_GATEWAY[network],
      SCROLL_MESSAGING_QUEUE[network],
      LIDO_WST_ETH["11155420"],
    ],
  });

  console.log(`Verified ${contractName} contract address `, address);
});
