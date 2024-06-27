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
    ColletiveClearFundProposalAdapterContract,
    ProposalCreated,
    ProposalProcessed
} from "../generated/ColletiveClearFundProposalAdapterContract/ColletiveClearFundProposalAdapterContract";
import { DaoRegistry } from "../generated/ColletiveClearFundProposalAdapterContract/DaoRegistry";
import {
    CollectiveClearFundProposalEntity,
    CollectiveProposalVoteInfo
} from "../generated/schema"


export function handleProposalCreated(event: ProposalCreated): void {
    let entity = CollectiveClearFundProposalEntity.load(event.params.proposalId.toHexString())
    const colletiveClearFundProposalAdapterContract = ColletiveClearFundProposalAdapterContract.bind(event.address);
    const rel = colletiveClearFundProposalAdapterContract.try_proposals(event.params.daoAddr, event.params.proposalId);


    let stopVotingTime: BigInt = BigInt.fromI32(0);
    if (!rel.reverted) stopVotingTime = rel.value.getStopVoteTime();
    if (!entity) {
        entity = new CollectiveClearFundProposalEntity(event.params.proposalId.toHexString())
    }
    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.creationTime = event.block.timestamp;
    entity.stopVotingTime = stopVotingTime;
    entity.proposer = event.transaction.from;
    entity.state = BigInt.fromI32(0);
    entity.executeTime = BigInt.fromI32(0);
    entity.executeHash = Bytes.empty();
    entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleProposalExecuted(event: ProposalProcessed): void {
    let entity = CollectiveClearFundProposalEntity.load(event.params.proposalId.toHexString());

    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
        entity.executeTime = event.block.timestamp;
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