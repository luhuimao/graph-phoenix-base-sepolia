/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-14 11:38:25
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-09 11:20:49
 */

import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import { ManualVesting, CreateVesting, CreateVesting2, Withdraw, BatchVesting1, BatchVesting2 } from "../generated/ManualVesting/ManualVesting";
import { ManualVestingERC721, Transfer } from "../generated/ManualVestingERC721/ManualVestingERC721";
import { ERC20 } from "../generated/ManualVesting/ERC20";
import {
    ManualVestEntity,
    ManualVestingClaimedActivityEntity,
    BatchManualVestingEntity,
    ManualVestInfoEntity
} from "../generated/schema"

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

export function handleCreateVesting2(event: CreateVesting2): void {
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
    entity.batchVestId = event.params.batchId.toHexString() + "-" + event.transaction.from.toHexString();
    entity.save();

    const batchVestInfo = BatchManualVestingEntity.load(event.params.batchId.toString());

    if (batchVestInfo) {
        let tem3: BigInt[] = [];

        if (batchVestInfo.vestIds && batchVestInfo.vestIds.length > 0) {
            for (var i = 0; i < batchVestInfo.vestIds.length; i++) {
                tem3.push(batchVestInfo.vestIds[i]);
            }
        }

        tem3.push(event.params.vestId);
        batchVestInfo.vestIds = tem3;
        batchVestInfo.save();
    }

    let mvi = ManualVestInfoEntity.load(event.params.batchId.toHexString() + "-" + event.transaction.from.toHexString());
    if (mvi) {
        mvi.created = true;

        mvi.save();
    }

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

export function handleBatchVesting1(event: BatchVesting1): void {
    const vestingContract = ManualVesting.bind(event.address);
    event.params.batchId
    event.params.holders
    event.params.investors
    event.params.totalAmount
    const batchVestInfo = vestingContract.batchVestInfo(event.params.batchId);
    const cliffAmount = vestingContract.batchVestInfo(event.params.batchId).getStepInfo().cliffShares

    if (batchVestInfo) {
        const entity = new BatchManualVestingEntity(event.params.batchId.toHexString());
        entity.name = batchVestInfo.getVestInfo().name;
        entity.description = batchVestInfo.getVestInfo().description;
        entity.NFTEnable = batchVestInfo.getNftInfo().nftToken == Bytes.empty() ? false : true;
        entity.creator = event.transaction.from;
        entity.tokenAddr = batchVestInfo.getVestInfo().token;
        const symbol = ERC20.bind(Address.fromBytes(entity.tokenAddr)).symbol();
        entity.tokenSymbol = symbol;
        entity.erc721Address = batchVestInfo.getNftInfo().nftToken;
        entity.startTime = batchVestInfo.getTimeInfo().start;
        entity.startTimeString = new Date(entity.startTime.toI64() * 1000).toISOString();
        entity.cliffEndTime = entity.startTime.plus(batchVestInfo.getTimeInfo().cliffDuration);
        entity.cliffEndTimeString = new Date(entity.cliffEndTime.toI64() * 1000).toISOString();
        entity.endTime = batchVestInfo.getTimeInfo().end
        entity.endTimeString = new Date(entity.endTime.toI64() * 1000).toISOString();
        entity.interval = batchVestInfo.getTimeInfo().stepDuration;
        entity.cliffAmount = batchVestInfo.getStepInfo().cliffShares;
        entity.cliffAmountFromWei = entity.cliffAmount.div(BigInt.fromI64(10 ** 18)).toString();
        entity.totalAmount = event.params.totalAmount;
        entity.totalAmountFromWei = entity.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
        entity.blockNumber = event.block.number;
        entity.createdTime = event.block.timestamp;
        entity.createDateTime = new Date(entity.createdTime.toI64() * 1000).toISOString();
        entity.txHash = event.transaction.hash;

        let tem: string[] = [];
        let tem2: BigInt[] = [];

        for (var j = 0; j < event.params.holders.length; j++) {
            if (!contains(tem, event.params.holders[j].toHexString()))
                tem.push(event.params.holders[j].toHexString());

            const amount = vestingContract.eligibleVestUsers(event.params.batchId, event.params.holders[j]).getAmount();
            tem2.push(amount);

            let mvi = ManualVestInfoEntity.load(event.params.batchId.toHexString() + "-" + event.params.holders[j].toHexString());
            if (!mvi) {
                let mvi = new ManualVestInfoEntity(event.params.batchId.toHexString() + "-" + event.params.holders[j].toHexString());
                mvi.account = event.params.holders[j];
                mvi.amount = amount;
                mvi.batchId = event.params.batchId;
                mvi.created = false;
                mvi.token = batchVestInfo.getVestInfo().token;
                mvi.txHash = event.transaction.hash;
                mvi.save();
            }
        }

        for (var i = 0; i < event.params.investors.length; i++) {
            if (!contains(tem, event.params.investors[i].toHexString()))
                tem.push(event.params.holders[i].toHexString());

            const amount = vestingContract.eligibleVestUsers(event.params.batchId, event.params.investors[j]).getAmount();
            tem2.push(amount);

            let mvi = ManualVestInfoEntity.load(event.params.batchId.toHexString() + "-" + event.params.investors[j].toHexString());
            if (!mvi) {
                let mvi = new ManualVestInfoEntity(event.params.batchId.toHexString() + "-" + event.params.investors[j].toHexString());
                mvi.account = event.params.investors[j];
                mvi.amount = amount;
                mvi.batchId = event.params.batchId;
                mvi.created = false;
                mvi.token = batchVestInfo.getVestInfo().token;
                mvi.txHash = event.transaction.hash;
                mvi.save();
            }
        }
        let tem3: BigInt[] = [];

        entity.amounts = tem2;
        entity.vestIds = tem3;
        entity.receivers = tem;
        entity.save()
    }

}

export function handleBatchVesting2(event: BatchVesting2): void {
    const vestingContract = ManualVesting.bind(event.address);
    const batchVestInfo = vestingContract.batchVestInfo(event.params.batchId);

    if (batchVestInfo) {
        const entity = new BatchManualVestingEntity(event.params.batchId.toHexString());

        entity.name = batchVestInfo.getVestInfo().name;
        entity.description = batchVestInfo.getVestInfo().description;
        entity.NFTEnable = batchVestInfo.getNftInfo().nftToken == Bytes.empty() ? false : true;
        entity.creator = event.transaction.from;
        entity.tokenAddr = batchVestInfo.getVestInfo().token;
        const symbol = ERC20.bind(Address.fromBytes(entity.tokenAddr)).symbol();
        entity.tokenSymbol = symbol;
        entity.erc721Address = batchVestInfo.getNftInfo().nftToken;
        entity.startTime = batchVestInfo.getTimeInfo().start;
        entity.startTimeString = new Date(entity.startTime.toI64() * 1000).toISOString();
        entity.cliffEndTime = entity.startTime.plus(batchVestInfo.getTimeInfo().cliffDuration);
        entity.cliffEndTimeString = new Date(entity.cliffEndTime.toI64() * 1000).toISOString();
        entity.endTime = batchVestInfo.getTimeInfo().end
        entity.endTimeString = new Date(entity.endTime.toI64() * 1000).toISOString();
        entity.interval = batchVestInfo.getTimeInfo().stepDuration;
        entity.cliffAmount = batchVestInfo.getStepInfo().cliffShares;
        entity.cliffAmountFromWei = entity.cliffAmount.div(BigInt.fromI64(10 ** 18)).toString();
        entity.totalAmount = event.params.totalAmount;
        entity.totalAmountFromWei = entity.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
        entity.blockNumber = event.block.number;
        entity.createdTime = event.block.timestamp;
        entity.createDateTime = new Date(entity.createdTime.toI64() * 1000).toISOString();
        entity.txHash = event.transaction.hash;

        let tem: string[] = [];
        let tem2: BigInt[] = [];

        for (var j = 0; j < event.params.receivers.length; j++) {
            if (!contains(tem, event.params.receivers[j].toHexString()))
                tem.push(event.params.receivers[j].toHexString());

            const amount = vestingContract.eligibleVestUsers(event.params.batchId, event.params.receivers[j]).getAmount();
            tem2.push(amount);

            let mvi = ManualVestInfoEntity.load(event.params.batchId.toHexString() + "-" + event.params.receivers[j].toHexString());
            if (!mvi) {
                let mvi = new ManualVestInfoEntity(event.params.batchId.toHexString() + "-" + event.params.receivers[j].toHexString());
                mvi.account = event.params.receivers[j];
                mvi.amount = amount;
                mvi.batchId = event.params.batchId;
                mvi.created = false;
                mvi.token = batchVestInfo.getVestInfo().token;
                mvi.txHash = event.transaction.hash;
                mvi.save();
            }
        }

        let tem3: BigInt[] = [];
        entity.amounts = tem2;
        entity.vestIds = tem3;
        entity.receivers = tem;
        entity.save()

    }
}

function contains(investors: string[], account: string): boolean {
    const index = investors.indexOf(account);
    if (index !== -1) return true;
    return false;
}

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
