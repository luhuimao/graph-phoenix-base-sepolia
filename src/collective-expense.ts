import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
    ColletiveExpenseProposalAdapterContract,
    ProposalCreated,
    ProposalProcessed
} from "../generated/ColletiveExpenseProposalAdapterContract/ColletiveExpenseProposalAdapterContract"
import {
    CollectiveExpenseProposalEntity,
    CollectiveProposalVoteInfo,
    CollectiveDaoVoteConfigEntity
} from "../generated/schema"
import { newCollectiveProposalVoteInfoEntity } from "./collective-clear-fund-proposal";

export function handleProposalCreated(event: ProposalCreated): void {
    const contract = ColletiveExpenseProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    let entity = new CollectiveExpenseProposalEntity(event.params.proposalId.toHexString());
    if (!rel.reverted) {

        entity.daoAddr = event.params.daoAddr;
        entity.proposalId = event.params.proposalId;
        entity.amount = rel.value.getAmount();
        entity.creationTime = rel.value.getCreationTime();
        entity.receiver = rel.value.getReceiver();
        entity.state = BigInt.fromI32(rel.value.getState());
        entity.stopVoteTime = rel.value.getStopVoteTime();
        entity.tokenAddress = rel.value.getTokenAddress();
        entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        entity.executeHash = Bytes.empty();
        entity.proposer = event.transaction.from;
        entity.save();
    }

    newCollectiveProposalVoteInfoEntity(event.params.daoAddr, event.params.proposalId);
}

export function handlerProposalProcessed(event: ProposalProcessed): void {
    let entity = CollectiveExpenseProposalEntity.load(event.params.proposalId.toHexString());
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
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

