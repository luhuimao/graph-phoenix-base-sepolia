/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-06 11:00:10
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-17 14:47:29
 */
// import { BigInt } from "@graphprotocol/graph-ts"
// import { EnsResolver } from "ethers"
// import { EventLog } from "ethers/types/contract"
import { BigInt } from "@graphprotocol/graph-ts";
import {
    FlexPollingVotingContract,
    SubmitVote
} from "../generated/FlexPollingVotingContract/FlexPollingVotingContract"
import { FlexPollVoting, FlexProposalVoteInfo } from "../generated/schema"

export function handleSubmitVote(event: SubmitVote): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = FlexPollVoting.load(event.transaction.hash.toHex());
    const flexPollingVoteContract = FlexPollingVotingContract.bind(event.address);
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new FlexPollVoting(event.transaction.hash.toHex())
    }
    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());
    if (!voteInfoEntity) {
        voteInfoEntity = new FlexProposalVoteInfo(event.params.proposalId.toHexString())
        voteInfoEntity.totalWeights = BigInt.fromI32(0);
    }

    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.voter = event.params.voter;
    entity.voteValue = event.params.voteValue;
    entity.votedTimeStamp = event.params.votingTime;
    entity.votedDateTimeString = new Date(event.params.votingTime.toI64() * 1000).toISOString();
    entity.votingWeight = flexPollingVoteContract.getVotingWeight(event.params.daoAddr, event.params.voter);
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    // Entities can be written to the store with `.save()`
    entity.save()

    voteInfoEntity.daoAddr = event.params.daoAddr;
    voteInfoEntity.proposalId = event.params.proposalId;
    voteInfoEntity.startVoteTime = event.params.voteStartTime;
    voteInfoEntity.stopVoteTime = event.params.voteStopTime;
    voteInfoEntity.startVoteTimeString = new Date(event.params.voteStartTime.toI64() * 1000).toISOString();
    voteInfoEntity.stopVoteTimeString = new Date(event.params.voteStopTime.toI64() * 1000).toISOString();
    voteInfoEntity.nbYes = event.params.nbYes;
    voteInfoEntity.nbNo = event.params.nbNo;
    voteInfoEntity.currentSupport = event.params.currentSupportf;
    voteInfoEntity.currentQuorum = event.params.currentQuorum;
    voteInfoEntity.save();
}
