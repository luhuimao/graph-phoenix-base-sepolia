/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-12-14 11:38:25
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-09 11:20:49
 */

import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
    Vesting,
    CreateVesting,
    CreateNFTVesting,
    Withdraw
} from "../generated/Vesting/Vesting";
import { VestingERC721, Transfer } from "../generated/Vesting/VestingERC721";
import { VestEntity } from "../generated/schema"

// event CreateVesting(
//     uint256 indexed vestId,
//     address token,
//     address indexed recipient,
//     uint32 start,
//     uint32 cliffDuration,
//     uint32 stepDuration,
//     uint32 steps,
//     uint128 cliffShares,
//     uint128 stepShares
// );
export function handleCreateVesting(event: CreateVesting): void {
    let entity = VestEntity.load(event.params.vestId.toString())
    const vestintContr = Vesting.bind(event.address);
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VestEntity(event.params.vestId.toString())

        // Entity fields can be set using simple assignments
        // entity.count = BigInt.fromI32(0)
    }
    let vestingContract = Vesting.bind(event.address);

    const vestInfo = vestintContr.vests(event.params.vestId);
    entity.name = vestInfo.getVestInfo().name;
    entity.description = vestInfo.getVestInfo().description;
    entity.txHash = event.transaction.hash;
    entity.NFTEnalbe = false;
    entity.creator = event.transaction.from;
    entity.vestId = event.params.vestId;
    entity.recipient = event.params.recipient;
    entity.tokenAddress = event.params.token;
    entity.erc721Address = Bytes.empty();
    entity.tokenId = BigInt.fromI32(0);
    entity.startTime = event.params.start;
    entity.startTimeString = new Date(event.params.start.toI64() * 1000).toISOString();
    entity.cliffEndTime = entity.startTime.plus(event.params.cliffDuration);
    entity.cliffEndTimeString = new Date(entity.cliffEndTime.toI64() * 1000).toISOString();
    // entity.endTime = entity.cliffEndTime.plus(event.params.stepDuration.times(event.params.steps));
    entity.endTime = vestingContract.vests(event.params.vestId).getVestTimeInfo().end
    entity.endTimeString = new Date(entity.endTime.toI64() * 1000).toISOString();
    entity.interval = event.params.stepDuration;
    entity.cliffAmount = event.params.cliffShares;
    entity.cliffAmountFromWei = entity.cliffAmount.div(BigInt.fromI64(10 ** 18)).toString();
    // entity.totalAmount = event.params.stepShares.times(event.params.steps).plus(event.params.cliffShares);
    entity.totalAmount = vestInfo.getTotal();
    entity.totalAmountFromWei = entity.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.claimedAmount = BigInt.fromI32(0);
    entity.claimedAmountFromWei = "0";

    // entity.vestEndTimeString = new Date(
    //     (
    //         event.params.start.toI64() +
    //         event.params.cliffDuration.toI64() +
    //         event.params.stepDuration.toI64() *
    //         event.params.steps.toI64()
    //     ) *
    //     1000
    // ).toISOString();
    // Entities can be written to the store with `.save()`
    entity.save()
}

export function handleCreateNFTVesting(event: CreateNFTVesting): void {
    let entity = VestEntity.load(event.params.vestId.toString())
    const vestintContr = Vesting.bind(event.address);
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VestEntity(event.params.vestId.toString())
    }
    let vestingContract = Vesting.bind(event.address);

    // Entity fields can be set based on event parameters
    const vestInfo = vestintContr.nftVests(event.params.vestId);
    entity.name = vestInfo.getVestInfo().name;
    entity.description = vestInfo.getVestInfo().description;
    entity.txHash = event.transaction.hash;
    entity.NFTEnalbe = true;
    entity.creator = event.transaction.from;
    entity.vestId = event.params.vestId;
    entity.tokenAddress = event.params.token;
    entity.erc721Address = event.params.nftToken;

    const nftContract = VestingERC721.bind(event.params.nftToken);
    const ownerOfTokenId = nftContract.ownerOf(event.params.tokenId);
    entity.recipient = ownerOfTokenId;

    entity.tokenId = event.params.tokenId;
    entity.startTime = event.params.startTime;
    entity.startTimeString = new Date(event.params.startTime.toI64() * 1000).toISOString();
    entity.cliffEndTime = event.params.cliffEndTime;
    entity.cliffEndTimeString = new Date(event.params.cliffEndTime.toI64() * 1000).toISOString();
    entity.endTime = event.params.endTime;
    entity.endTimeString = new Date(event.params.endTime.toI64() * 1000).toISOString();
    entity.interval = vestingContract.nftVests(event.params.vestId).getVestTimeInfo().stepDuration;
    entity.cliffAmount = event.params.cliffAmount;
    entity.cliffAmountFromWei = entity.cliffAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.totalAmount = event.params.depositAmount;
    entity.totalAmountFromWei = entity.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.claimedAmount = BigInt.fromI32(0);
    entity.claimedAmountFromWei = "0";
    // Entities can be written to the store with `.save()`
    entity.save()
}

export function handleWithdraw(event: Withdraw): void {
    let entity = VestEntity.load(event.params.vestId.toString())
    if (entity) {
        entity.claimedAmount = entity.claimedAmount.plus(event.params.amount);
        entity.claimedAmountFromWei = entity.claimedAmount.div(BigInt.fromI64(10 ** 18)).toString();
        entity.save();
    }
}

export function handleERC721Transfer(event: Transfer): void {
    const nftContract = VestingERC721.bind(event.address);
    const tokenId = event.params.id;
    const newOwner = event.params.to;

    const vestintContr = Vesting.bind(nftContract.vestAddress());
    const vestId = vestintContr.getVestIdByTokenId(event.address, tokenId);

    let entity = VestEntity.load(vestId.toString())
    if (entity) {
        entity.recipient = newOwner;
        entity.save();
    }

}
