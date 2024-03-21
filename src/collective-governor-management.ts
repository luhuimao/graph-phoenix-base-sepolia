import { BigInt } from "@graphprotocol/graph-ts"
import {
    ColletiveGovernorManagementAdapterContract,
    ProposalCreated,
    ProposalProcessed,
    GovernorQuit
} from "../generated/ColletiveGovernorManagementAdapterContract/ColletiveGovernorManagementAdapterContract"
import {
    VintageGovernorMangementProposal,
    CollectiveProposalVoteInfo
} from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = new VintageGovernorMangementProposal(event.params.proposalId.toHexString());
    const contract = ColletiveGovernorManagementAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    if (!rel.reverted) {
        entity.daoAddr = event.params.daoAddr;
        entity.proposer = event.transaction.from;
        entity.proposalId = event.params.proposalId;
        entity.governorAddress = event.params.account;
        entity.creationTime = event.block.timestamp;
        entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
        entity.stopVoteTime = rel.value.getStopVoteTime();
        entity.stopVoteTimeString = new Date(entity.stopVoteTime.toI64() * 1000).toISOString();
        entity.state = BigInt.fromI32(rel.value.getState());
        entity.stateInString = "";
        entity.type = BigInt.fromI32(rel.value.getPType());
        entity.typeInString = "";
        entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        entity.save();
    }
}


export function handlerProposalProcessed(event: ProposalProcessed): void {
    let entity = VintageGovernorMangementProposal.load(event.params.proposalId.toHexString());
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
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