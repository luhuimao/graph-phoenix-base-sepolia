
/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-06 11:00:10
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-07-25 18:28:40
 */
import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
    FlexSetRiceReceiverProposalAdapterContract,
    ProposalProcessed,
    ProposalCreated
} from "../generated/FlexSetRiceReceiverProposalAdapterContract/FlexSetRiceReceiverProposalAdapterContract"
import {
    FlexStewardMangementProposal,
    FlexSetRiceReceiverProposalEntity,
    FlexProposalVoteInfo
} from "../generated/schema";

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = new FlexSetRiceReceiverProposalEntity(event.params.proposalId.toHexString());

    const contract = FlexSetRiceReceiverProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    entity.creationTime = event.block.timestamp;
    entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.stopVoteTime = event.params.stopVoteTime;
    entity.stopVoteTimeString = new Date(entity.stopVoteTime.toI64() * 1000).toISOString();
    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.executeHash = Bytes.empty();
    entity.executeTime = BigInt.zero();
    entity.proposer = event.transaction.from;
    entity.riceReceiver = !rel.reverted ? rel.value.getRiceReceiver() : Bytes.empty();
    entity.state = !rel.reverted ? BigInt.fromI32(rel.value.getState()) : BigInt.zero();
    entity.stateInString = "Voting";
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleProposalProcessed(event: ProposalProcessed): void {
    let entity = FlexSetRiceReceiverProposalEntity.load(event.params.proposalId.toHexString());
    if (entity) {
        entity.executeHash = event.transaction.hash;
        entity.executeTime = event.block.timestamp;
        entity.state = BigInt.fromI32(event.params.state);
        entity.stateInString = event.params.state == 2 ? "Done" : "Failed";

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