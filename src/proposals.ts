// import {
//     Proposals
// } from "../generated/EventEmitter/Proposals";
import {
    EventEmitter,
    ExpenseProposalCreated as ExpenseProposalCreatedEvent,
    GovernanceVotingProposalCreated as GovernanceVotingProposalCreatedEvent,
    GovernanceEligibilityProposalCreated as GovernanceEligibilityProposalCreatedEvent,
    SubmitVote as SubmitVoteEvent,
    ExpenseProposalProcessed as ExpenseProposalProcessedEvent,
    GovernanceVotingProposalProcessed as GovernanceVotingProposalProcessedEvent,
    GovernanceEligibilityProposalProcessed as GovernanceEligibilityProposalProcessedEvent
}
    from "../generated/EventEmitter/EventEmitter";
import { DaoLens } from "../generated/EventEmitter/DaoLens";
import {
    TreasuryDaoExpenseProposalEntity,
    TreasuryDaoGovernorEligibilityProposalEntity,
    TreasuryDaoGovernorVotingProposalEntity,
    TreasuryDAOEntity,
    TreasuryDaoVotingEntity,
    TreasuryDAOProposalVoteInfo,
    TreasuryDAOGovernorEligibilityInfo,
    TreasuryDAOVotingInfo
} from "../generated/schema"
import { BigInt, Address, bigInt } from "@graphprotocol/graph-ts";

export function handleExpenseProposalProcessed(event: ExpenseProposalProcessedEvent): void {
    let entity = TreasuryDaoExpenseProposalEntity.load(event.params.proposalId.toHexString());
    if (entity) {
        // event.params.nbNo
        // event.params.proposalId
        // event.params.nbYes


        entity.state = BigInt.fromI32(event.params.state);
        entity.executeHash = event.transaction.hash;
        entity.save();
    }
}
export function handleGovernanceVotingProposalProcessed(event: GovernanceVotingProposalProcessedEvent): void {
    let entity = TreasuryDaoGovernorVotingProposalEntity.load(event.params.proposalId.toHexString());
    if (entity) {
        // event.params.nbNo
        // event.params.proposalId
        // event.params.nbYes

        entity.executeHash = event.transaction.hash;
        entity.state = BigInt.fromI32(event.params.state);
        entity.save();
        if (event.params.state == 2) {
            let treasuryDAOVotingInfo = TreasuryDAOVotingInfo.load(entity.daoAddress.toHexString());
            if (treasuryDAOVotingInfo) {
                treasuryDAOVotingInfo.supportType = entity.supportType;
                treasuryDAOVotingInfo.quorumType = entity.quorumType;
                treasuryDAOVotingInfo.support = entity.support;
                treasuryDAOVotingInfo.quorum = entity.quorum;
                treasuryDAOVotingInfo.votingAssetType = entity.votingAssetType;
                treasuryDAOVotingInfo.tokenAddress = entity.tokenAddress;
                treasuryDAOVotingInfo.tokenID = entity.tokenID;
                treasuryDAOVotingInfo.votingWeightedType = entity.votingWeightedType;
                treasuryDAOVotingInfo.votingPeriod = entity.votingPeriod;
                treasuryDAOVotingInfo.save();
            }
        }
    }



}
export function handleGovernanceEligibilityProposalProcessed(event: GovernanceEligibilityProposalProcessedEvent): void {
    let entity = TreasuryDaoGovernorEligibilityProposalEntity.load(event.params.proposalId.toHexString());
    if (entity) {
        // event.params.nbNo
        // event.params.proposalId
        // event.params.nbYes

        entity.executeHash = event.transaction.hash;
        entity.state = BigInt.fromI32(event.params.state);
        entity.save();

        if (event.params.state == 2) {
            let treasuryDAOGovernorEligibilityInfo = TreasuryDAOGovernorEligibilityInfo.load(entity.daoAddress.toHexString());
            if (treasuryDAOGovernorEligibilityInfo) {

                treasuryDAOGovernorEligibilityInfo.enable = entity.enable;
                treasuryDAOGovernorEligibilityInfo.name = entity.name;
                treasuryDAOGovernorEligibilityInfo.verifyType = entity.verifyType;
                treasuryDAOGovernorEligibilityInfo.minAmount = entity.minAmount;
                treasuryDAOGovernorEligibilityInfo.tokenAddress = entity.tokenAddress;

                treasuryDAOGovernorEligibilityInfo.save();
            }
        }
    }
}

export function handleSubmitVote(event: SubmitVoteEvent): void {
    let entity = new TreasuryDaoVotingEntity(event.params.proposalId.toHexString() + event.params.voter.toHexString())
    entity.currentQuorum = event.params.currentQuorum
    entity.currentSupport = event.params.currentSupport
    entity.nbNo = event.params.nbNo
    entity.nbYes = event.params.nbYes
    entity.proposalId = event.params.proposalId
    entity.voteStartTime = event.params.voteStartTime
    entity.voteStopTime = event.params.voteStopTime
    entity.voteValue = event.params.voteValue
    entity.voter = event.params.voter
    entity.votingTime = event.params.votingTime
    entity.txHash = event.transaction.hash;
    entity.daoAddr = event.params.daoAddr;
    entity.save();

    const daoEntity = TreasuryDAOEntity.load(event.params.daoAddr.toHexString());
    const treasuryDAOVotingInfo = TreasuryDAOVotingInfo.load(event.params.daoAddr.toHexString());
    let treasuryDAOProposalVoteInfo = TreasuryDAOProposalVoteInfo.load(event.params.proposalId.toHexString());
    if (!treasuryDAOProposalVoteInfo) {
        treasuryDAOProposalVoteInfo = new TreasuryDAOProposalVoteInfo(event.params.proposalId.toHexString());
        treasuryDAOProposalVoteInfo.daoAddr = Address.empty();
        treasuryDAOProposalVoteInfo.proposalId = event.params.proposalId
        treasuryDAOProposalVoteInfo.startVoteTime = event.params.voteStartTime
        treasuryDAOProposalVoteInfo.stopVoteTime = event.params.voteStopTime
        treasuryDAOProposalVoteInfo.startVoteTimeString = new Date(event.params.voteStartTime.toI64() * 1000).toISOString();
        treasuryDAOProposalVoteInfo.stopVoteTimeString = new Date(event.params.voteStopTime.toI64() * 1000).toISOString();
        treasuryDAOProposalVoteInfo.nbNo = event.params.nbNo
        treasuryDAOProposalVoteInfo.nbYes = event.params.nbYes
        treasuryDAOProposalVoteInfo.currentQuorum = event.params.currentQuorum
        treasuryDAOProposalVoteInfo.currentSupport = event.params.currentSupport
        treasuryDAOProposalVoteInfo.totalWeights = BigInt.zero();
        treasuryDAOProposalVoteInfo.support = BigInt.zero();
        treasuryDAOProposalVoteInfo.quorum = BigInt.zero();
        treasuryDAOProposalVoteInfo.supportType = BigInt.zero();
        treasuryDAOProposalVoteInfo.quorumType = BigInt.zero();
        if (treasuryDAOVotingInfo) {
            treasuryDAOProposalVoteInfo.support = treasuryDAOVotingInfo.support;
            treasuryDAOProposalVoteInfo.quorum = treasuryDAOVotingInfo.quorum;
            treasuryDAOProposalVoteInfo.supportType = treasuryDAOVotingInfo.supportType;
            treasuryDAOProposalVoteInfo.quorumType = treasuryDAOVotingInfo.quorumType;
        }
    }
    treasuryDAOProposalVoteInfo.save();
}

export function handleGovernanceEligibilityProposalCreated(event: GovernanceEligibilityProposalCreatedEvent): void {
    let entity = new TreasuryDaoGovernorEligibilityProposalEntity(event.params.proposalId.toHexString());
    const daoEntity = TreasuryDAOEntity.load(event.params.daoAddr.toHexString());
    let enable = false;
    let name = "";
    let verifyType = BigInt.zero();
    let minAmount = BigInt.zero();
    let tokenAddress = Address.empty();
    let tokenId = BigInt.zero();
    let stopVoteTime = BigInt.zero();
    let state = BigInt.zero();
    if (daoEntity && daoEntity._daoLenContractAddress) {
        const daolens = DaoLens.bind(Address.fromBytes(daoEntity._daoLenContractAddress));

        if (daolens) {
            const rel = daolens.try_getGovernorEligibilityProposalDataByProposalId(event.params.proposalId);
            if (!rel.reverted) {

                enable = rel.value.enable;
                name = rel.value.name;
                verifyType = BigInt.fromI32(rel.value.verifyType);
                minAmount = rel.value.minAmount;
                tokenAddress = rel.value.tokenAddress;
                tokenId = rel.value.tokenId;
                stopVoteTime = rel.value.stopVoteTime;
                state = BigInt.fromI32(rel.value.state)
            }
        }
    }
    // proposalId: Bytes! # address
    // daoAddress: Bytes! # address
    // createTime: BigInt!
    // enable: Boolean!
    // name: String
    // verifyType:BigInt!
    // minAmount: BigInt!
    // tokenAddress:  Bytes! # address
    // tokenId: BigInt!
    // stopVoteTime: BigInt!
    // state: BigInt!
    entity.proposer = event.transaction.from;
    entity.daoAddress = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.enable = enable;
    entity.name = name;
    entity.verifyType = verifyType;
    entity.minAmount = minAmount;
    entity.tokenAddress = tokenAddress;
    entity.tokenId = tokenId;
    entity.stopVoteTime = stopVoteTime;
    entity.createTime = event.block.timestamp;
    entity.state = state;
    entity.save();
}

export function handleExpenseProposalCreated(event: ExpenseProposalCreatedEvent): void {
    let entity = new TreasuryDaoExpenseProposalEntity(event.params.proposalId.toHexString())
    const daoEntity = TreasuryDAOEntity.load(event.params.daoAddr.toHexString());
    let tokenType = BigInt.zero();
    let tokenAddress = Address.empty();
    let amount = BigInt.zero();
    let receiver = Address.empty();
    let stopVoteTime = BigInt.zero();
    let state = BigInt.zero();
    if (daoEntity && daoEntity._daoLenContractAddress) {
        const daolens = DaoLens.bind(Address.fromBytes(daoEntity._daoLenContractAddress));
        if (daolens) {
            const rel = daolens.try_getExpenseProposalDataByProposalId(event.params.proposalId);
            if (!rel.reverted) {
                // bytes32 proposalId;
                // uint8 tokenType; //0 erc20, 1 erc721, 2 erc1155
                // address tokenAddress;
                // uint256 amount;
                // uint256[] tokenIds;
                // address receiver;
                // uint256 creationTime;
                // uint256 stopVoteTime;
                // ProposalState state;
                tokenType = BigInt.fromI32(rel.value.tokenType);
                tokenAddress = rel.value.tokenAddress
                amount = rel.value.amount
                // rel.value.tokenIds
                receiver = rel.value.receiver
                // rel.value.creationTime
                stopVoteTime = rel.value.stopVoteTime
                state = BigInt.fromI32(rel.value.state)
            }
        }
    }
    entity.proposer = event.transaction.from;
    entity.daoAddress = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.createTime = event.block.timestamp;
    entity.tokenType = tokenType;
    entity.tokenAddress = tokenAddress;
    entity.amount = amount;
    entity.receiver = receiver;
    entity.stopVoteTime = stopVoteTime;
    entity.state = state;
    entity.save();
}

export function handleGovernanceVotingProposalCreated(event: GovernanceVotingProposalCreatedEvent): void {
    let entity = new TreasuryDaoGovernorVotingProposalEntity(event.params.proposalId.toHexString())
    const daoEntity = TreasuryDAOEntity.load(event.params.daoAddr.toHexString());
    let supportType = BigInt.zero();
    let quorumType = BigInt.zero();
    let support = BigInt.zero();
    let quorum = BigInt.zero();
    let votingAssetType = BigInt.zero();
    let tokenAddress = Address.empty();
    let tokenID = BigInt.zero();
    let votingWeightedType = BigInt.zero();
    let votingPeriod = BigInt.zero();
    let gracePeriod = BigInt.zero();
    let creationTime = BigInt.zero();
    let stopVoteTime = BigInt.zero();
    let state = BigInt.zero();

    if (daoEntity && daoEntity._daoLenContractAddress) {
        const daolens = DaoLens.bind(Address.fromBytes(daoEntity._daoLenContractAddress));
        if (daolens) {
            const rel = daolens.try_getGovernanceVotingProposalDataByProposalId(event.params.proposalId);
            if (!rel.reverted) {
                // VotingSupportInfo supportInfo;
                // VotingAssetInfo votingAssetInfo;
                // VotingTimeInfo timeInfo;
                // ProposalState state;


                // struct VotingSupportInfo {
                // uint256 supportType;
                // uint256 quorumType;
                // uint256 support;
                // uint256 quorum;
                //         }

                // struct VotingTimeInfo {
                // uint256 votingPeriod;
                // uint256 gracePeriod;
                // uint256 creationTime;
                // uint256 stopVoteTime;
                //         }

                // struct VotingAssetInfo {
                // uint256 votingAssetType;
                // address tokenAddress;
                // uint256 tokenID;
                // uint256 votingWeightedType;
                //         }
                state = BigInt.fromI32(rel.value.state)
                supportType = rel.value.supportInfo.supportType
                quorumType = rel.value.supportInfo.quorumType
                support = rel.value.supportInfo.support
                quorum = rel.value.supportInfo.quorum

                votingAssetType = rel.value.votingAssetInfo.votingAssetType
                tokenAddress = rel.value.votingAssetInfo.tokenAddress
                tokenID = rel.value.votingAssetInfo.tokenID
                votingWeightedType = rel.value.votingAssetInfo.votingWeightedType
                votingPeriod = rel.value.timeInfo.votingPeriod
                votingPeriod = rel.value.timeInfo.votingPeriod
                gracePeriod = rel.value.timeInfo.gracePeriod
                stopVoteTime = rel.value.timeInfo.stopVoteTime
            }
        }
    }
    entity.proposer = event.transaction.from;
    entity.daoAddress = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.createTime = event.block.timestamp;
    entity.supportType = supportType
    entity.quorumType = quorumType
    entity.support = support
    entity.quorum = quorum
    entity.votingAssetType = votingAssetType
    entity.tokenAddress = tokenAddress
    entity.tokenID = tokenID
    entity.votingWeightedType = votingWeightedType
    entity.votingPeriod = votingPeriod
    entity.gracePeriod = gracePeriod
    entity.stopVoteTime = stopVoteTime
    entity.state = state;
    entity.save();
}

