import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
    ColletiveTopUpProposalAdapterContract,
    ProposalCreated,
    ProposalProcessed,
    StartVoting
} from "../generated/ColletiveTopUpProposalAdapterContract/ColletiveTopUpProposalAdapterContract"
import {
    CollectiveTopUpProposalEntity,
    CollectiveProposalVoteInfo
} from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {

    let entity = new CollectiveTopUpProposalEntity(event.params.proposalId.toHexString());
    const topupCon = ColletiveTopUpProposalAdapterContract.bind(event.address);
    const rel = topupCon.try_proposals(event.params.daoAddr, event.params.proposalId);
    if (!rel.reverted) {
        entity.daoAddr = event.params.daoAddr;
        entity.proposalId = event.params.proposalId;
        entity.account = rel.value.getAccount();
        entity.amount = rel.value.getAmount();
        entity.creationTime = rel.value.getCreationTime();
        entity.state = BigInt.fromI32(rel.value.getState());
        entity.stopVoteTime = rel.value.getStopVoteTime();
        entity.token = rel.value.getToken();
    }
    entity.executeHash = Bytes.empty();
    entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleProposalProcessed(event: ProposalProcessed): void {
    let entity = CollectiveTopUpProposalEntity.load(event.params.proposalId.toHexString());
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

export function handleStartVoting(event: StartVoting): void { }