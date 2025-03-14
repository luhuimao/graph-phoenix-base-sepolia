
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
    FlexProposalVoteInfo,
    FlexDaosetProposal,
    FlexDaoEntity,
    FlexDaoVoteConfigEntity
} from "../generated/schema";
import { newFlexProposalVoteInfoEntity } from "./flex-daoset-contract"

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

    let daosetentity = new FlexDaosetProposal(event.params.proposalId.toHexString())
    daosetentity.daoAddr = event.params.daoAddr;
    daosetentity.proposalId = event.params.proposalId;
    daosetentity.proposer = event.transaction.from;
    daosetentity.executeHash = Bytes.empty();
    daosetentity.proposalType = BigInt.fromI32(10);
    // INVESTOR_CAP,
    // GOVERNOR_MEMBERSHIP,
    // INVESTOR_MEMBERSHIP,
    // VOTING,
    // FEES,
    // PROPOSER_MEMBERHSIP,
    // POLL_FOR_INVESTMENT

    daosetentity.proposalTypeString = "RICE_RECEIVER";
    daosetentity.state = BigInt.fromI32(0);
    daosetentity.creationTime = event.block.timestamp;
    daosetentity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    daosetentity.flexDaoEntity = event.params.daoAddr.toHexString();
    daosetentity.save();

    newFlexProposalVoteInfoEntity(event.params.daoAddr, event.params.proposalId);
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
    let daosetentity = FlexDaosetProposal.load(event.params.proposalId.toHexString())
    if (daosetentity) {
        daosetentity.executeHash = event.transaction.hash;
        daosetentity.state = BigInt.fromI32(event.params.state);
        daosetentity.save();
    }

    if (event.params.state == 2) {
        let flexDaoEntity = FlexDaoEntity.load(event.params.daoAddr.toHexString());
        if (flexDaoEntity) {
            const contract = FlexSetRiceReceiverProposalAdapterContract.bind(event.address);
            const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);

            flexDaoEntity.riceReceiver = !rel.reverted ? rel.value.getRiceReceiver() : flexDaoEntity.riceReceiver;
            flexDaoEntity.save();
        }
    }

    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());
    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}