import { BigInt } from "@graphprotocol/graph-ts"
import {
    ColletiveExpenseProposalAdapterContract,
    ProposalCreated,
    ProposalProcessed
} from "../generated/ColletiveExpenseProposalAdapterContract/ColletiveExpenseProposalAdapterContract"
import {
    CollectiveExpenseProposalEntity,
    CollectiveProposalVoteInfo
} from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    const contract = ColletiveExpenseProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    let entity = new CollectiveExpenseProposalEntity(event.params.proposalId.toHexString());
    if (!rel.reverted) {
        entity.amount = rel.value.getAmount();
        entity.creationTime = rel.value.getCreationTime();
        entity.receiver = rel.value.getReceiver();
        entity.state = BigInt.fromI32(rel.value.getState());
        entity.stopVoteTime = rel.value.getStopVoteTime();
        entity.tokenAddress = rel.value.getTokenAddress();
        entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        entity.save();
    }
}

export function handlerProposalProcessed(event: ProposalProcessed): void {
    let entity = CollectiveExpenseProposalEntity.load(event.params.proposalId.toHexString());
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

