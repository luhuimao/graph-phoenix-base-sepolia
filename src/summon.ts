import { DAOCreated as DAOCreatedEvent } from "../generated/Summon/Summon"
import { Dao } from "../generated/Summon/Dao"
import { DaoLens } from "../generated/Summon/DaoLens";

import {
  TreasuryDAOEntity,
  DaoEntiy,
  DaoEntityCounter,
  TreasuryDAOGovernorEligibilityInfo,
  TreasuryDAOVotingInfo
} from "../generated/schema"
import { BigInt, Address } from "@graphprotocol/graph-ts"

export function handleDAOCreated(event: DAOCreatedEvent): void {
  let daoEntity = new TreasuryDAOEntity(event.params._address.toHexString());
  daoEntity._address = event.params._address
  daoEntity._creator = event.params._creator
  daoEntity._name = event.params._name

  daoEntity.blockNumber = event.block.number
  daoEntity.blockTimestamp = event.block.timestamp
  daoEntity.transactionHash = event.transaction.hash

  const daoContr = Dao.bind(event.params._address);
  // uint internal constant MODULEID__PROPOSALS = 32;
  // uint internal constant MODULEID__DAO_LENS = 33;
  // uint internal constant MODULEID__VOTING = 34;
  const proposalsAddr = daoContr.moduleIdToProxy(
    BigInt.fromI32(32)
  );
  const daoLensAddr = daoContr.moduleIdToProxy(
    BigInt.fromI32(33)
  );
  const votingAddr = daoContr.moduleIdToProxy(
    BigInt.fromI32(34)
  );
  const configAddr = daoContr.moduleIdToProxy(
    BigInt.fromI32(2)
  );

  daoEntity._votingContractAddress = votingAddr;
  daoEntity._proposalContractAddress = proposalsAddr;
  daoEntity._configuratorContractAddress = configAddr;
  daoEntity._daoLenContractAddress = daoLensAddr;
  daoEntity.treasuryDAOGovernorEligibilityInfo = event.params._address.toHexString();
  daoEntity.treasuryDAOVotingInfo = event.params._address.toHexString();
  daoEntity.save();


  const daoFacAddr = "0xc01807627733edf3394f7f56dafa919c3590c00e"
  let allDaoEntity = DaoEntiy.load(event.params._address.toHexString());
  let counterEntity = DaoEntityCounter.load(daoFacAddr);

  if (!counterEntity) {
    counterEntity = new DaoEntityCounter(daoFacAddr);
    counterEntity.count = BigInt.fromI32(0);
  }

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!allDaoEntity) {
    allDaoEntity = new DaoEntiy(event.params._address.toHexString())
    allDaoEntity.daoAddr = event.params._address;
    allDaoEntity.daoName = event.params._name;
    allDaoEntity.creator = event.params._creator;
    allDaoEntity.daoType = "TreasuryDao";
    allDaoEntity.createTimeStamp = event.block.timestamp;
    // entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    allDaoEntity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).
      toString();

    counterEntity.count = counterEntity.count.plus(BigInt.fromI32(1));
  }

  allDaoEntity.save();
  counterEntity.save();

  let treasuryDAOGovernorEligibilityInfo = new TreasuryDAOGovernorEligibilityInfo(event.params._address.toHexString());
  let treasuryDAOVotingInfo = new TreasuryDAOVotingInfo(event.params._address.toHexString());


  let enable = false;
  let name = "";
  let verifyType = BigInt.zero();
  let minAmount = BigInt.zero();
  let tokenAddress = Address.empty();
  let tokenId = BigInt.zero();

  let supportType = BigInt.zero();
  let quorumType = BigInt.zero();
  let support = BigInt.zero();
  let quorum = BigInt.zero();
  let votingAssetType = BigInt.zero();
  let votingTokenAddress = Address.empty();
  let votingTokenID = BigInt.zero();
  let votingWeightedType = BigInt.zero();
  let votingPeriod = BigInt.zero();

  const daolens = DaoLens.bind(daoLensAddr);
  if (daolens) {
    const rel = daolens.try_governorEligibilityConfig();
    if (!rel.reverted) {

      enable = rel.value.governorEligibilityEnable;
      name = "";
      verifyType = BigInt.fromI32(rel.value.governanceEligibilityVerifyType);
      minAmount = rel.value.governanceEligibilityMinAmount;
      tokenAddress = rel.value.governanceEligibilityTokenAddress;
      tokenId = rel.value.governanceEligibilityTokenId;
    }

    const votingRel = daolens.try_governanceVotingConfig();
    if (!votingRel.reverted) {
      supportType = votingRel.value.supportType
      quorumType = votingRel.value.quorumType
      support = votingRel.value.support
      quorum = votingRel.value.quorum

      votingAssetType = votingRel.value.votingAssetType
      votingTokenAddress = votingRel.value.votingTokenAddress
      votingTokenID = votingRel.value.votingTokenId
      votingWeightedType = votingRel.value.votingWeightedType
      votingPeriod = votingRel.value.votingPeriod
    }
  }
  treasuryDAOGovernorEligibilityInfo.enable = enable;
  treasuryDAOGovernorEligibilityInfo.name = name;
  treasuryDAOGovernorEligibilityInfo.verifyType = verifyType;
  treasuryDAOGovernorEligibilityInfo.minAmount = minAmount;
  treasuryDAOGovernorEligibilityInfo.tokenAddress = tokenAddress;
  treasuryDAOGovernorEligibilityInfo.treasuryDAOEntity = event.params._address.toHexString();


  treasuryDAOVotingInfo.treasuryDAOEntity = event.params._address.toHexString();
  treasuryDAOVotingInfo.supportType = supportType;
  treasuryDAOVotingInfo.quorumType = quorumType;
  treasuryDAOVotingInfo.support = support;
  treasuryDAOVotingInfo.quorum = quorum;
  treasuryDAOVotingInfo.votingAssetType = votingAssetType;
  treasuryDAOVotingInfo.tokenAddress = votingTokenAddress;
  treasuryDAOVotingInfo.tokenID = votingTokenID;
  treasuryDAOVotingInfo.votingWeightedType = votingWeightedType;
  treasuryDAOVotingInfo.votingPeriod = votingPeriod;

  treasuryDAOGovernorEligibilityInfo.save();
  treasuryDAOVotingInfo.save();
}

