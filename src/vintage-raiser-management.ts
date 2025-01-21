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
    VintageRaiserManagementContract,
    ProposalProcessed,
    ProposalCreated
} from "../generated/VintageRaiserManagementContract/VintageRaiserManagementContract"

import { DaoRegistry } from "../generated/VintageRaiserManagementContract/DaoRegistry";
import { VintageVotingContract } from "../generated/VintageRaiserManagementContract/VintageVotingContract";

import {
    VintageGovernorManagementProposal,
    VintageProposalVoteInfo,
    VintageGovernorOutVotingToBeRemovedEntity,
    VintageGovernorInVotingToBeAllocatedEntity
} from "../generated/schema";
// import { ethers } from "ethers";
export function handleProposalCreated(event: ProposalCreated): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageGovernorManagementProposal.load(event.params.proposalId.toHexString())
    const contract = VintageRaiserManagementContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageGovernorManagementProposal(event.params.proposalId.toHexString())

        // Entity fields can be set using simple assignments
    }

    // BigInt and BigDecimal math are supported

    // Entity fields can be set based on event parameters
    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    // entity.proposalIdUTF8String = ethers.toUtf8String(event.params.proposalId);
    entity.daoAddr = event.params.daoAddr;
    entity.proposer = event.transaction.from;
    entity.governorAddress = event.params.account;
    entity.creationTime = event.params.creationTime;
    entity.createTimeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.stopVoteTime = event.params.stopVoteTime;
    entity.stopVoteTimeString = new Date(event.params.stopVoteTime.toI64() * 1000).toISOString();
    entity.state = BigInt.fromI32(0);
    entity.stateInString = "Voting";
    entity.type = BigInt.fromI32(event.params.pType);
    entity.typeInString = event.params.pType == 0 ? "Governor In" : "Governor Out";
    entity.allocation = BigInt.fromI32(0);
    if (!rel.reverted) {
        entity.allocation = rel.value.getAllocation();
    }
    entity.executeHash = Bytes.empty();
    entity.vintageDaoEntity = event.params.daoAddr.toHexString();
    // Entities can be written to the store with `.save()`
    entity.save()

    const daoContr = DaoRegistry.bind(event.params.daoAddr);
    const vinVotingAdaptContrAddr = daoContr.getAdapterAddress(Bytes.fromHexString("0xd3999c37f8f35da86f802a74f9bf032c4aeb46e49abd9c861f489ef4cb40d0a8"));
    const vinVotingAdaptContr = VintageVotingContract.bind(vinVotingAdaptContrAddr);

    if (event.params.pType == 1) {

        const votingToBeRemoved = vinVotingAdaptContr.try_getVotingWeight(
            event.params.daoAddr,
            event.params.account
        )
        const vintageGovernorOutVotingToBeRemovedEntity = new VintageGovernorOutVotingToBeRemovedEntity(
            event.params.daoAddr.toHexString() +
            event.params.proposalId.toHexString() +
            event.params.account.toHexString());

        vintageGovernorOutVotingToBeRemovedEntity.daoAddr = event.params.daoAddr;
        vintageGovernorOutVotingToBeRemovedEntity.governorOutProposalId = event.params.proposalId;
        vintageGovernorOutVotingToBeRemovedEntity.account = event.params.account;
        vintageGovernorOutVotingToBeRemovedEntity.votingToBeRemoved = votingToBeRemoved.reverted ? BigInt.zero() : votingToBeRemoved.value;
        vintageGovernorOutVotingToBeRemovedEntity.save();
    }

    if (event.params.pType == 0) {
        const votingToBeAllocated = vinVotingAdaptContr.try_getVintageVotingWeightToBeAllocated(
            event.params.daoAddr,
            entity.allocation
        )
        const vintageGovernorInVotingToBeAllocatedEntity = new VintageGovernorInVotingToBeAllocatedEntity(
            event.params.daoAddr.toHexString() +
            event.params.proposalId.toHexString() +
            event.params.account.toHexString());

        vintageGovernorInVotingToBeAllocatedEntity.daoAddr = event.params.daoAddr;
        vintageGovernorInVotingToBeAllocatedEntity.governorInProposalId = event.params.proposalId;
        vintageGovernorInVotingToBeAllocatedEntity.account = event.params.account;
        vintageGovernorInVotingToBeAllocatedEntity.votingToBeAllocated = votingToBeAllocated.reverted ? BigInt.zero() : votingToBeAllocated.value;
        vintageGovernorInVotingToBeAllocatedEntity.save();
    }

}

export function handleProposalProcessed(event: ProposalProcessed): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageGovernorManagementProposal.load(event.params.proposalId.toHexString())
    // BigInt and BigDecimal math are supported
    if (entity) {   // Entity fields can be set based on event parameters
        entity.state = BigInt.fromI32(event.params.state);
        entity.stateInString = event.params.state == 2 ? "Passed" : "Failed";
        entity.executeHash = event.transaction.hash;
        // Entities can be written to the store with `.save()`
        entity.save()
    }

    let voteInfoEntity = VintageProposalVoteInfo.load(event.params.proposalId.toHexString());
    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}
