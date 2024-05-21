/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-22 15:32:03
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-16 14:28:21
 */
import { BigInt, Bytes, Address, log, bigInt } from "@graphprotocol/graph-ts"
// import {
//     FlexDaoSetAdapterContract,
//     ProposalCreated,
//     ProposalProcessed
// } from "../generated/FlexDaoSetAdapterContract/FlexDaoSetAdapterContract";

import {
    FlexDaoSetPollingAdapterContract,
    ProposalCreated as PollingProposalCreated,
    ProposalProcessed as PollingProposalProcessed
} from "../generated/FlexDaoSetPollingAdapterContract/FlexDaoSetPollingAdapterContract";

import {
    FlexDaoSetVotingAdapterContract,
    ProposalCreated as VotingProposalCreated,
    ProposalProcessed as VotingProposalProcessed
} from "../generated/FlexDaoSetVotingAdapterContract/FlexDaoSetVotingAdapterContract";

import {
    FlexDaoSetFeesAdapterContract,
    ProposalCreated as FeesProposalCreated,
    ProposalProcessed as FeesProposalProcessed
} from "../generated/FlexDaoSetFeesAdapterContract/FlexDaoSetFeesAdapterContract";

import {
    FlexDaoSetGovernorMembershipAdapterContract,
    ProposalCreated as GovernorMembershipProposalCreated,
    ProposalProcessed as GovernorMembershipProposalProcessed
} from "../generated/FlexDaoSetGovernorMembershipAdapterContract/FlexDaoSetGovernorMembershipAdapterContract";

import {
    FlexDaoSetInvestorCapAdapterContract,
    ProposalCreated as InvestorCapProposalCreated,
    ProposalProcessed as InvestorCapProposalProcessed
} from "../generated/FlexDaoSetInvestorCapAdapterContract/FlexDaoSetInvestorCapAdapterContract";

import {
    FlexDaoSetInvestorMembershipAdapterContract,
    ProposalCreated as InvestorMembershipProposalCreated,
    ProposalProcessed as InvestorMembershipProposalProcessed
} from "../generated/FlexDaoSetInvestorMembershipAdapterContract/FlexDaoSetInvestorMembershipAdapterContract";

import {
    FlexDaoSetProposerMembershipAdapterContract,
    ProposalCreated as ProposerMembershipProposalCreated,
    ProposalProcessed as ProposerMembershipProposalProcessed
} from "../generated/FlexDaoSetProposerMembershipAdapterContract/FlexDaoSetProposerMembershipAdapterContract";

import { FlexPollingVotingContract } from "../generated/FlexDaoSetAdapterContract/FlexPollingVotingContract";
import { DaoRegistry } from "../generated/FlexDaoSetAdapterContract/DaoRegistry";
import { StewardManagementContract } from "../generated/FlexDaoSetAdapterContract/StewardManagementContract";
import { FlexInvestmentPoolAdapterContract } from "../generated/FlexDaoSetAdapterContract/FlexInvestmentPoolAdapterContract";
import { FlexFundingAdapterContract } from "../generated/FlexDaoSetAdapterContract/FlexFundingAdapterContract";

import {
    FlexDaosetProposal,
    FlexProposalVoteInfo,
    FlexDaoInvestorCapacityEntity,
    FlexDaoStewardMembershipEntity,
    FlexDaoInvestorMembershipEntity,
    FlexDaoVoteConfigEntity,
    FlexDaoFeeInfoEntity,
    FlexDaoProposerMembershipEntity,
    FlexDaoPollingInfoEntity,
    FlexDaoPollVoterMembershipEntity
} from "../generated/schema"

export function handlePollingProposalCreated(event: PollingProposalCreated): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new FlexDaosetProposal(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.proposer = event.transaction.from;
    entity.executeHash = Bytes.empty();
    entity.proposalType = BigInt.fromI32(event.params.pType);
    // INVESTOR_CAP,
    // GOVERNOR_MEMBERSHIP,
    // INVESTOR_MEMBERSHIP,
    // VOTING,
    // FEES,
    // PROPOSER_MEMBERHSIP,
    // POLL_FOR_INVESTMENT

    entity.proposalTypeString = "POLL_FOR_INVESTMENT";
    entity.state = BigInt.fromI32(0);
    entity.creationTime = event.block.timestamp;
    entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleVotingProposalCreated(event: PollingProposalCreated): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new FlexDaosetProposal(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.proposer = event.transaction.from;
    entity.executeHash = Bytes.empty();
    entity.proposalType = BigInt.fromI32(event.params.pType);
    // INVESTOR_CAP,
    // GOVERNOR_MEMBERSHIP,
    // INVESTOR_MEMBERSHIP,
    // VOTING,
    // FEES,
    // PROPOSER_MEMBERHSIP,
    // POLL_FOR_INVESTMENT

    entity.proposalTypeString = "VOTING";
    entity.state = BigInt.fromI32(0);
    entity.creationTime = event.block.timestamp;
    entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleFeesProposalCreated(event: PollingProposalCreated): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new FlexDaosetProposal(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.proposer = event.transaction.from;
    entity.executeHash = Bytes.empty();
    entity.proposalType = BigInt.fromI32(event.params.pType);
    // INVESTOR_CAP,
    // GOVERNOR_MEMBERSHIP,
    // INVESTOR_MEMBERSHIP,
    // VOTING,
    // FEES,
    // PROPOSER_MEMBERHSIP,
    // POLL_FOR_INVESTMENT

    entity.proposalTypeString = "FEES";
    entity.state = BigInt.fromI32(0);
    entity.creationTime = event.block.timestamp;
    entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleGovernorMembershipProposalCreated(event: PollingProposalCreated): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new FlexDaosetProposal(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.proposer = event.transaction.from;
    entity.executeHash = Bytes.empty();
    entity.proposalType = BigInt.fromI32(event.params.pType);
    // INVESTOR_CAP,
    // GOVERNOR_MEMBERSHIP,
    // INVESTOR_MEMBERSHIP,
    // VOTING,
    // FEES,
    // PROPOSER_MEMBERHSIP,
    // POLL_FOR_INVESTMENT

    entity.proposalTypeString = "GOVERNOR_MEMBERSHIP";
    entity.state = BigInt.fromI32(0);
    entity.creationTime = event.block.timestamp;
    entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleInvestorCapProposalCreated(event: PollingProposalCreated): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new FlexDaosetProposal(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.proposer = event.transaction.from;
    entity.executeHash = Bytes.empty();
    entity.proposalType = BigInt.fromI32(event.params.pType);
    // INVESTOR_CAP,
    // GOVERNOR_MEMBERSHIP,
    // INVESTOR_MEMBERSHIP,
    // VOTING,
    // FEES,
    // PROPOSER_MEMBERHSIP,
    // POLL_FOR_INVESTMENT

    entity.proposalTypeString = "INVESTOR_CAP";
    entity.state = BigInt.fromI32(0);
    entity.creationTime = event.block.timestamp;
    entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleInvestorMembershipProposalCreated(event: PollingProposalCreated): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new FlexDaosetProposal(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.proposer = event.transaction.from;
    entity.executeHash = Bytes.empty();
    entity.proposalType = BigInt.fromI32(event.params.pType);
    // INVESTOR_CAP,
    // GOVERNOR_MEMBERSHIP,
    // INVESTOR_MEMBERSHIP,
    // VOTING,
    // FEES,
    // PROPOSER_MEMBERHSIP,
    // POLL_FOR_INVESTMENT

    entity.proposalTypeString = "INVESTOR_MEMBERSHIP";
    entity.state = BigInt.fromI32(0);
    entity.creationTime = event.block.timestamp;
    entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleProposerMembershipProposalCreated(event: PollingProposalCreated): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new FlexDaosetProposal(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.proposer = event.transaction.from;
    entity.executeHash = Bytes.empty();
    entity.proposalType = BigInt.fromI32(event.params.pType);
    // INVESTOR_CAP,
    // GOVERNOR_MEMBERSHIP,
    // INVESTOR_MEMBERSHIP,
    // VOTING,
    // FEES,
    // PROPOSER_MEMBERHSIP,
    // POLL_FOR_INVESTMENT

    entity.proposalTypeString = "PROPOSER_MEMBERHSIP";
    entity.state = BigInt.fromI32(0);
    entity.creationTime = event.block.timestamp;
    entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}



// export function handlePollingProposalProcessed(event: PollingProposalProcessed): void {
//     let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())
//     const flexDaosetContract = FlexDaoSetAdapterContract.bind(event.address);
//     const daoContract = DaoRegistry.bind(event.params.daoAddr);
//     const contractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753"));
//     const governorContract = StewardManagementContract.bind(contractAddr);
//     const fundingPoolcontractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c"));
//     const flexInvestmentPoolAdapterContract = FlexInvestmentPoolAdapterContract.bind(fundingPoolcontractAddr);
//     const fundingContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda"));
//     const fundingContract = FlexFundingAdapterContract.bind(fundingContractAddr);

//     const flexDaosetVotingContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7"));
//     const flexDaosetPollingContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f"));
//     const flexDaosetVotingContract = FlexDaoSetVotingAdapterContract.bind(flexDaosetVotingContractAddr);
//     const flexDaosetPollingContract = FlexDaoSetPollingAdapterContract.bind(flexDaosetPollingContractAddr);
//     let proposalState = BigInt.fromI32(0);
//     if (entity) {
//         switch (entity.proposalType.toI32()) {
//             case 0:
//                 proposalState = BigInt.fromI32(flexDaosetContract.investorCapProposals(event.params.daoAddr,
//                     event.params.proposalId).getState());

//                 if (proposalState == BigInt.fromI32(2)) {
//                     const MAX_INVESTORS_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x69f4ffb3ebcb7809550bddd3e4d449a47e737bf6635bc7a730996643997b0e48"));
//                     const MAX_INVESTORS = daoContract.getConfiguration(Bytes.fromHexString("0xecbde689cc6337d29a750b8b8a8abbfa97427b4ac800ab55be2f2c87311510f2"));
//                     let flexDaoInvestorCapacityEntity = FlexDaoInvestorCapacityEntity.load(event.params.daoAddr.toHexString());
//                     if (flexDaoInvestorCapacityEntity) {
//                         flexDaoInvestorCapacityEntity.enable = MAX_INVESTORS_ENABLE == BigInt.fromI32(1) ? true : false;
//                         flexDaoInvestorCapacityEntity.capacityAmount = MAX_INVESTORS;
//                         flexDaoInvestorCapacityEntity.save();
//                     }
//                 }
//                 break;
//             case 1:
//                 proposalState = BigInt.fromI32(flexDaosetContract.governorMembershipProposals(event.params.daoAddr,
//                     event.params.proposalId).getState());
//                 if (proposalState == BigInt.fromI32(2)) {
//                     let flexDaoStewardMembershipEntity = FlexDaoStewardMembershipEntity.load(event.params.daoAddr.toHexString());
//                     if (flexDaoStewardMembershipEntity) {

//                         const FLEX_GOVERNOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x71ecc01da16acc23ab0eca549b0aaa7659ae183a220304fe5072243bc984fd79"));
//                         const FLEX_GOVERNOR_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x84580f9d926113d2c801e908a914b652340b3d8527c171bcea8d1868e92a507c"));
//                         const FLEX_GOVERNOR_MEMBERSHIP_MINI_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0x50c40dbbb38d5b02b04e0c6d7be02f4391fc8c14a98860284871ef1834c8390b"));
//                         const FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x0bfac56541ded449415df8f96f54b002e55665d7fd2fafc884184e8c17f3c772"));
//                         const FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ID = daoContract.getConfiguration(Bytes.fromHexString("0x93cc40268a57b3f7e5eb22a016a12d19010736289cceac5742a116fea3491b35"));
//                         const FLEX_GOVERNOR_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0xe6fc898f462d48724eb27b66193f38e8f83f214469eb3145fe9431a89411e724"));
//                         const whitelist = governorContract.getGovernorWhitelist(event.params.daoAddr);
//                         let tem: string[] = [];

//                         if (whitelist.length > 0) {
//                             for (let j = 0; j < whitelist.length; j++) {
//                                 tem.push(whitelist[j].toHexString())
//                             }
//                         }

//                         flexDaoStewardMembershipEntity.enable = FLEX_GOVERNOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
//                         flexDaoStewardMembershipEntity.name = FLEX_GOVERNOR_MEMBERSHIP_NAME;
//                         flexDaoStewardMembershipEntity.varifyType = FLEX_GOVERNOR_MEMBERSHIP_TYPE;
//                         flexDaoStewardMembershipEntity.minHolding = FLEX_GOVERNOR_MEMBERSHIP_MINI_HOLDING;
//                         flexDaoStewardMembershipEntity.tokenAddress = FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS;
//                         flexDaoStewardMembershipEntity.tokenId = FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ID;
//                         flexDaoStewardMembershipEntity.whiteList = tem;

//                         flexDaoStewardMembershipEntity.save();
//                     }
//                 }

//                 break;
//             case 2:
//                 proposalState = BigInt.fromI32(flexDaosetContract.investorMembershipProposals(event.params.daoAddr,
//                     event.params.proposalId).getState());
//                 if (proposalState == BigInt.fromI32(2)) {
//                     let flexDaoInvestorMembershipEntity = FlexDaoInvestorMembershipEntity.load(event.params.daoAddr.toHexString());
//                     if (flexDaoInvestorMembershipEntity) {
//                         const FLEX_INVESTOR_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x77041e0d128001928f30b976713fed530b452bc354a9bad49ad1bcf93121f9dc"));
//                         const FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0xcab672166d6a1c8dae3ca0b03fed2e7258db17c3c3801ac2651987b066d39647"));
//                         const FLEX_INVESTOR_MEMBERSHIP_TOKENID = daoContract.getConfiguration(Bytes.fromHexString("0xcdc3057ec9c82a3ea3fd34ef56b1825924525fbab071e1a2b9d664a07f400480"));
//                         const FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x0f57fc3a39a8a66c31f52eab69ced65d5ac74e4a182b215146a45a0281de53e8"));
//                         const FLEX_INVESTOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0xfeddffed075d0686e697569ece0ce2fd26bfbbb18719086f36d16c7117edb553"));
//                         const FLEX_INVESTOR_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0xfd9a8d4692ffc545577ff1979a0a918c2b536b6b6a891cf324a93b2c43907f83"));

//                         const whitelist = flexInvestmentPoolAdapterContract.getParticipanWhitelist(event.params.daoAddr);
//                         let tem: string[] = [];

//                         if (whitelist.length > 0) {
//                             for (let j = 0; j < whitelist.length; j++) {
//                                 tem.push(whitelist[j].toHexString())
//                             }
//                         }

//                         flexDaoInvestorMembershipEntity.enable = FLEX_INVESTOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
//                         flexDaoInvestorMembershipEntity.name = FLEX_INVESTOR_MEMBERSHIP_NAME;
//                         flexDaoInvestorMembershipEntity.whiteList = tem;
//                         flexDaoInvestorMembershipEntity.varifyType = FLEX_INVESTOR_MEMBERSHIP_TYPE;
//                         flexDaoInvestorMembershipEntity.tokenId = FLEX_INVESTOR_MEMBERSHIP_TOKENID;
//                         flexDaoInvestorMembershipEntity.tokenAddress = FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS;
//                         flexDaoInvestorMembershipEntity.minHolding = FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING;
//                         flexDaoInvestorMembershipEntity.save();
//                     }
//                 }

//                 break;
//             case 3:
//                 proposalState = BigInt.fromI32(flexDaosetVotingContract.votingProposals(event.params.daoAddr,
//                     event.params.proposalId).getState());
//                 if (proposalState == BigInt.fromI32(2)) {
//                     let flexDaoVoteConfigEntity = FlexDaoVoteConfigEntity.load(event.params.daoAddr.toHexString());
//                     if (flexDaoVoteConfigEntity) {
//                         const votingPeriod = daoContract.getConfiguration(Bytes.fromHexString("0x9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc"));
//                         const support = daoContract.getConfiguration(Bytes.fromHexString("0xb4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df32"));
//                         const votingAsset = daoContract.getConfiguration(Bytes.fromHexString("0x75b7d343967750d1f6c15979b7559cea8be22ff1a06a51681b9cbef0d2fff4fe"));
//                         const weightAlgorithm = daoContract.getConfiguration(Bytes.fromHexString("0x18ef0b57fe939edb640a200fdf533493bd8f26a274151543a109b64c857e20f3"));
//                         const tokenId = daoContract.getConfiguration(Bytes.fromHexString("0x77b1580d1632c74a32483c26a7156260a89ae4138b020ea7d09b0dcf24f1ea24"));
//                         const quorum = daoContract.getConfiguration(Bytes.fromHexString("0x0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e7"));
//                         const contractAddr = daoContract.getAddressConfiguration(Bytes.fromHexString("0xb5a1ad3f04728d7c38547e3d43006a1ec090a02fce04bbb1d0ee4519a1921e57"));
//                         const supportType = daoContract.getConfiguration(Bytes.fromHexString("0xe815a3c082eed7f7f7baab546f11a8718682c0eb3017b099ddc301a92f6673e3"));
//                         const quorumType = daoContract.getConfiguration(Bytes.fromHexString("0x730faccfe82f70711a34ce5202c6e1b1f79f421c16fcef745a9d92d06a7c0d4c"));

//                         flexDaoVoteConfigEntity.contractAddr = contractAddr;
//                         flexDaoVoteConfigEntity.weightAlgorithm = weightAlgorithm;
//                         flexDaoVoteConfigEntity.votingPeriod = votingPeriod;
//                         flexDaoVoteConfigEntity.votingAsset = votingAsset;
//                         flexDaoVoteConfigEntity.tokenId = tokenId;
//                         flexDaoVoteConfigEntity.support = support;
//                         flexDaoVoteConfigEntity.quorum = quorum;
//                         flexDaoVoteConfigEntity.supportType = supportType;
//                         flexDaoVoteConfigEntity.quorumType = quorumType;

//                         if (votingAsset == BigInt.fromI32(3)) {
//                             const rel = flexDaosetVotingContract.try_getAllocations(event.params.daoAddr, event.params.proposalId);
//                             if (!rel.reverted && rel.value.getValue0().length > 0) {
//                                 let tem1: string[] = [];
//                                 let tem2: BigInt[] = [];
//                                 for (let j = 0; j < rel.value.getValue0().length; j++) {
//                                     tem1.push(rel.value.getValue0()[j].toHexString());
//                                     tem2.push(rel.value.getValue1()[j]);
//                                 }
//                                 flexDaoVoteConfigEntity.governors = tem1;
//                                 flexDaoVoteConfigEntity.allocations = tem2;
//                             }
//                         }
//                         flexDaoVoteConfigEntity.save();
//                     }
//                 }
//                 break;
//             case 4:
//                 entity.proposalTypeString = "FEES";
//                 proposalState = BigInt.fromI32(flexDaosetContract.feesProposals(event.params.daoAddr,
//                     event.params.proposalId).getState());
//                 if (proposalState == BigInt.fromI32(2)) {
//                     let flexDaoFeeInfoEntity = FlexDaoFeeInfoEntity.load(event.params.daoAddr.toHexString());
//                     if (flexDaoFeeInfoEntity) {
//                         const FLEX_MANAGEMENT_FEE_AMOUNT = daoContract.getConfiguration(Bytes.fromHexString("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87"));
//                         const FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT = daoContract.getConfiguration(Bytes.fromHexString("0xea659d8e1a730b10af1cecb4f8ee391adf80e75302d6aaeb9642dc8a4a5e5dbb"));
//                         const FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x8987d08c67963e4cacd5e5936c122a968c66853d58299dd822c1942227109839"));

//                         flexDaoFeeInfoEntity.feeReceiver = FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS;
//                         flexDaoFeeInfoEntity.managementFee = FLEX_MANAGEMENT_FEE_AMOUNT;
//                         flexDaoFeeInfoEntity.payTokenManagementFee = FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT;
//                         flexDaoFeeInfoEntity.save();
//                     }
//                 }

//                 break;
//             case 5:
//                 proposalState = BigInt.fromI32(flexDaosetContract.proposerMembershipProposals(event.params.daoAddr,
//                     event.params.proposalId).getState());
//                 if (proposalState == BigInt.fromI32(2)) {
//                     let flexDaoProposerMembershipEntity = FlexDaoProposerMembershipEntity.load(event.params.daoAddr.toHexString());
//                     if (flexDaoProposerMembershipEntity) {
//                         const FLEX_PROPOSER_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x2073e6ba5c75026b006fdd165596d94b89cada2e00d8e44a99d422de8ea467e0"));
//                         const FLEX_PROPOSER_IDENTIFICATION_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x57901982635f8a470a3648422f8f769cf08dc2057489be5bf0099fcb44f7d43c"));
//                         const FLEX_PROPOSER_TOKENID = daoContract.getConfiguration(Bytes.fromHexString("0xb34f156369747125f679c86d97f51861a5a2a9f927a1addd4354acbaaa88ae57"));
//                         const FLEX_PROPOSER_MIN_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0xf6d5f030b79ca78dad001b87a49239ec96be97e62d13501da94c9a392700509e"));
//                         const FLEX_PROPOSER_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x30091caaedd0994beeeeb3b7b5734296263687ae0126aaf79e5e0f8e5c1706b2"));
//                         const FLEX_PROPOSER_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0xed2fa238da16f9e9bea8f1aa8dc2f0d04c522f8adbda71cc4ea5c11f5a51f32d"));
//                         let tem: string[] = [];

//                         const whitelist = fundingContract.getProposerWhitelist(event.params.daoAddr);
//                         if (whitelist.length > 0) {
//                             for (let j = 0; j < whitelist.length; j++) {
//                                 tem.push(whitelist[j].toHexString())
//                             }
//                         }

//                         flexDaoProposerMembershipEntity.proposerMembershipEnable = FLEX_PROPOSER_ENABLE == BigInt.fromI32(1) ? true : false;
//                         flexDaoProposerMembershipEntity.name = FLEX_PROPOSER_MEMBERSHIP_NAME;
//                         flexDaoProposerMembershipEntity.varifyType = FLEX_PROPOSER_IDENTIFICATION_TYPE;
//                         flexDaoProposerMembershipEntity.minHolding = FLEX_PROPOSER_MIN_HOLDING;
//                         flexDaoProposerMembershipEntity.tokenAddress = FLEX_PROPOSER_TOKEN_ADDRESS;
//                         flexDaoProposerMembershipEntity.tokenId = FLEX_PROPOSER_TOKENID;
//                         flexDaoProposerMembershipEntity.whiteList = tem;

//                         flexDaoProposerMembershipEntity.save();
//                     }
//                 }

//                 break;
//             case 6:
//                 proposalState = BigInt.fromI32(flexDaosetPollingContract.pollForInvestmentProposals(event.params.daoAddr,
//                     event.params.proposalId).getState());
//                 if (proposalState == BigInt.fromI32(2)) {
//                     let flexDaoPollingInfoEntity = FlexDaoPollingInfoEntity.load(event.params.daoAddr.toHexString());
//                     if (flexDaoPollingInfoEntity) {
//                         const FLEX_POLLING_VOTING_PERIOD = daoContract.getConfiguration(Bytes.fromHexString("0xee63cc82ca6990a4cc5fa3ca10d8a5281ae1758a8d8f22892c4badb7cacd111e"));
//                         const FLEX_POLLING_VOTING_POWER = daoContract.getConfiguration(Bytes.fromHexString("0x18ccfaf5deb9f2b0bd666344fa9c46950fbcee85fbfd05c3959876dfe502c209"));
//                         const FLEX_POLLING_SUPER_MAJORITY = daoContract.getConfiguration(Bytes.fromHexString("0x777270e51451e60c2ce5118fc8e5844441dcc4d102e9052e60fb41312dbb848a"));
//                         const FLEX_POLLING_QUORUM = daoContract.getConfiguration(Bytes.fromHexString("0x7789eea44dccd66529026559d1b36215cb5766016b41a8a8f16e08b2ec875837"));
//                         const FLEX_POLL_VOTING_WEIGHTED_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0xf873703084a7a9b6b81a595d5038f888fd90f4f9a530d4950a46c89eab021188"));
//                         const FLEX_POLL_VOTING_ASSET_TOKEN_ID = daoContract.getConfiguration(Bytes.fromHexString("0x4e640b0dd9bf7618f23df95b8d516df2ff38868970d2d109c5b4b0455980659f"));
//                         const FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0xa23a2786abcf8c551ce7fba1966ec456144d9caa0db070879d03a4ea4fd9b2fd"));
//                         const FLEX_INVESTMENT_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x6e9fd67c3f2ca4e2b4e4b45b33b985dc3a1bffcadea24d12440a5901f72217b5"));


//                         flexDaoPollingInfoEntity.enable = FLEX_INVESTMENT_TYPE == BigInt.fromI32(1) ? true : false;
//                         flexDaoPollingInfoEntity.votingPower = FLEX_POLLING_VOTING_POWER;
//                         flexDaoPollingInfoEntity.votingPeriod = FLEX_POLLING_VOTING_PERIOD;
//                         flexDaoPollingInfoEntity.votingAssetType = FLEX_POLL_VOTING_WEIGHTED_TYPE;
//                         flexDaoPollingInfoEntity.tokenID = FLEX_POLL_VOTING_ASSET_TOKEN_ID;
//                         flexDaoPollingInfoEntity.tokenAddress = FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS;
//                         flexDaoPollingInfoEntity.support = FLEX_POLLING_SUPER_MAJORITY;
//                         flexDaoPollingInfoEntity.quorum = FLEX_POLLING_QUORUM;
//                         flexDaoPollingInfoEntity.save();
//                     }
//                     let pollVoterMembershipEntity = FlexDaoPollVoterMembershipEntity.load(event.params.daoAddr.toHexString());
//                     if (pollVoterMembershipEntity) {
//                         const tokenId = daoContract.getConfiguration(Bytes.fromHexString("0xf2b332c307ef460e99eb866928b78eca9f8af0da0626b4b48a13f9b52842fa6a"));
//                         const type = daoContract.getConfiguration(Bytes.fromHexString("0x249486eeae30287051f65673dfa390711fd4587950c33b4150a633763f869724"));
//                         const tokenAddress = daoContract.getAddressConfiguration(Bytes.fromHexString("0x770ef80745dba2953f780c8b963701e76fd3ac982923200f9214126e80f5f032"));
//                         const miniHoldingAmount = daoContract.getConfiguration(Bytes.fromHexString("0x6839e94cab6f83f7a12a5a3d1d6f3bbcaf0185a49b20b86e6f47b8c78494ac3d"));
//                         const FLEX_POLLVOTER_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0x7bd63360ec775df97ced77d73875245296c41d88ebf2b52f8e630b4e9a51b448"));
//                         const flexPollingVotingContrctAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610"))
//                         const pollingVotingContract = FlexPollingVotingContract.bind(flexPollingVotingContrctAddr);
//                         const FLEX_FUNDING_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x6e9fd67c3f2ca4e2b4e4b45b33b985dc3a1bffcadea24d12440a5901f72217b5"));
//                         pollVoterMembershipEntity.contractAddr = tokenAddress;
//                         pollVoterMembershipEntity.daoAddr = event.params.daoAddr;
//                         pollVoterMembershipEntity.name = FLEX_POLLVOTER_MEMBERSHIP_NAME;
//                         pollVoterMembershipEntity.type = type;
//                         pollVoterMembershipEntity.tokenId = tokenId;
//                         pollVoterMembershipEntity.miniHoldingAmount = miniHoldingAmount;
//                         pollVoterMembershipEntity.enable = FLEX_FUNDING_TYPE == BigInt.fromI32(1) ? true : false;

//                         const whitelist = pollingVotingContract.try_getWhitelist(event.params.daoAddr);
//                         let tem: string[] = [];

//                         if (!whitelist.reverted && whitelist.value.length > 0) {
//                             for (let j = 0; j < whitelist.value.length; j++) {
//                                 tem.push(whitelist.value[j].toHexString())
//                             }
//                         }

//                         pollVoterMembershipEntity.whiteList = tem;
//                         pollVoterMembershipEntity.save();
//                     }
//                 }

//                 break;
//             default:
//                 // proposalState = BigInt.fromI32(0);
//                 break;
//         }
//         entity.state = proposalState;
//         entity.executeHash = event.transaction.hash;
//         entity.save();
//     }

//     let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());

//     if (voteInfoEntity) {
//         voteInfoEntity.nbYes = event.params.nbYes;
//         voteInfoEntity.nbNo = event.params.nbNo;
//         voteInfoEntity.totalWeights = event.params.allVotingWeight;
//         voteInfoEntity.save();
//     }
// }

export function handlePollingProposalProcessed(event: PollingProposalProcessed): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    const daoContract = DaoRegistry.bind(event.params.daoAddr);
    const flexDaosetPollingContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x5f0e8d109045653360289a7a02d5dc2a99e382006a42ef93f66de55ecff3176f"));
    const flexDaosetPollingContract = FlexDaoSetPollingAdapterContract.bind(flexDaosetPollingContractAddr);

    let proposalState = BigInt.fromI32(flexDaosetPollingContract.pollForInvestmentProposals(event.params.daoAddr,
        event.params.proposalId).getState());
    if (proposalState == BigInt.fromI32(2)) {
        let flexDaoPollingInfoEntity = FlexDaoPollingInfoEntity.load(event.params.daoAddr.toHexString());
        if (flexDaoPollingInfoEntity) {
            const FLEX_POLLING_VOTING_PERIOD = daoContract.getConfiguration(Bytes.fromHexString("0xee63cc82ca6990a4cc5fa3ca10d8a5281ae1758a8d8f22892c4badb7cacd111e"));
            const FLEX_POLLING_VOTING_POWER = daoContract.getConfiguration(Bytes.fromHexString("0x18ccfaf5deb9f2b0bd666344fa9c46950fbcee85fbfd05c3959876dfe502c209"));
            const FLEX_POLLING_SUPER_MAJORITY = daoContract.getConfiguration(Bytes.fromHexString("0x777270e51451e60c2ce5118fc8e5844441dcc4d102e9052e60fb41312dbb848a"));
            const FLEX_POLLING_QUORUM = daoContract.getConfiguration(Bytes.fromHexString("0x7789eea44dccd66529026559d1b36215cb5766016b41a8a8f16e08b2ec875837"));
            const FLEX_POLL_VOTING_WEIGHTED_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0xf873703084a7a9b6b81a595d5038f888fd90f4f9a530d4950a46c89eab021188"));
            const FLEX_POLL_VOTING_ASSET_TOKEN_ID = daoContract.getConfiguration(Bytes.fromHexString("0x4e640b0dd9bf7618f23df95b8d516df2ff38868970d2d109c5b4b0455980659f"));
            const FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0xa23a2786abcf8c551ce7fba1966ec456144d9caa0db070879d03a4ea4fd9b2fd"));
            const FLEX_INVESTMENT_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x6e9fd67c3f2ca4e2b4e4b45b33b985dc3a1bffcadea24d12440a5901f72217b5"));


            flexDaoPollingInfoEntity.enable = FLEX_INVESTMENT_TYPE == BigInt.fromI32(1) ? true : false;
            flexDaoPollingInfoEntity.votingPower = FLEX_POLLING_VOTING_POWER;
            flexDaoPollingInfoEntity.votingPeriod = FLEX_POLLING_VOTING_PERIOD;
            flexDaoPollingInfoEntity.votingAssetType = FLEX_POLL_VOTING_WEIGHTED_TYPE;
            flexDaoPollingInfoEntity.tokenID = FLEX_POLL_VOTING_ASSET_TOKEN_ID;
            flexDaoPollingInfoEntity.tokenAddress = FLEX_POLL_VOTING_ASSET_TOKEN_ADDRESS;
            flexDaoPollingInfoEntity.support = FLEX_POLLING_SUPER_MAJORITY;
            flexDaoPollingInfoEntity.quorum = FLEX_POLLING_QUORUM;
            flexDaoPollingInfoEntity.save();
        }
        let pollVoterMembershipEntity = FlexDaoPollVoterMembershipEntity.load(event.params.daoAddr.toHexString());
        if (pollVoterMembershipEntity) {
            const tokenId = daoContract.getConfiguration(Bytes.fromHexString("0xf2b332c307ef460e99eb866928b78eca9f8af0da0626b4b48a13f9b52842fa6a"));
            const type = daoContract.getConfiguration(Bytes.fromHexString("0x249486eeae30287051f65673dfa390711fd4587950c33b4150a633763f869724"));
            const tokenAddress = daoContract.getAddressConfiguration(Bytes.fromHexString("0x770ef80745dba2953f780c8b963701e76fd3ac982923200f9214126e80f5f032"));
            const miniHoldingAmount = daoContract.getConfiguration(Bytes.fromHexString("0x6839e94cab6f83f7a12a5a3d1d6f3bbcaf0185a49b20b86e6f47b8c78494ac3d"));
            const FLEX_POLLVOTER_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0x7bd63360ec775df97ced77d73875245296c41d88ebf2b52f8e630b4e9a51b448"));
            const flexPollingVotingContrctAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610"))
            const pollingVotingContract = FlexPollingVotingContract.bind(flexPollingVotingContrctAddr);
            const FLEX_FUNDING_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x6e9fd67c3f2ca4e2b4e4b45b33b985dc3a1bffcadea24d12440a5901f72217b5"));
            pollVoterMembershipEntity.contractAddr = tokenAddress;
            pollVoterMembershipEntity.daoAddr = event.params.daoAddr;
            pollVoterMembershipEntity.name = FLEX_POLLVOTER_MEMBERSHIP_NAME;
            pollVoterMembershipEntity.type = type;
            pollVoterMembershipEntity.tokenId = tokenId;
            pollVoterMembershipEntity.miniHoldingAmount = miniHoldingAmount;
            pollVoterMembershipEntity.enable = FLEX_FUNDING_TYPE == BigInt.fromI32(1) ? true : false;

            const whitelist = pollingVotingContract.try_getWhitelist(event.params.daoAddr);
            let tem: string[] = [];

            if (!whitelist.reverted && whitelist.value.length > 0) {
                for (let j = 0; j < whitelist.value.length; j++) {
                    tem.push(whitelist.value[j].toHexString())
                }
            }

            pollVoterMembershipEntity.whiteList = tem;
            pollVoterMembershipEntity.save();
        }
    }

    if (entity) {
        entity.state = proposalState;
        entity.executeHash = event.transaction.hash;
        entity.save();
    }

    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}

export function handleVotingProposalProcessed(event: VotingProposalProcessed): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    const daoContract = DaoRegistry.bind(event.params.daoAddr);
    const flexDaosetVotingContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x8ceb7c7dc4c27ecfdcfd7ab759513c13202213bb0305fcd8889452f229d798e7"));
    const flexDaosetVotingContract = FlexDaoSetVotingAdapterContract.bind(flexDaosetVotingContractAddr);


    let proposalState = BigInt.fromI32(flexDaosetVotingContract.votingProposals(event.params.daoAddr,
        event.params.proposalId).getState());
    if (proposalState == BigInt.fromI32(2)) {
        let flexDaoVoteConfigEntity = FlexDaoVoteConfigEntity.load(event.params.daoAddr.toHexString());
        if (flexDaoVoteConfigEntity) {
            const votingPeriod = daoContract.getConfiguration(Bytes.fromHexString("0x9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc"));
            const support = daoContract.getConfiguration(Bytes.fromHexString("0xb4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df32"));
            const votingAsset = daoContract.getConfiguration(Bytes.fromHexString("0x75b7d343967750d1f6c15979b7559cea8be22ff1a06a51681b9cbef0d2fff4fe"));
            const weightAlgorithm = daoContract.getConfiguration(Bytes.fromHexString("0x18ef0b57fe939edb640a200fdf533493bd8f26a274151543a109b64c857e20f3"));
            const tokenId = daoContract.getConfiguration(Bytes.fromHexString("0x77b1580d1632c74a32483c26a7156260a89ae4138b020ea7d09b0dcf24f1ea24"));
            const quorum = daoContract.getConfiguration(Bytes.fromHexString("0x0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e7"));
            const contractAddr = daoContract.getAddressConfiguration(Bytes.fromHexString("0xb5a1ad3f04728d7c38547e3d43006a1ec090a02fce04bbb1d0ee4519a1921e57"));
            const supportType = daoContract.getConfiguration(Bytes.fromHexString("0xe815a3c082eed7f7f7baab546f11a8718682c0eb3017b099ddc301a92f6673e3"));
            const quorumType = daoContract.getConfiguration(Bytes.fromHexString("0x730faccfe82f70711a34ce5202c6e1b1f79f421c16fcef745a9d92d06a7c0d4c"));

            flexDaoVoteConfigEntity.contractAddr = contractAddr;
            flexDaoVoteConfigEntity.weightAlgorithm = weightAlgorithm;
            flexDaoVoteConfigEntity.votingPeriod = votingPeriod;
            flexDaoVoteConfigEntity.votingAsset = votingAsset;
            flexDaoVoteConfigEntity.tokenId = tokenId;
            flexDaoVoteConfigEntity.support = support;
            flexDaoVoteConfigEntity.quorum = quorum;
            flexDaoVoteConfigEntity.supportType = supportType;
            flexDaoVoteConfigEntity.quorumType = quorumType;

            if (votingAsset == BigInt.fromI32(3)) {
                const rel = flexDaosetVotingContract.try_getAllocations(event.params.daoAddr, event.params.proposalId);
                if (!rel.reverted && rel.value.getValue0().length > 0) {
                    let tem1: string[] = [];
                    let tem2: BigInt[] = [];
                    for (let j = 0; j < rel.value.getValue0().length; j++) {
                        tem1.push(rel.value.getValue0()[j].toHexString());
                        tem2.push(rel.value.getValue1()[j]);
                    }
                    flexDaoVoteConfigEntity.governors = tem1;
                    flexDaoVoteConfigEntity.allocations = tem2;
                }
            }
            flexDaoVoteConfigEntity.save();
        }
    }

    if (entity) {
        entity.state = proposalState;
        entity.executeHash = event.transaction.hash;
        entity.save();
    }

    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}

export function handleFeesProposalProcessed(event: FeesProposalProcessed): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString())

    const daoContract = DaoRegistry.bind(event.params.daoAddr);
    const flexDaosetFeesContrAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xc6bb47f9566baa74b5032b5c10e5bf4a1e2382ca337c2de674732f6401d52cc0"));
    const flexDaosetFeesContr = FlexDaoSetFeesAdapterContract.bind(flexDaosetFeesContrAddr);

    let proposalState = BigInt.fromI32(flexDaosetFeesContr.feesProposals(event.params.daoAddr,
        event.params.proposalId).getState());
    if (proposalState == BigInt.fromI32(2)) {
        let flexDaoFeeInfoEntity = FlexDaoFeeInfoEntity.load(event.params.daoAddr.toHexString());
        if (flexDaoFeeInfoEntity) {
            const FLEX_MANAGEMENT_FEE_AMOUNT = daoContract.getConfiguration(Bytes.fromHexString("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87"));
            const FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT = daoContract.getConfiguration(Bytes.fromHexString("0xea659d8e1a730b10af1cecb4f8ee391adf80e75302d6aaeb9642dc8a4a5e5dbb"));
            const FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x8987d08c67963e4cacd5e5936c122a968c66853d58299dd822c1942227109839"));

            flexDaoFeeInfoEntity.feeReceiver = FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS;
            flexDaoFeeInfoEntity.managementFee = FLEX_MANAGEMENT_FEE_AMOUNT;
            flexDaoFeeInfoEntity.payTokenManagementFee = FLEX_RETURN_TOKEN_MANAGEMENT_FEE_AMOUNT;
            flexDaoFeeInfoEntity.save();
        }
    }

    if (entity) {
        entity.state = proposalState;
        entity.executeHash = event.transaction.hash;
        entity.save();
    }

    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}

export function handleGovernorMembershipProposalProcessed(event: GovernorMembershipProposalProcessed): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString());
    const daoContract = DaoRegistry.bind(event.params.daoAddr);
    const flexDaoSetGovernorMembershipAdapterContractAddress = daoContract.getAdapterAddress(Bytes.fromHexString("0x869e5d18913d4e9bb387c730a04b58d11e95102194f7217a4b684f6e61dff920"));
    const governorContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d753"));
    const governorContract = StewardManagementContract.bind(governorContractAddr);

    const flexDaoSetGovernorMembershipAdapterContract = FlexDaoSetGovernorMembershipAdapterContract.bind(flexDaoSetGovernorMembershipAdapterContractAddress);
    let proposalState = BigInt.fromI32(flexDaoSetGovernorMembershipAdapterContract.governorMembershipProposals(event.params.daoAddr,
        event.params.proposalId).getState());
    if (proposalState == BigInt.fromI32(2)) {
        let flexDaoStewardMembershipEntity = FlexDaoStewardMembershipEntity.load(event.params.daoAddr.toHexString());
        if (flexDaoStewardMembershipEntity) {

            const FLEX_GOVERNOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x71ecc01da16acc23ab0eca549b0aaa7659ae183a220304fe5072243bc984fd79"));
            const FLEX_GOVERNOR_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x84580f9d926113d2c801e908a914b652340b3d8527c171bcea8d1868e92a507c"));
            const FLEX_GOVERNOR_MEMBERSHIP_MINI_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0x50c40dbbb38d5b02b04e0c6d7be02f4391fc8c14a98860284871ef1834c8390b"));
            const FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x0bfac56541ded449415df8f96f54b002e55665d7fd2fafc884184e8c17f3c772"));
            const FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ID = daoContract.getConfiguration(Bytes.fromHexString("0x93cc40268a57b3f7e5eb22a016a12d19010736289cceac5742a116fea3491b35"));
            const FLEX_GOVERNOR_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0xe6fc898f462d48724eb27b66193f38e8f83f214469eb3145fe9431a89411e724"));
            const whitelist = governorContract.getGovernorWhitelist(event.params.daoAddr);
            let tem: string[] = [];

            if (whitelist.length > 0) {
                for (let j = 0; j < whitelist.length; j++) {
                    tem.push(whitelist[j].toHexString())
                }
            }

            flexDaoStewardMembershipEntity.enable = FLEX_GOVERNOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
            flexDaoStewardMembershipEntity.name = FLEX_GOVERNOR_MEMBERSHIP_NAME;
            flexDaoStewardMembershipEntity.varifyType = FLEX_GOVERNOR_MEMBERSHIP_TYPE;
            flexDaoStewardMembershipEntity.minHolding = FLEX_GOVERNOR_MEMBERSHIP_MINI_HOLDING;
            flexDaoStewardMembershipEntity.tokenAddress = FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS;
            flexDaoStewardMembershipEntity.tokenId = FLEX_GOVERNOR_MEMBERSHIP_TOKEN_ID;
            flexDaoStewardMembershipEntity.whiteList = tem;

            flexDaoStewardMembershipEntity.save();
        }

        if (entity) {
            entity.state = proposalState;
            entity.executeHash = event.transaction.hash;
            entity.save();
        }

        let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());

        if (voteInfoEntity) {
            voteInfoEntity.nbYes = event.params.nbYes;
            voteInfoEntity.nbNo = event.params.nbNo;
            voteInfoEntity.totalWeights = event.params.allVotingWeight;
            voteInfoEntity.save();
        }
    }
}

export function handleInvestorCapProposalProcessed(event: InvestorCapProposalProcessed): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString());
    const daoContract = DaoRegistry.bind(event.params.daoAddr);

    const flexDaoSetInvestorCapAdapterContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x08f2d2eeda0c9072cdba8b58d442503b4cf9eb6c2f74d75e91dc719111c3189c"));
    const flexDaoSetInvestorCapAdapterContract = FlexDaoSetInvestorCapAdapterContract.bind(flexDaoSetInvestorCapAdapterContractAddr);
    const proposalState = BigInt.fromI32(flexDaoSetInvestorCapAdapterContract.investorCapProposals(event.params.daoAddr,
        event.params.proposalId).getState());

    if (proposalState == BigInt.fromI32(2)) {
        const MAX_INVESTORS_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x69f4ffb3ebcb7809550bddd3e4d449a47e737bf6635bc7a730996643997b0e48"));
        const MAX_INVESTORS = daoContract.getConfiguration(Bytes.fromHexString("0xecbde689cc6337d29a750b8b8a8abbfa97427b4ac800ab55be2f2c87311510f2"));
        let flexDaoInvestorCapacityEntity = FlexDaoInvestorCapacityEntity.load(event.params.daoAddr.toHexString());
        if (flexDaoInvestorCapacityEntity) {
            flexDaoInvestorCapacityEntity.enable = MAX_INVESTORS_ENABLE == BigInt.fromI32(1) ? true : false;
            flexDaoInvestorCapacityEntity.capacityAmount = MAX_INVESTORS;
            flexDaoInvestorCapacityEntity.save();
        }
    }

    if (entity) {
        entity.state = proposalState;
        entity.executeHash = event.transaction.hash;
        entity.save();
    }

    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}

export function handleInvestorMembershipProposalProcessed(event: InvestorMembershipProposalProcessed): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString());
    const daoContract = DaoRegistry.bind(event.params.daoAddr);

    const fundingPoolContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c"));
    const flexInvestmentPoolAdapterContract = FlexInvestmentPoolAdapterContract.bind(fundingPoolContractAddr);


    const flexDaoSetInvestorMembershipAdapterContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xe6121cbf77e02f965a1829c382f701ad4cec84fbda84c45378db0768d2e40871"));
    const flexDaoSetInvestorMembershipAdapterContract = FlexDaoSetInvestorMembershipAdapterContract.bind(flexDaoSetInvestorMembershipAdapterContractAddr);

    const proposalState = BigInt.fromI32(flexDaoSetInvestorMembershipAdapterContract.investorMembershipProposals(event.params.daoAddr,
        event.params.proposalId).getState());
    if (proposalState == BigInt.fromI32(2)) {
        let flexDaoInvestorMembershipEntity = FlexDaoInvestorMembershipEntity.load(event.params.daoAddr.toHexString());
        if (flexDaoInvestorMembershipEntity) {
            const FLEX_INVESTOR_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x77041e0d128001928f30b976713fed530b452bc354a9bad49ad1bcf93121f9dc"));
            const FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0xcab672166d6a1c8dae3ca0b03fed2e7258db17c3c3801ac2651987b066d39647"));
            const FLEX_INVESTOR_MEMBERSHIP_TOKENID = daoContract.getConfiguration(Bytes.fromHexString("0xcdc3057ec9c82a3ea3fd34ef56b1825924525fbab071e1a2b9d664a07f400480"));
            const FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x0f57fc3a39a8a66c31f52eab69ced65d5ac74e4a182b215146a45a0281de53e8"));
            const FLEX_INVESTOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0xfeddffed075d0686e697569ece0ce2fd26bfbbb18719086f36d16c7117edb553"));
            const FLEX_INVESTOR_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0xfd9a8d4692ffc545577ff1979a0a918c2b536b6b6a891cf324a93b2c43907f83"));

            const whitelist = flexInvestmentPoolAdapterContract.getParticipanWhitelist(event.params.daoAddr);
            let tem: string[] = [];

            if (whitelist.length > 0) {
                for (let j = 0; j < whitelist.length; j++) {
                    tem.push(whitelist[j].toHexString())
                }
            }

            flexDaoInvestorMembershipEntity.enable = FLEX_INVESTOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
            flexDaoInvestorMembershipEntity.name = FLEX_INVESTOR_MEMBERSHIP_NAME;
            flexDaoInvestorMembershipEntity.whiteList = tem;
            flexDaoInvestorMembershipEntity.varifyType = FLEX_INVESTOR_MEMBERSHIP_TYPE;
            flexDaoInvestorMembershipEntity.tokenId = FLEX_INVESTOR_MEMBERSHIP_TOKENID;
            flexDaoInvestorMembershipEntity.tokenAddress = FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS;
            flexDaoInvestorMembershipEntity.minHolding = FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING;
            flexDaoInvestorMembershipEntity.save();
        }
    }

    if (entity) {
        entity.state = proposalState;
        entity.executeHash = event.transaction.hash;
        entity.save();
    }

    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}

export function handleProposerMembershipProposalProcessed(event: ProposerMembershipProposalProcessed): void {
    let entity = FlexDaosetProposal.load(event.params.proposalId.toHexString());
    const daoContract = DaoRegistry.bind(event.params.daoAddr);

    const fundingContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda"));
    const fundingContract = FlexFundingAdapterContract.bind(fundingContractAddr);

    const flexDaoSetProposerMembershipAdapterContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xf3ce48289b9021e92bc5661ccf481e756dcb8de846c2eb9620bb83917cab5237"));
    const flexDaoSetProposerMembershipAdapterContract = FlexDaoSetProposerMembershipAdapterContract.bind(flexDaoSetProposerMembershipAdapterContractAddr);

    const proposalState = BigInt.fromI32(flexDaoSetProposerMembershipAdapterContract.proposerMembershipProposals(event.params.daoAddr,
        event.params.proposalId).getState());
    if (proposalState == BigInt.fromI32(2)) {
        let flexDaoProposerMembershipEntity = FlexDaoProposerMembershipEntity.load(event.params.daoAddr.toHexString());
        if (flexDaoProposerMembershipEntity) {
            const FLEX_PROPOSER_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x2073e6ba5c75026b006fdd165596d94b89cada2e00d8e44a99d422de8ea467e0"));
            const FLEX_PROPOSER_IDENTIFICATION_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x57901982635f8a470a3648422f8f769cf08dc2057489be5bf0099fcb44f7d43c"));
            const FLEX_PROPOSER_TOKENID = daoContract.getConfiguration(Bytes.fromHexString("0xb34f156369747125f679c86d97f51861a5a2a9f927a1addd4354acbaaa88ae57"));
            const FLEX_PROPOSER_MIN_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0xf6d5f030b79ca78dad001b87a49239ec96be97e62d13501da94c9a392700509e"));
            const FLEX_PROPOSER_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x30091caaedd0994beeeeb3b7b5734296263687ae0126aaf79e5e0f8e5c1706b2"));
            const FLEX_PROPOSER_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0xed2fa238da16f9e9bea8f1aa8dc2f0d04c522f8adbda71cc4ea5c11f5a51f32d"));
            let tem: string[] = [];

            const whitelist = fundingContract.getProposerWhitelist(event.params.daoAddr);
            if (whitelist.length > 0) {
                for (let j = 0; j < whitelist.length; j++) {
                    tem.push(whitelist[j].toHexString())
                }
            }

            flexDaoProposerMembershipEntity.proposerMembershipEnable = FLEX_PROPOSER_ENABLE == BigInt.fromI32(1) ? true : false;
            flexDaoProposerMembershipEntity.name = FLEX_PROPOSER_MEMBERSHIP_NAME;
            flexDaoProposerMembershipEntity.varifyType = FLEX_PROPOSER_IDENTIFICATION_TYPE;
            flexDaoProposerMembershipEntity.minHolding = FLEX_PROPOSER_MIN_HOLDING;
            flexDaoProposerMembershipEntity.tokenAddress = FLEX_PROPOSER_TOKEN_ADDRESS;
            flexDaoProposerMembershipEntity.tokenId = FLEX_PROPOSER_TOKENID;
            flexDaoProposerMembershipEntity.whiteList = tem;

            flexDaoProposerMembershipEntity.save();
        }
    }

    if (entity) {
        entity.state = proposalState;
        entity.executeHash = event.transaction.hash;
        entity.save();
    }

    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}