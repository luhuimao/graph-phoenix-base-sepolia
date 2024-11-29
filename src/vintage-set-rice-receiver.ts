/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-06 11:00:10
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-04-27 15:08:11
 */
import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
    VintageSetRiceReceiverProposalAdapterContract,
    ProposalProcessed,
    ProposalCreated
} from "../generated/VintageSetRiceReceiverProposalAdapterContract/VintageSetRiceReceiverProposalAdapterContract"
import {
    VintageProposalVoteInfo,
    VintageSetRiceReceiverProposalEntity,
    VintageDaoSetProposal,
    VintageDaoEntity
} from "../generated/schema";
// import { ethers } from "ethers";
export function handleProposalCreated(event: ProposalCreated): void {
    let entity = new VintageSetRiceReceiverProposalEntity(event.params.proposalId.toHexString());

    const contract = VintageSetRiceReceiverProposalAdapterContract.bind(event.address);
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
    entity.riceReceiver = event.params.riceReceiver;
    entity.state = !rel.reverted ? BigInt.fromI32(rel.value.getState()) : BigInt.zero();
    entity.stateInString = "Voting";
    entity.vintageDaoEntity = event.params.daoAddr.toHexString();
    entity.save();

    let daosetentity = new VintageDaoSetProposal(event.params.proposalId.toHexString())

    daosetentity.daoAddr = event.params.daoAddr;
    daosetentity.proposer = event.transaction.from;
    daosetentity.creationTime = event.block.timestamp;
    daosetentity.proposalId = event.params.proposalId;
    daosetentity.executeHash = Bytes.empty();
    daosetentity.proposalType = BigInt.fromI32(10);
    // INVESTOR_CAP,
    // GOVERNOR_MEMBERSHIP,
    // INVESTOR_MEMBERSHIP,
    // VOTING
    daosetentity.proposalTypeString = "RICE_RECEIVER";
    daosetentity.state = BigInt.fromI32(0);
    daosetentity.vintageDaoEntity = event.params.daoAddr.toHexString();

    daosetentity.save();

}


export function handleProposalProcessed(event: ProposalProcessed): void {
    let entity = VintageSetRiceReceiverProposalEntity.load(event.params.proposalId.toHexString());
    if (entity) {
        entity.executeHash = event.transaction.hash;
        entity.executeTime = event.block.timestamp;
        entity.state = BigInt.fromI32(event.params.state);
        entity.stateInString = event.params.state == 2 ? "Done" : "Failed";

        entity.save();
    }

    let daosetentity = VintageDaoSetProposal.load(event.params.proposalId.toHexString())
    if (daosetentity) {
        daosetentity.executeHash = event.transaction.hash;
        daosetentity.state = BigInt.fromI32(event.params.state);
        daosetentity.save();
    }

    if (event.params.state == 2) {
        let vinDaoEntity = VintageDaoEntity.load(event.params.daoAddr.toHexString());
        if (vinDaoEntity) {
            const contract = VintageSetRiceReceiverProposalAdapterContract.bind(event.address);
            const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);

            vinDaoEntity.riceReceiver = !rel.reverted ? rel.value.getRiceReceiver() : vinDaoEntity.riceReceiver;
            vinDaoEntity.save();
        }
    }

    let voteInfoEntity = VintageProposalVoteInfo.load(event.params.proposalId.toHexString());
    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}