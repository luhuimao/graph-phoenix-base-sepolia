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
    VintageDaoSetAdapterContract,
    ProposalCreated,
    ProposalProcessed
} from "../generated/VintageDaoSetAdapterContract/VintageDaoSetAdapterContract";
import { DaoRegistry } from "../generated/VintageDaoSetAdapterContract/DaoRegistry";
import { VintageRaiserManagementContract } from "../generated/VintageDaoSetAdapterContract/VintageRaiserManagementContract";
import { VintageFundingPoolAdapterContract } from "../generated/VintageDaoSetAdapterContract/VintageFundingPoolAdapterContract";
import {
    VintageDaoSetProposal,
    VintageProposalVoteInfo,
    VintageFundRoundToFundEstablishmentProposalId,
    VintageDaoInvestorCapacityEntity,
    VintageInvestorMembershipEntity,
    VintageGovernorMembershipEntity,
    VintageVotingInfoEntity
} from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = VintageDaoSetProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new VintageDaoSetProposal(event.params.proposalId.toHexString())
    }

    entity.daoAddr = event.params.daoAddr;
    entity.proposer = event.transaction.from;
    entity.creationTime = event.block.timestamp;
    entity.proposalId = event.params.proposalId;
    entity.executeHash = Bytes.empty();
    entity.proposalType = BigInt.fromI32(event.params.pType);
    switch (event.params.pType) {
        // INVESTOR_CAP,
        // GOVERNOR_MEMBERSHIP,
        // INVESTOR_MEMBERSHIP,
        // VOTING
        case 0:
            entity.proposalTypeString = "INVESTOR_CAP";
            break;
        case 1: entity.proposalTypeString = "GOVERNOR_MEMBERSHIP";
            break;
        case 2: entity.proposalTypeString = "INVESTOR_MEMBERSHIP";
            break;
        case 3: entity.proposalTypeString = "VOTING";
            break;
        default:
            entity.proposalTypeString = "";
            break;
    }
    entity.state = BigInt.fromI32(0);
    entity.vintageDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleProposalExecuted(event: ProposalProcessed): void {
    let entity = VintageDaoSetProposal.load(event.params.proposalId.toHexString())
    let proposalState = BigInt.fromI32(0);
    const daosetContrct = VintageDaoSetAdapterContract.bind(event.address);
    const daoContract = DaoRegistry.bind(event.params.daoAddr);

    if (entity) {
        switch (entity.proposalType.toI32()) {
            case 0:
                proposalState = BigInt.fromI32(daosetContrct.investorCapProposals(event.params.daoAddr, event.params.proposalId).getState());
                if (proposalState == BigInt.fromI32(2)) {

                    let vintageDaoInvestorCapacityEntity = VintageDaoInvestorCapacityEntity.load(event.params.daoAddr.toHexString());
                    if (vintageDaoInvestorCapacityEntity) {
                        const MAX_INVESTORS_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x69f4ffb3ebcb7809550bddd3e4d449a47e737bf6635bc7a730996643997b0e48"));
                        const MAX_INVESTORS = daoContract.getConfiguration(Bytes.fromHexString("0xecbde689cc6337d29a750b8b8a8abbfa97427b4ac800ab55be2f2c87311510f2"));
                        vintageDaoInvestorCapacityEntity.enable = MAX_INVESTORS_ENABLE == BigInt.fromI32(1) ? true : false;
                        vintageDaoInvestorCapacityEntity.capacityAmount = MAX_INVESTORS;
                        vintageDaoInvestorCapacityEntity.save();
                    }
                }
                break;
            case 1:
                proposalState = BigInt.fromI32(daosetContrct.governorMembershipProposals(event.params.daoAddr, event.params.proposalId).getState());

                if (proposalState == BigInt.fromI32(2)) {
                    let vintageGovernorMembershipEntity = VintageGovernorMembershipEntity.load(event.params.daoAddr.toHexString());
                    if (vintageGovernorMembershipEntity) {
                        const governorContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xd90e10040720d66c9412cb511e3dbb6ba51669248a7495e763d44ab426893efa"));
                        const governorManagementCont = VintageRaiserManagementContract.bind(governorContAddr);
                        const VINTAGE_GOVERNOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x5b7b19076468102b84afbef323d128866c396a716ce4ce29f84beef8d266f3af"));
                        const VINTAGE_GOVERNOR_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x23f0530138a805a7a3c83e0d6298d353102473dc25666f75173de90ac5414c82"));
                        const VINTAGE_GOVERNOR_MEMBERSHIP_MIN_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0x4481bb4c8bc94e65f81ab5591f704165aab99eb4197df7acf672022476933f58"));
                        const VINTAGE_GOVERNOR_MEMBERSHIP_MIN_DEPOSIT = daoContract.getConfiguration(Bytes.fromHexString("0x38cbcea6ba035c1d1890c83ce99918342ef746d839f9c2e2d4966d30a7e70b34"));
                        const VINTAGE_GOVERNOR_MEMBERSHIP_TOKENID = daoContract.getConfiguration(Bytes.fromHexString("0xe33a9c3c87c85b9efd09c180b8fd30ca34326eb72e20fdd832b510971ccf71ae"));
                        const VINTAGE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0xaa2cc36fff47c5c104b89a4abef628c92272c0af9c4db27739bc445b2f51e9a2"));
                        const VINTAGE_GOVERNOR_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0xa4b6f581a2d1e8b24bacedf9a91a13c8df6147ffb9d2bd4a770d867d91018da6"));


                        let tem: string[] = [];
                        const whitelist = governorManagementCont.getGovernorWhitelist(event.params.daoAddr)
                        if (whitelist.length > 0) {
                            for (let j = 0; j < whitelist.length; j++) {
                                tem.push(whitelist[j].toHexString())
                            }
                        }

                        vintageGovernorMembershipEntity.daoAddr = event.params.daoAddr;
                        vintageGovernorMembershipEntity.enable = VINTAGE_GOVERNOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
                        vintageGovernorMembershipEntity.name = VINTAGE_GOVERNOR_MEMBERSHIP_NAME;
                        vintageGovernorMembershipEntity.tokenAddress = VINTAGE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS;
                        vintageGovernorMembershipEntity.tokenId = VINTAGE_GOVERNOR_MEMBERSHIP_TOKENID;
                        vintageGovernorMembershipEntity.minAmount = VINTAGE_GOVERNOR_MEMBERSHIP_TYPE == BigInt.fromI32(4) ? VINTAGE_GOVERNOR_MEMBERSHIP_MIN_DEPOSIT : VINTAGE_GOVERNOR_MEMBERSHIP_MIN_HOLDING;
                        vintageGovernorMembershipEntity.whiteList = tem;
                        vintageGovernorMembershipEntity.varifyType = VINTAGE_GOVERNOR_MEMBERSHIP_TYPE;
                        vintageGovernorMembershipEntity.vintageDaoEntity = event.params.daoAddr.toHexString();
                        vintageGovernorMembershipEntity.save();
                    }
                } break;
            case 2:
                proposalState = BigInt.fromI32(daosetContrct.investorMembershipProposals(event.params.daoAddr, event.params.proposalId).getState());

                if (proposalState == BigInt.fromI32(2)) {
                    let vintageInvestorMembershipEntity = VintageInvestorMembershipEntity.load(event.params.daoAddr.toHexString());
                    if (vintageInvestorMembershipEntity) {
                        const fundingPoolContractAddress = daoContract.getAdapterAddress(Bytes.fromHexString("0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892"));
                        const fundingPoolCont = VintageFundingPoolAdapterContract.bind(fundingPoolContractAddress);

                        const VINTAGE_INVESTOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x1405d0156cf64c805704fdf6691baebfcfa0d409ea827c231693ff0581b0b777"));
                        const VINTAGE_INVESTOR_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x80140cd7e0b1d935bee578a67a41547c82987de8e7d6b3827d411b738110258b"));
                        const VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0x04ecaf460eb9f82aeb70035e3f24c18a3650fa0da9ddbe7e63d70de659b9b901"));
                        const VINTAGE_INVESTOR_MEMBERSHIP_TOKENID = daoContract.getConfiguration(Bytes.fromHexString("0x6cb5bc3796b0717ca4ff665886c96fb0178d6341366eb7b6c737fe79083b836a"));
                        const VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0xe373ab56628c86db3f0e36774c2c5e0393f9272ff5c976bc3f0db2db60cdbc14"));
                        const VINTAGE_INVESTOR_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0x324dfda0ffcc38c4650b5df076e6f7b4938c2b723873af58b1be5e221dd2cc30"));

                        let tem: string[] = [];
                        const whitelist = fundingPoolCont.getInvestorMembershipWhiteList(event.params.daoAddr)
                        if (whitelist.length > 0) {
                            for (let j = 0; j < whitelist.length; j++) {
                                tem.push(whitelist[j].toHexString())
                            }
                        }

                        vintageInvestorMembershipEntity.daoAddr = event.params.daoAddr;
                        vintageInvestorMembershipEntity.enable = VINTAGE_INVESTOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
                        vintageInvestorMembershipEntity.name = VINTAGE_INVESTOR_MEMBERSHIP_NAME;
                        vintageInvestorMembershipEntity.minAmount = VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING;
                        vintageInvestorMembershipEntity.tokenAddress = VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS;
                        vintageInvestorMembershipEntity.tokenId = VINTAGE_INVESTOR_MEMBERSHIP_TOKENID;
                        vintageInvestorMembershipEntity.varifyType = VINTAGE_INVESTOR_MEMBERSHIP_TYPE;
                        vintageInvestorMembershipEntity.whiteList = tem;
                        vintageInvestorMembershipEntity.vintageDaoEntity = event.params.daoAddr.toHexString();
                        vintageInvestorMembershipEntity.save();
                    }
                } break;
            case 3:
                proposalState = BigInt.fromI32(daosetContrct.votingProposals(event.params.daoAddr, event.params.proposalId).getState());

                if (proposalState == BigInt.fromI32(2)) {
                    const vintageVotingInfoEntity = VintageVotingInfoEntity.load(event.params.daoAddr.toHexString());
                    if (vintageVotingInfoEntity) {
                        const VINTAGE_VOTING_ASSET_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x686efe7bd1699b408d306db6bbee658ed667971c52d48d6912d7ee496e36e627"));
                        const VINTAGE_VOTING_ASSET_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0xcd9b30ab6388c165d825b60b7d393528191ba59d975b4b1b52b7184b63b8a97c"));
                        const VINTAGE_VOTING_ASSET_TOKEN_ID = daoContract.getConfiguration(Bytes.fromHexString("0x00634460a4b60c2e1bf8c87bfc42b6b68fd2a71f4bb2d760816eabc5038b5036"));
                        const VINTAGE_VOTING_WEIGHTED_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0xb75eae231d9582c6afc6491273df4a0ffbccd48ab2c48dbce59e5d68f2d19dc4"));
                        const VINTAGE_VOTING_SUPPORT_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x561bc86bc227a0f760218574791a84f180f6f9f02be9519a1f99c14fce07a310"));
                        const VINTAGE_VOTING_QUORUM_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x8097540b5ab8a4c18e0b10cfbfd2c69e65e8da78f4f0485467006bafa3935964"));
                        const QUORUM = daoContract.getConfiguration(Bytes.fromHexString("0x0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e7"));
                        const SUPPORT = daoContract.getConfiguration(Bytes.fromHexString("b4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df32"));
                        const VOTING_PERIOD = daoContract.getConfiguration(Bytes.fromHexString("0x9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc"));
                        const PROPOSAL_EXECUTE_DURATION = daoContract.getConfiguration(Bytes.fromHexString("0x02a3530cbb6e7c084516c86f68bd62c3e3fcd783c6c5d7e138616207f7a32250"));

                        vintageVotingInfoEntity.daoAddr = event.params.daoAddr;
                        vintageVotingInfoEntity.executingPeriod = PROPOSAL_EXECUTE_DURATION;
                        vintageVotingInfoEntity.quorum = QUORUM;
                        vintageVotingInfoEntity.quorumType = VINTAGE_VOTING_QUORUM_TYPE;
                        vintageVotingInfoEntity.support = SUPPORT;
                        vintageVotingInfoEntity.supportType = VINTAGE_VOTING_SUPPORT_TYPE;
                        vintageVotingInfoEntity.tokenAddress = VINTAGE_VOTING_ASSET_TOKEN_ADDRESS;
                        vintageVotingInfoEntity.tokenID = VINTAGE_VOTING_ASSET_TOKEN_ID;
                        vintageVotingInfoEntity.votingAssetType = VINTAGE_VOTING_ASSET_TYPE;
                        vintageVotingInfoEntity.votingPeriod = VOTING_PERIOD;
                        vintageVotingInfoEntity.votingWeightedType = VINTAGE_VOTING_WEIGHTED_TYPE;
                        vintageVotingInfoEntity.vintageDaoEntity = event.params.daoAddr.toHexString();
                        vintageVotingInfoEntity.save();
                    }
                } break;
            default:
                break;
        }
        entity.state = BigInt.fromI32(event.params.state);
        entity.executeHash = event.transaction.hash;
        entity.save();
    }

    let voteInfoEntity = VintageProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}