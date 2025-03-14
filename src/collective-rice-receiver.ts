/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
    * @Date: 2022 - 11 - 22 15: 32:03
        * @LastEditors: huhuimao
            * @LastEditTime: 2023 - 10 - 16 14: 28: 21
                */
import { BigInt, Bytes, Address, log, bigInt, Entity } from "@graphprotocol/graph-ts"
import {
    colletiveSetRiceReceiverProposalAdapterContract,
    ProposalCreated,
    ProposalProcessed
} from "../generated/colletiveSetRiceReceiverProposalAdapterContract/colletiveSetRiceReceiverProposalAdapterContract";
import { DaoRegistry } from "../generated/ColletiveClearFundProposalAdapterContract/DaoRegistry";
import {
    CollectiveProposalVoteInfo,
    CollectiveSetRiceReceiverProposalEntity,
    CollectiveDaoSetProposalEntity,
    CollectiveDaoEntity,
    CollectiveDaoVoteConfigEntity
} from "../generated/schema"
import { newCollectiveProposalVoteInfoEntity } from "./collective-clear-fund-proposal";


export function handleProposalCreated(event: ProposalCreated): void {
    let entity = new CollectiveSetRiceReceiverProposalEntity(event.params.proposalId.toHexString());
    let daosetentity = new CollectiveDaoSetProposalEntity(event.params.proposalId.toHexString())

    const contract = colletiveSetRiceReceiverProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    entity.creationTime = event.block.timestamp;
    entity.stopVotingTime = !rel.reverted ? rel.value.getStopVoteTime() : BigInt.zero();
    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.executeHash = Bytes.empty();
    entity.executeTime = BigInt.zero();
    entity.proposer = event.transaction.from;
    entity.riceReceiver = !rel.reverted ? rel.value.getRiceReceiver() : Bytes.empty();
    entity.state = !rel.reverted ? BigInt.fromI32(rel.value.getState()) : BigInt.zero();
    entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
    entity.save();

    daosetentity.daoAddr = event.params.daoAddr;
    daosetentity.proposer = event.transaction.from;
    daosetentity.creationTime = event.block.timestamp;
    daosetentity.proposalId = event.params.proposalId;
    daosetentity.executeHash = Bytes.empty();
    daosetentity.proposalType = BigInt.fromI32(10);
    daosetentity.proposalTypeString = "RICE_RECEIVER";
    daosetentity.collectiveDaoEntity = event.params.daoAddr.toHexString();
    daosetentity.state = BigInt.fromI32(0);
    daosetentity.save();

    newCollectiveProposalVoteInfoEntity(event.params.daoAddr, event.params.proposalId);
}

export function handleProposalProcessed(event: ProposalProcessed): void {
    let entity = CollectiveSetRiceReceiverProposalEntity.load(event.params.proposalId.toHexString());

    if (entity) {
        entity.executeHash = event.transaction.hash;
        entity.executeTime = event.block.timestamp;
        entity.state = BigInt.fromI32(event.params.state);

        entity.save();
    }

    if (event.params.state == 2) {
        const contract = colletiveSetRiceReceiverProposalAdapterContract.bind(event.address);

        const collectiveDaoEntity = CollectiveDaoEntity.load(event.params.daoAddr.toHexString());
        if (collectiveDaoEntity) {
            const contract = colletiveSetRiceReceiverProposalAdapterContract.bind(event.address);
            const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
            collectiveDaoEntity.riceReceiver = !rel.reverted ? rel.value.getRiceReceiver() : collectiveDaoEntity.riceReceiver;
            collectiveDaoEntity.save();
        }

    }

    let daosetentity = CollectiveDaoSetProposalEntity.load(event.params.proposalId.toHexString())
    if (daosetentity) {
        daosetentity.executeHash = event.transaction.hash;
        daosetentity.state = BigInt.fromI32(event.params.state);
        daosetentity.save();
    }

    let voteInfoEntity = CollectiveProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}