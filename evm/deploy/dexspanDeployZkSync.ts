import { Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import {
  ASSET_FORWARDER,
  CONTRACT_NAME,
  DEFAULT_ENV,
  DEXSPAN,
  NATIVE,
  WNATIVE,
} from "../tasks/constants";
import {
  ContractType,
  recordAllDeployments,
  saveDeployments,
} from "../tasks/utils";

import dotenv from "dotenv";
dotenv.config();

const contractName = CONTRACT_NAME.DexSpanAdapter;
const contractType = ContractType.Swap;

// yarn hardhat deploy-zksync --script dexspanDeployZkSync.ts
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(
    `Running deploy script for the ${contractName} adapter on ZkSync`
  );

  let env = process.env.ENV;
  if (!env) env = DEFAULT_ENV;

  const network = hre.network;
  if (network == undefined) {
    return;
  }
  const chainId = network.config.chainId;
  if (chainId == undefined) {
    return;
  }

  const wallet = new Wallet(process.env.PRIVATE_KEY!);

  //@ts-ignore
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact(contractName);
  const instance = await deployer.deploy(artifact, [
    NATIVE,
    WNATIVE[env][chainId],
    DEXSPAN[env][chainId],
  ]);
  const addr = instance.address;

  const deployment = await recordAllDeployments(
    env,
    chainId.toString(),
    contractType,
    contractName,
    addr
  );

  await saveDeployments(contractType, deployment);

  console.log(`${contractName} was deployed at ${addr}`);
}
