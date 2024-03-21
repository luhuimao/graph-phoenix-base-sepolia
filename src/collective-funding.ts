import { BigInt } from "@graphprotocol/graph-ts"
import {
    ColletiveFundingProposalAdapterContract,
    ProposalCreated,
    ProposalExecuted,
    StartVoting
} from "../generated/ColletiveFundingProposalAdapterContract/ColletiveFundingProposalAdapterContract"
import {
    CollectiveFundingProposalEntity,
    CollectiveProposalVoteInfo
} from "../generated/schema"
// import { encodeBase58 } from "ethers";

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = new CollectiveFundingProposalEntity(event.params.proposalId.toHexString());
    const contract = ColletiveFundingProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    if (!rel.reverted) {
        entity.approver = rel.value.getEscrowInfo().approver
        entity.escrow = rel.value.getEscrowInfo().escrow
        entity.paybackAmount = rel.value.getEscrowInfo().paybackAmount
        entity.paybackToken = rel.value.getEscrowInfo().paybackToken
        entity.price = rel.value.getEscrowInfo().price

        entity.executeBlockNum = rel.value.getExecuteBlockNum()

        entity.fundingAmount = rel.value.getFundingInfo().fundingAmount
        entity.receiver = rel.value.getFundingInfo().receiver
        entity.token = rel.value.getFundingInfo().token
        entity.totalAmount = rel.value.getFundingInfo().totalAmount

        entity.proposer = rel.value.getProposer()

        entity.state = BigInt.fromI32(rel.value.getState())

        entity.startVotingTime = rel.value.getTimeInfo().startVotingTime
        entity.stopVotingTime = rel.value.getTimeInfo().stopVotingTime

        entity.cliffEndTime = rel.value.getVestingInfo().cliffEndTime
        entity.cliffVestingAmount = rel.value.getVestingInfo().cliffVestingAmount
        entity.vestingEndTime = rel.value.getVestingInfo().endTime
        entity.vestingStartTime = rel.value.getVestingInfo().startTime
        entity.vestingInterval = rel.value.getVestingInfo().vestingInterval
        entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        entity.save();
    }
}

export function handlerProposalProcessed(event: ProposalExecuted): void {
    let entity = CollectiveFundingProposalEntity.load(event.params.proposalId.toHexString());
    const contract = ColletiveFundingProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);

    if (!rel.reverted && entity) {
        entity.state = BigInt.fromI32(rel.value.getState());
        entity.executeBlockNum = rel.value.getExecuteBlockNum();
        entity.save();
    }

    let voteInfoEntity = CollectiveProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}

export function handlerStartVoting(event: StartVoting): void {
    let entity = CollectiveFundingProposalEntity.load(event.params.proposalId.toHexString());
    const contract = ColletiveFundingProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    if (!rel.reverted && entity) {
        entity.startVotingTime = rel.value.getTimeInfo().startVotingTime;
        entity.stopVotingTime = rel.value.getTimeInfo().stopVotingTime;
        entity.state = BigInt.fromI32(rel.value.getState());
        entity.save();
    }
}