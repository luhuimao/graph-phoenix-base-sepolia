/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-14 11:38:25
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-17 14:47:51
 */

import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
    FlexVesting,
    CreateVesting,
    Withdraw
} from "../generated/FlexVesting/FlexVesting"
// import { FlexFundingAdapterContract } from "../generated/FlexVesting/FlexFundingAdapterContract"
import { FlexVestingERC721, Transfer } from "../generated/FlexVestingERC721/FlexVestingERC721";
import { FlexVestEntity, FlexUserVestInfo, FlexVestingClaimedActivityEntity, FlexInvestmentProposal } from "../generated/schema"
// import { calendarFormat } from "moment";
export function handleCreateVesting(event: CreateVesting): void {
    let entity = FlexVestEntity.load(event.params.vestId.toString())

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new FlexVestEntity(event.params.vestId.toString())

        // Entity fields can be set using simple assignments
        // entity.count = BigInt.fromI32(0)
    }
    let vestingContract = FlexVesting.bind(event.address);

    // BigInt and BigDecimal math are supported
    // entity.count = entity.count + BigInt.fromI32(1)
    // Entity fields can be set based on event parameters
    entity.vestId = event.params.vestId
    
    entity.recipient = event.params.recipient;
    entity.originalRecipient = event.params.recipient;
    entity.proposalId = event.params.proposalId
    entity.cliffShares = event.params.cliffShares
    entity.stepShares = event.params.stepShares
    entity.tokenAddress = event.params.token
    entity.startTime = event.params.start
    entity.cliffDuration = event.params.cliffDuration
    entity.stepDuration = event.params.stepDuration
    entity.steps = event.params.steps
    entity.totalAmount = entity.stepShares * entity.steps + entity.cliffShares;
    entity.claimedAmount = BigInt.fromI32(0);
    entity.startTimeString = new Date(event.params.start.toI64() * 1000).toISOString();
    entity.cliffEndTimeString = new Date((event.params.start.toI64() +
        event.params.cliffDuration.toI64()) * 1000).toISOString();
    entity.vestEndTimeString = new Date(
        (
            event.params.start.toI64() +
            event.params.cliffDuration.toI64() +
            event.params.stepDuration.toI64() *
            event.params.steps.toI64()
        ) *
        1000
    ).toISOString();

    const vestInfo = vestingContract.vests(event.params.vestId);
    entity.nftToken = vestInfo.getNftInfo().nftToken;
    entity.tokenId = vestInfo.getNftInfo().tokenId;
    // Entities can be written to the store with `.save()`
    entity.save()

    let flexInvestmentProposalEntity = FlexInvestmentProposal.load(event.params.proposalId.toHexString());

    let flexUserVestInfo = FlexUserVestInfo.load(entity.proposalId.toHexString() + "-" + entity.recipient.toHexString());
    if (!flexUserVestInfo) {
        flexUserVestInfo = new FlexUserVestInfo(entity.proposalId.toHexString() + "-" + entity.recipient.toHexString());
        flexUserVestInfo.daoAddr = flexInvestmentProposalEntity ? flexInvestmentProposalEntity.daoAddress : Bytes.empty();
        flexUserVestInfo.investmentProposalId = event.params.proposalId;
        flexUserVestInfo.recipient = event.params.recipient;
        flexUserVestInfo.vestingStartTime = event.params.start;
        flexUserVestInfo.vestingCliffEndTime = flexInvestmentProposalEntity ? flexInvestmentProposalEntity.vestingCliffEndTime : BigInt.fromI32(0);
        flexUserVestInfo.vestingInterval = flexInvestmentProposalEntity ? flexInvestmentProposalEntity.vestingInterval : BigInt.fromI32(0);
        flexUserVestInfo.vestingEndTime = flexInvestmentProposalEntity ? flexInvestmentProposalEntity.vestingEndTime : BigInt.fromI32(0);
        flexUserVestInfo.totalAmount = flexInvestmentProposalEntity ? flexInvestmentProposalEntity.paybackTokenAmount : BigInt.fromI32(0);
        flexUserVestInfo.tokenAddress = flexInvestmentProposalEntity ? flexInvestmentProposalEntity.paybackTokenAddr : Bytes.empty();
    }
    flexUserVestInfo.created = true;
    flexUserVestInfo.save();
}


export function handleWithdraw(event: Withdraw): void {
    let entity = FlexVestEntity.load(event.params.vestId.toString())
    if (entity) {
        // let vestingContract = FlexVesting.bind(event.address);
        // let vestInfo = vestingContract.vests(event.params.vestId);
        entity.claimedAmount = entity.claimedAmount.plus(event.params.amount);
        entity.save();
    }

    let claimedEntity = FlexVestingClaimedActivityEntity.load(event.transaction.hash.toHexString());
    if (!claimedEntity) {
        claimedEntity = new FlexVestingClaimedActivityEntity(event.transaction.hash.toHexString());
        claimedEntity.account = event.transaction.from;
        claimedEntity.claimedAmount = event.params.amount;
        claimedEntity.vestId = event.params.vestId;
        claimedEntity.txHash = event.transaction.hash;
        claimedEntity.timeStamp = event.block.timestamp;
    }
    claimedEntity.save();
}

export function handleERC721Transfer(event: Transfer): void {
    const nftContract = FlexVestingERC721.bind(event.address);
    const tokenId = event.params.id;
    const newOwner = event.params.to;

    const vestintContr = FlexVesting.bind(nftContract.vestAddress());
    const vestId = vestintContr.getVestIdByTokenId(event.address, tokenId);

    let entity = FlexVestEntity.load(vestId.toString())
    if (entity) {
        entity.recipient = newOwner;
        entity.save();


        let userVestInfo = FlexUserVestInfo.load(entity.proposalId.toHexString() + "-" + entity.originalRecipient.toHexString());
        if (userVestInfo) {
            userVestInfo.recipient = newOwner;
            userVestInfo.save();
        }
    }
}
