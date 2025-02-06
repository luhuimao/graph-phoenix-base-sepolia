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
    StewardManagementContract,
    ProposalProcessed,
    ProposalCreated
} from "../generated/StewardManagementContract/StewardManagementContract";
import { FlexVotingContract } from "../generated/StewardManagementContract/FlexVotingContract";
import { DaoRegistry } from "../generated/StewardManagementContract/DaoRegistry";
import { ERC20 } from "../generated/StewardManagementContract/ERC20";
import { ERC721 } from "../generated/StewardManagementContract/ERC721";
import { ERC1155 } from "../generated/StewardManagementContract/ERC1155";
import { newFlexProposalVoteInfoEntity } from "./flex-daoset-contract"
import {
    FlexStewardMangementProposal,
    FlexProposalVoteInfo,
    FlexGovernorOutVotingToBeRemovedEntity,
    FlexGovernorInVotingToBeAllocatedEntity,
    FlexDaoVoteConfigEntity
} from "../generated/schema";
// import { ethers } from "ethers";
export function handleProposalCreated(event: ProposalCreated): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = FlexStewardMangementProposal.load(event.params.proposalId.toHexString())
    const contract = StewardManagementContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new FlexStewardMangementProposal(event.params.proposalId.toHexString())

        // Entity fields can be set using simple assignments
    }

    // BigInt and BigDecimal math are supported
    // Entity fields can be set based on event parameters
    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.propopser = event.transaction.from;
    // entity.proposalIdUTF8String = ethers.toUtf8String(event.params.proposalId);
    entity.daoAddr = event.params.daoAddr;
    entity.stewardAddress = event.params.account;
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
    entity.flexDaoEntity = event.params.daoAddr.toHexString();
    // Entities can be written to the store with `.save()`
    entity.save()

    const daoCont = DaoRegistry.bind(event.params.daoAddr);
    const flexVotingAdaptContrAddr = daoCont.getAdapterAddress(Bytes.fromHexString("0x0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7"));
    const flexVotingAdaptContr = FlexVotingContract.bind(flexVotingAdaptContrAddr);

    if (event.params.pType == 1) {
        const votingToBeRemoved = flexVotingAdaptContr.try_getVotingWeight(
            event.params.daoAddr, event.params.account
        );
        let flexGovernorOutVotingToBeRemovedEntity = new FlexGovernorOutVotingToBeRemovedEntity(
            event.params.daoAddr.toHexString() +
            event.params.proposalId.toHexString() +
            event.params.account.toHexString()
        );

        flexGovernorOutVotingToBeRemovedEntity.daoAddr = event.params.daoAddr;
        flexGovernorOutVotingToBeRemovedEntity.governorOutProposalId = event.params.proposalId;
        flexGovernorOutVotingToBeRemovedEntity.account = event.params.account;
        flexGovernorOutVotingToBeRemovedEntity.votingToBeRemoved = votingToBeRemoved.reverted ?
            BigInt.zero() : votingToBeRemoved.value;

        flexGovernorOutVotingToBeRemovedEntity.save();
    }

    if (event.params.pType == 0) {
        const FLEX_VOTING_ASSET_TYPE = daoCont.getConfiguration(Bytes.fromHexString("0x75b7d343967750d1f6c15979b7559cea8be22ff1a06a51681b9cbef0d2fff4fe"));
        const FLEX_VOTING_ASSET_TOKEN_ID = daoCont.getConfiguration(Bytes.fromHexString("0x77b1580d1632c74a32483c26a7156260a89ae4138b020ea7d09b0dcf24f1ea24"));
        const FLEX_VOTING_ASSET_TOKEN_ADDRESS = daoCont.getAddressConfiguration(Bytes.fromHexString("0xb5a1ad3f04728d7c38547e3d43006a1ec090a02fce04bbb1d0ee4519a1921e57"));
        let assetAmount = BigInt.zero();
        switch (FLEX_VOTING_ASSET_TYPE.toI32()) {
            // 0. ERC20 1. ERC721, 2. ERC1155 3.allocation
            case 0:
                const erc20Contr = ERC20.bind(FLEX_VOTING_ASSET_TOKEN_ADDRESS);
                const bal1 = erc20Contr.try_balanceOf(event.params.account);
                assetAmount = bal1.reverted ? BigInt.zero() : bal1.value.div(BigInt.fromI64(10 ** 18));
                break;
            case 1:
                const erc721Contr = ERC721.bind(FLEX_VOTING_ASSET_TOKEN_ADDRESS);
                const bal2 = erc721Contr.try_balanceOf(event.params.account);
                assetAmount = bal2.reverted ? BigInt.zero() : bal2.value;
                break;
            case 2:
                const erc1155Contr = ERC1155.bind(FLEX_VOTING_ASSET_TOKEN_ADDRESS);
                const bal3 = erc1155Contr.try_balanceOf(event.params.account, FLEX_VOTING_ASSET_TOKEN_ID);
                assetAmount = bal3.reverted ? BigInt.zero() : bal3.value;
                break;
            case 3:
                assetAmount = entity.allocation;
                break;
            default:
                break;
        }
        const votingToBeAllocated = flexVotingAdaptContr.try_getFlexVotingWeightToBeAllocated(
            event.params.daoAddr,
            assetAmount
        );

        let flexGovernorInVotingToBeAllocatedEntity = new FlexGovernorInVotingToBeAllocatedEntity(
            event.params.daoAddr.toHexString() +
            event.params.proposalId.toHexString() +
            event.params.account.toHexString());

        flexGovernorInVotingToBeAllocatedEntity.daoAddr = event.params.daoAddr;
        flexGovernorInVotingToBeAllocatedEntity.governorInProposalId = event.params.proposalId;
        flexGovernorInVotingToBeAllocatedEntity.account = event.params.account;
        flexGovernorInVotingToBeAllocatedEntity.votingToBeAllocated = votingToBeAllocated.reverted ?
            BigInt.zero() :
            votingToBeAllocated.value;
        flexGovernorInVotingToBeAllocatedEntity.save();
    }

    newFlexProposalVoteInfoEntity(event.params.daoAddr, event.params.proposalId);
}


export function handleProposalProcessed(event: ProposalProcessed): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = FlexStewardMangementProposal.load(event.params.proposalId.toHexString())
    // BigInt and BigDecimal math are supported
    if (entity) {   // Entity fields can be set based on event parameters
        entity.state = BigInt.fromI32(event.params.state);
        entity.stateInString = event.params.state == 2 ? "Passed" : "Failed";
        entity.executeHash = event.transaction.hash;
        // Entities can be written to the store with `.save()`
        entity.save()
    }
    let voteInfoEntity = FlexProposalVoteInfo.load(event.params.proposalId.toHexString());
    if (voteInfoEntity) {
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }

}
