/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-14 11:38:25
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-09 11:20:49
 */

import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ManualVesting, CreateVesting, Withdraw, BatchVesting } from "../generated/ManualVesting/ManualVesting";
import { ManualVestingERC721, Transfer } from "../generated/ManualVestingERC721/ManualVestingERC721";

import { ManualVestEntity, ManualVestingClaimedActivityEntity } from "../generated/schema"

export function handleCreateVesting(event: CreateVesting): void {
    let entity = ManualVestEntity.load(event.params.vestId.toString())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new ManualVestEntity(event.params.vestId.toString())

        // Entity fields can be set using simple assignments
        // entity.count = BigInt.fromI32(0)
    }
    let vestingContract = ManualVesting.bind(event.address);

    const vestInfo = vestingContract.vests(event.params.vestId);
    entity.name = vestInfo.getVestInfo().name;
    entity.description = vestInfo.getVestInfo().description;
    entity.txHash = event.transaction.hash;
    entity.NFTEnalbe = vestInfo.getNftInfo().nftToken == Bytes.empty() ? false : true;
    entity.creator = event.transaction.from;
    entity.vestId = event.params.vestId;
    entity.recipient = event.params.recipient;
    entity.tokenAddress = event.params.token;
    entity.erc721Address = vestInfo.getNftInfo().nftToken;
    entity.tokenId = vestInfo.getNftInfo().tokenId;
    entity.startTime = event.params.start;
    entity.startTimeString = new Date(event.params.start.toI64() * 1000).toISOString();
    entity.cliffEndTime = entity.startTime.plus(event.params.cliffDuration);
    entity.cliffEndTimeString = new Date(entity.cliffEndTime.toI64() * 1000).toISOString();
    entity.endTime = vestInfo.getTimeInfo().end
    entity.endTimeString = new Date(entity.endTime.toI64() * 1000).toISOString();
    entity.interval = event.params.stepDuration;
    entity.cliffAmount = event.params.cliffShares;
    entity.cliffAmountFromWei = entity.cliffAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.totalAmount = vestInfo.getTotal();
    entity.totalAmountFromWei = entity.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.claimedAmount = BigInt.fromI32(0);
    entity.claimedAmountFromWei = "0";
    entity.blockNumber = event.block.number;
    entity.save()
}

export function handleWithdraw(event: Withdraw): void {
    let entity = ManualVestEntity.load(event.params.vestId.toString())
    if (entity) {
        entity.claimedAmount = entity.claimedAmount.plus(event.params.amount);
        entity.claimedAmountFromWei = entity.claimedAmount.div(BigInt.fromI64(10 ** 18)).toString();
        entity.save();
    }

    let claimedEntity = ManualVestingClaimedActivityEntity.load(event.transaction.hash.toHexString());
    if (!claimedEntity) {
        claimedEntity = new ManualVestingClaimedActivityEntity(event.transaction.hash.toHexString());
        claimedEntity.account = event.transaction.from;
        claimedEntity.claimedAmount = event.params.amount;
        claimedEntity.vestId = event.params.vestId;
        claimedEntity.txHash = event.transaction.hash;
        claimedEntity.timeStamp = event.block.timestamp;
    }
    claimedEntity.save();
}

export function handleNFTTransfer(event: Transfer): void {
    const manualVestingContrAddr = ManualVestingERC721.bind(event.address).vestContrAddress();
    let vestingContract = ManualVesting.bind(manualVestingContrAddr);
    const vestId = vestingContract.try_tokenIdToVestId(event.address, event.params.id);
    if (!vestId.reverted) {
        let entity = ManualVestEntity.load(vestId.value.toString())
        if (entity) {
            entity.recipient = event.params.to;
            entity.save();
        }
    }
}

// export function handleBatchVesting(event: BatchVesting): void {

//     const vestingContract = ManualVesting.bind(event.address);
//     if (event.params.endVestId.ge(event.params.startVestId)) {
//         for (var i = event.params.startVestId.toI32(); i <= event.params.endVestId.toI32(); i++) {
//             const vestInfo = vestingContract.vests(BigInt.fromI32(i));
//             if (vestInfo) {
//                 let entity = new ManualVestEntity(i.toString())

//                 entity.name = vestInfo.getVestInfo().name;
//                 entity.description = vestInfo.getVestInfo().description;
//                 entity.txHash = event.transaction.hash;
//                 entity.NFTEnalbe = vestInfo.getNftInfo().nftToken == Bytes.empty() ? false : true;
//                 entity.creator = event.transaction.from;
//                 entity.vestId = BigInt.fromI32(i);
//                 entity.recipient = vestInfo.getVestInfo().recipient;
//                 entity.tokenAddress = vestInfo.getVestInfo().token;
//                 entity.erc721Address = vestInfo.getNftInfo().nftToken;
//                 entity.tokenId = vestInfo.getNftInfo().tokenId;
//                 entity.startTime = vestInfo.getTimeInfo().start;
//                 entity.startTimeString = new Date(entity.startTime.toI64() * 1000).toISOString();
//                 entity.cliffEndTime = entity.startTime.plus(vestInfo.getTimeInfo().cliffDuration);
//                 entity.cliffEndTimeString = new Date(entity.cliffEndTime.toI64() * 1000).toISOString();
//                 entity.endTime = vestInfo.getTimeInfo().end
//                 entity.endTimeString = new Date(entity.endTime.toI64() * 1000).toISOString();
//                 entity.interval = vestInfo.getTimeInfo().stepDuration;
//                 entity.cliffAmount = vestInfo.getStepInfo().cliffShares;
//                 entity.cliffAmountFromWei = entity.cliffAmount.div(BigInt.fromI64(10 ** 18)).toString();
//                 entity.totalAmount = vestInfo.getTotal();
//                 entity.totalAmountFromWei = entity.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
//                 entity.claimedAmount = BigInt.fromI32(0);
//                 entity.claimedAmountFromWei = "0";
//                 entity.blockNumber = event.block.number;

//                 entity.save()
//             }
//         }

//     }
// }

// export function handleERC721Transfer(event: Transfer): void {
//     const nftContract = VestingERC721.bind(event.address);
//     const tokenId = event.params.id;
//     const newOwner = event.params.to;

//     const vestintContr = Vesting.bind(nftContract.vestAddress());
//     const vestId = vestintContr.getVestIdByTokenId(event.address, tokenId);

//     let entity = VestEntity.load(vestId.toString())
//     if (entity) {
//         entity.recipient = newOwner;
//         entity.save();
//     }

// }
