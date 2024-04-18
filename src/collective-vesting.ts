/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-14 11:38:25
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-09 15:38:08
 */

import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
    CollectiveVestingAdapterContract,
    CancelVesting,
    CreateVesting,
    LogUpdateOwner,
    Withdraw
} from "../generated/CollectiveVestingAdapterContract/CollectiveVestingAdapterContract";
import { VintageVestingERC721, Transfer } from "../generated/VintageVestingERC721/VintageVestingERC721";
import {
    CollectiveVestEntity,
    CollectiveUserVestInfo,
    CollectiveVestingClaimedActivityEntity,
    CollectiveInvestmentProposalEntity
} from "../generated/schema"

export function handleCreateVesting(event: CreateVesting): void {
    let entity = CollectiveVestEntity.load(event.params.vestId.toString())
    const vintageVestingContr = CollectiveVestingAdapterContract.bind(event.address);
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new CollectiveVestEntity(event.params.vestId.toString())
    }
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
    entity.totalAmount = vintageVestingContr.vests(event.params.vestId).getTotal();
    entity.claimedAmount = BigInt.fromI32(0);
    entity.startTimeString = new Date(event.params.start.toI64() * 1000).toISOString();
    entity.cliffEndTimeString = new Date((event.params.start.toI64() +
        event.params.cliffDuration.toI64()) * 1000).toISOString();
    entity.vestEndTimeString = new Date(
        vintageVestingContr.vests(event.params.vestId).getTimeInfo().end.toI64() *
        1000
    ).toISOString();
    entity.nftToken = vintageVestingContr.vests(event.params.vestId).getNftInfo().nftToken;
    entity.tokenId = vintageVestingContr.vests(event.params.vestId).getNftInfo().tokenId;

    // Entities can be written to the store with `.save()`
    entity.save()

    let vintageFundingProposalEntity = CollectiveInvestmentProposalEntity.load(event.params.proposalId.toHexString())

    let userVestInfo = CollectiveUserVestInfo.load(entity.proposalId.toHexString() + "-" + entity.recipient.toHexString());
    if (!userVestInfo) {
        userVestInfo = new CollectiveUserVestInfo(entity.proposalId.toHexString() + "-" + entity.recipient.toHexString());
        userVestInfo.daoAddr = vintageFundingProposalEntity ? vintageFundingProposalEntity.daoAddr : Bytes.fromHexString("0x");
        userVestInfo.investmentProposalId = event.params.proposalId;
        userVestInfo.recipient = event.params.recipient;
        userVestInfo.vestingStartTime = event.params.start;
        userVestInfo.vestingCliffEndTime = vintageFundingProposalEntity ? vintageFundingProposalEntity.cliffEndTime : BigInt.fromI32(0);
        userVestInfo.vestingInterval = vintageFundingProposalEntity ? vintageFundingProposalEntity.vestingInterval : BigInt.fromI32(0);
        userVestInfo.vestingEndTime = vintageFundingProposalEntity ? vintageFundingProposalEntity.vestingEndTime : BigInt.fromI32(0);
        userVestInfo.totalAmount = vintageFundingProposalEntity ? vintageFundingProposalEntity.paybackAmount : BigInt.fromI32(0);
        userVestInfo.totalAmountFromWei = userVestInfo.totalAmount.div(BigInt.fromI32(10 ** 18)).toString();
    }

    userVestInfo.created = true;
    userVestInfo.save();
}


export function handleWithdraw(event: Withdraw): void {
    let entity = CollectiveVestEntity.load(event.params.vestId.toString())
    if (entity) {
        entity.claimedAmount = entity.claimedAmount.plus(event.params.amount);
        entity.save();
    }

    let claimedEntity = CollectiveVestingClaimedActivityEntity.load(event.transaction.hash.toHexString());
    if (!claimedEntity) {
        claimedEntity = new CollectiveVestingClaimedActivityEntity(event.transaction.hash.toHexString());
        claimedEntity.account = event.transaction.from;
        claimedEntity.claimedAmount = event.params.amount;
        claimedEntity.vestId = event.params.vestId;
        claimedEntity.txHash = event.transaction.hash;
        claimedEntity.timeStamp = event.block.timestamp;
    }
    claimedEntity.save();
}


// export function handleERC721Transfer(event: Transfer): void {
//     const nftContract = VintageVestingERC721.bind(event.address);
//     const tokenId = event.params.id;
//     const newOwner = event.params.to;

//     const vestintContr = CollectiveVestingAdapterContract.bind(nftContract.vestAddress());
//     const vestId = vestintContr.getVestIdByTokenId(event.address, tokenId);

//     let entity = CollectiveVestEntity.load(vestId.toString())
//     if (entity) {
//         entity.recipient = newOwner;
//         entity.save();


//         let userVestInfo = CollectiveUserVestInfo.load(entity.proposalId.toHexString() + "-" + entity.originalRecipient.toHexString());
//         if (userVestInfo) {
//             userVestInfo.recipient = newOwner;
//             userVestInfo.save();
//         }
//     }
// }