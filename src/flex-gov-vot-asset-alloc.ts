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
    FlexGovernorVotingAssetAllocationProposalAdapterContract,
    ProposalProcessed,
    ProposalCreated
} from "../generated/FlexGovernorVotingAssetAllocationProposalAdapterContract/FlexGovernorVotingAssetAllocationProposalAdapterContract"
import { FLexGovernorVotingAssetAllocationProposalEntity, FlexProposalVoteInfo } from "../generated/schema";

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = new FLexGovernorVotingAssetAllocationProposalEntity(event.params.proposalId.toHexString());

    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.proposer = event.transaction.from;
    entity.state = BigInt.zero();
    entity.executeHash = Bytes.empty();
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    entity.creationTime = event.block.timestamp;
    entity.createTimeString = new Date(entity.creationTime.toI64() * 1000).toISOString();
    entity.stopVoteTime = event.params.stopVoteTime;
    entity.stopVoteTimeString = new Date(entity.stopVoteTime.toI64() * 1000).toISOString();


    let tem: string[] = [];
    if (event.params.governors.length > 0) {
        for (let j = 0; j < event.params.governors.length; j++) {
            tem.push(event.params.governors[j].toHexString())
        }
    }
    entity.governors = tem;

    let tem1: BigInt[] = [];
    if (event.params.allocations.length > 0) {
        for (let j = 0; j < event.params.allocations.length; j++) {
            tem1.push(event.params.allocations[j])
        }
    }
    entity.allocations = tem1;
    entity.typeInString = "Governor Voting Asset Allocation";
    entity.save();
}

export function handleProposalProcessed(event: ProposalProcessed): void {
    let entity = FLexGovernorVotingAssetAllocationProposalEntity.load(event.params.proposalId.toHexString());

    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
        entity.executeHash = event.transaction.hash;

        entity.save();
    }

    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());
    if (voteInfoEntity) {
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }

}
