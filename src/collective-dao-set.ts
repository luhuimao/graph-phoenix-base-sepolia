/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-22 15:32:03
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-16 14:28:21
 */
import { BigInt, Bytes, Address, log, bigInt } from "@graphprotocol/graph-ts"
import {
    ColletiveDaoSetProposalAdapterContract,
    ProposalCreated,
    ProposalProcessed
} from "../generated/ColletiveDaoSetProposalAdapterContract/ColletiveDaoSetProposalAdapterContract";
import { DaoRegistry } from "../generated/ColletiveDaoSetProposalAdapterContract/DaoRegistry";
import { ColletiveGovernorManagementAdapterContract } from "../generated/ColletiveDaoSetProposalAdapterContract/ColletiveGovernorManagementAdapterContract";
import {
    CollectiveDaoSetProposalEntity,
    CollectiveProposalVoteInfo,
    CollectiveDaoInvestorCapacityEntity,
    CollectiveDaoGovernorMembershipEntity,
    CollectiveDaoVoteConfigEntity,
    CollectiveDaoFeeInfoEntity
} from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = CollectiveDaoSetProposalEntity.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new CollectiveDaoSetProposalEntity(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposer = event.transaction.from;
    entity.creationTime = event.block.timestamp;
    entity.proposalId = event.params.proposalId;
    entity.executeHash = Bytes.empty();
    entity.proposalType = BigInt.fromI32(event.params.pType);
    switch (event.params.pType) {
        // enum ProposalType {
        //     INVESTOR_CAP,
        //     GOVERNOR_MEMBERSHIP,
        //     PROPOSER_REWARD,
        //     VOTING,
        //     FEES
        // }
        case 0:
            entity.proposalTypeString = "INVESTOR_CAP";
            break;
        case 1: entity.proposalTypeString = "MEMBER_ELIGIBILITY";
            break;
        case 2: entity.proposalTypeString = "PROPOSER_REWARD";
            break;
        case 3: entity.proposalTypeString = "VOTING";
            break;
        case 4: entity.proposalTypeString = "FEES";
            break;
        default:
            entity.proposalTypeString = "undefined";
            break;
    }
    entity.state = BigInt.fromI32(0);
    entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleProposalExecuted(event: ProposalProcessed): void {
    let entity = CollectiveDaoSetProposalEntity.load(event.params.proposalId.toHexString())
    let proposalState = BigInt.fromI32(0);
    const daosetContrct = ColletiveDaoSetProposalAdapterContract.bind(event.address);
    const daoContract = DaoRegistry.bind(event.params.daoAddr);

    if (entity) {
        switch (entity.proposalType.toI32()) {
            case 0:
                proposalState = BigInt.fromI32(daosetContrct.investorCapProposals(event.params.daoAddr, event.params.proposalId).getState());
                if (proposalState == BigInt.fromI32(2)) {

                    let collectiveDaoInvestorCapacityEntity = CollectiveDaoInvestorCapacityEntity.load(event.params.daoAddr.toHexString());
                    if (collectiveDaoInvestorCapacityEntity) {
                        const MAX_INVESTORS_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x69f4ffb3ebcb7809550bddd3e4d449a47e737bf6635bc7a730996643997b0e48"));
                        const MAX_INVESTORS = daoContract.getConfiguration(Bytes.fromHexString("0xecbde689cc6337d29a750b8b8a8abbfa97427b4ac800ab55be2f2c87311510f2"));
                        collectiveDaoInvestorCapacityEntity.enable = MAX_INVESTORS_ENABLE == BigInt.fromI32(1) ? true : false;
                        collectiveDaoInvestorCapacityEntity.capacityAmount = MAX_INVESTORS;
                        collectiveDaoInvestorCapacityEntity.save();
                    }
                }
                break;
            case 1:
                proposalState = BigInt.fromI32(daosetContrct.governorMembershipProposals(event.params.daoAddr, event.params.proposalId).getState());

                if (proposalState == BigInt.fromI32(2)) {
                    let collectiveDaoGovernorMembershipEntity = CollectiveDaoGovernorMembershipEntity.load(event.params.daoAddr.toHexString());
                    if (collectiveDaoGovernorMembershipEntity) {
                        const governorContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe"));
                        const governorManagementCont = ColletiveGovernorManagementAdapterContract.bind(governorContAddr);

                        const COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x02049446ffbff09ad55d6fdb03c8c6027cf548332d30663e8fdf960abdab86ea"));
                        const COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x09f0ac4191623c4a1e481e66bb865f218d9f5bcef4e65b597583a054b10182bc"));
                        const COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0x6bdd30ca7a0b5a78cdfd780fd2f234880048cafa893e9ccbc9f82df25cdc717f"));
                        const COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x0567bf43e78d815625031c35adddd5d701cb6b913fbad3b625b4f8c00fdc42aa"));
                        const COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID = daoContract.getConfiguration(Bytes.fromHexString("0x032de4639c5a8edd1ea478b1345b2d031f42ecd2b29442d3080c9ac0545b5f8e"));
                        // const COLLECTIVE_GOVERNOR_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0xe8c0cc8a9993875960b545b0c8b4b345a98d03a2c0ddf4b918a5ef119f5ab528"));
                        const COLLECTIVE_GOVERNOR_MEMBERSHIP_NAME = daosetContrct.governorMembershipProposals(event.params.daoAddr, event.params.proposalId).getName();

                        let tem: string[] = [];
                        const whitelist = governorManagementCont.getGovernorWhitelist(event.params.daoAddr)
                        if (whitelist.length > 0) {
                            for (let j = 0; j < whitelist.length; j++) {
                                tem.push(whitelist[j].toHexString())
                            }
                        }

                        collectiveDaoGovernorMembershipEntity.daoAddr = event.params.daoAddr;
                        collectiveDaoGovernorMembershipEntity.enable = COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
                        collectiveDaoGovernorMembershipEntity.name = COLLECTIVE_GOVERNOR_MEMBERSHIP_NAME;
                        collectiveDaoGovernorMembershipEntity.tokenAddress = COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS;
                        collectiveDaoGovernorMembershipEntity.tokenId = COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID;
                        collectiveDaoGovernorMembershipEntity.minHolding = COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING;
                        collectiveDaoGovernorMembershipEntity.whiteList = tem;
                        collectiveDaoGovernorMembershipEntity.varifyType = COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE;
                        collectiveDaoGovernorMembershipEntity.collectiveDaoEntity = event.params.daoAddr.toHexString();
                        collectiveDaoGovernorMembershipEntity.save();
                    }
                } break;
            case 2:
                proposalState = BigInt.fromI32(daosetContrct.proposerRewardProposals(event.params.daoAddr, event.params.proposalId).getState());
                if (proposalState == BigInt.fromI32(2)) {
                    const collectiveDaoFeeInfoEntity = CollectiveDaoFeeInfoEntity.load(event.params.daoAddr.toHexString());
                    if (collectiveDaoFeeInfoEntity) {
                        let COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT = daoContract.getConfiguration(Bytes.fromHexString("0xb035c58a9b643066fc5cd78a708da0456c36221a03ca174ff3b76d4306ff7c6c"));
                        let COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT = daoContract.getConfiguration(Bytes.fromHexString("0x558062fa5fcc8623e6c743ab5b51793317989a5a93f03b32a485f94843f77da3"));

                        collectiveDaoFeeInfoEntity.proposerPayBackTokenFeeAmount = COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT;
                        collectiveDaoFeeInfoEntity.proposerInvestTokenFeeAmount = COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT;

                        collectiveDaoFeeInfoEntity.save();
                    }
                }
                break;
            case 3:
                proposalState = BigInt.fromI32(daosetContrct.votingProposals(event.params.daoAddr, event.params.proposalId).getState());

                if (proposalState == BigInt.fromI32(2)) {
                    const collectiveDaoVoteConfigEntity = CollectiveDaoVoteConfigEntity.load(event.params.daoAddr.toHexString());
                    if (collectiveDaoVoteConfigEntity) {

                        const votingPeriod = daoContract.getConfiguration(Bytes.fromHexString("0x9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc"));
                        const support = daoContract.getConfiguration(Bytes.fromHexString("0xb4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df32"));
                        const votingAsset = daoContract.getConfiguration(Bytes.fromHexString("0xeee23dc9ab95b6666db01c2b6cae6a5ef706099a25926e21e0a2e043fe885604"));
                        const weightAlgorithm = daoContract.getConfiguration(Bytes.fromHexString("0xd093d4a34a12a221b19c0a6689d5449f1346aa769d15cca4e9782c36fda9339a"));
                        const quorum = daoContract.getConfiguration(Bytes.fromHexString("0x0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e7"));
                        const supportType = daoContract.getConfiguration(Bytes.fromHexString("0x1aeed2c0ea31fb81f41489b79a1d09374a270e0f9340ace7354cce77586a7d16"));
                        const quorumType = daoContract.getConfiguration(Bytes.fromHexString("0e0434138ea29dceb1f2c0ca9b9f923f9d1c32d3d96bab2de9991f140daca712"));

                        collectiveDaoVoteConfigEntity.daoAddr = event.params.daoAddr;
                        collectiveDaoVoteConfigEntity.quorum = quorum;
                        collectiveDaoVoteConfigEntity.quorumType = quorumType;
                        collectiveDaoVoteConfigEntity.support = support;
                        collectiveDaoVoteConfigEntity.supportType = supportType;
                        collectiveDaoVoteConfigEntity.votingAsset = votingAsset;
                        collectiveDaoVoteConfigEntity.votingPeriod = votingPeriod;
                        collectiveDaoVoteConfigEntity.weightAlgorithm = weightAlgorithm;
                        collectiveDaoVoteConfigEntity.collectiveDaoEntity = event.params.daoAddr.toHexString();
                        collectiveDaoVoteConfigEntity.save();
                    }
                } break;

            case 4:
                proposalState = BigInt.fromI32(daosetContrct.feesProposals(event.params.daoAddr, event.params.proposalId).getState());
                if (proposalState == BigInt.fromI32(2)) {
                    const collectiveDaoFeeInfoEntity = CollectiveDaoFeeInfoEntity.load(event.params.daoAddr.toHexString());
                    if (collectiveDaoFeeInfoEntity) {
                        const COLLECTIVE_REDEMPTION_FEE_AMOUNT = daoContract.getConfiguration(Bytes.fromHexString("0x51cc27e85946200c558b984a0c15cad2122655d647f9c02ebe9529f2a0b25a2f"));

                        collectiveDaoFeeInfoEntity.redemptionFeeAmount = COLLECTIVE_REDEMPTION_FEE_AMOUNT;
                        collectiveDaoFeeInfoEntity.save();
                    }
                }
                break;
            default:
                break;
        }
        entity.state = BigInt.fromI32(event.params.state);
        entity.executeHash = event.transaction.hash;
        entity.save();
    }

    let collectiveProposalVoteInfo = CollectiveProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (collectiveProposalVoteInfo) {
        collectiveProposalVoteInfo.nbYes = event.params.nbYes;
        collectiveProposalVoteInfo.nbNo = event.params.nbNo;
        collectiveProposalVoteInfo.totalWeights = event.params.allVotingWeight;
        collectiveProposalVoteInfo.save();
    }
}