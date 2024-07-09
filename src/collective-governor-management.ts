import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
    ColletiveGovernorManagementAdapterContract,
    ProposalCreated,
    ProposalProcessed,
    GovernorQuit,
    StartVoting
} from "../generated/ColletiveGovernorManagementAdapterContract/ColletiveGovernorManagementAdapterContract"
import {
    CollectiveGovernorManagementProposal,
    CollectiveProposalVoteInfo
} from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = new CollectiveGovernorManagementProposal(event.params.proposalId.toHexString());
    const contract = ColletiveGovernorManagementAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    if (!rel.reverted) {
        entity.daoAddr = event.params.daoAddr;
        entity.proposer = event.transaction.from;
        entity.proposalId = event.params.proposalId;
        entity.governorAddress = event.params.account;
        entity.creationTime = event.block.timestamp;
        entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
        entity.startVoteTime = rel.value.getStartVoteTime();
        entity.startVoteTimeString = new Date(entity.startVoteTime.toI64() * 1000).toISOString();
        entity.stopVoteTime = rel.value.getStopVoteTime();
        entity.stopVoteTimeString = new Date(entity.stopVoteTime.toI64() * 1000).toISOString();
        entity.state = BigInt.fromI32(rel.value.getState());
        entity.stateInString = rel.value.getState() == 0 ? "Submitted" : "Voting";
        entity.type = BigInt.fromI32(rel.value.getPType());
        entity.typeInString = rel.value.getPType() == 0 ? "Member In" : "Member Out";
        entity.executeHash = Bytes.empty();
        entity.depositAmount = rel.value.getDepositAmount();
        entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        entity.save();
    }
}


export function handlerProposalProcessed(event: ProposalProcessed): void {
    let entity = CollectiveGovernorManagementProposal.load(event.params.proposalId.toHexString());
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
        entity.stateInString = event.params.state == 3 ? "Succeed" : "Failed";
        entity.executeHash = event.transaction.hash;
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


export function handleGovernorQuit(event: GovernorQuit): void { }


export function handlerStartVoting(event: StartVoting): void {
    let entity = CollectiveGovernorManagementProposal.load(event.params.proposalId.toHexString());
    // const collectiveGovernorManagementAdapterContract = ColletiveGovernorManagementAdapterContract.bind(event.address);
    // const proposalInfo = collectiveGovernorManagementAdapterContract.proposals(event.params.daoAddr, event.params.proposalId);
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
        entity.stateInString = event.params.state == 1 ? "Voting" : "Failed";
        entity.startVoteTime = event.params.startVoteTime;
        entity.startVoteTimeString = new Date(entity.startVoteTime.toI64() * 1000).toISOString();
        entity.stopVoteTime = event.params.stopVoteTime;
        entity.stopVoteTimeString = new Date(entity.stopVoteTime.toI64() * 1000).toISOString();
        entity.save();
    }
}