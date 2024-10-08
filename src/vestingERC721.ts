/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-08-09 11:04:42
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-09 11:04:42
 */

import { VestingERC721, Transfer } from "../generated/VestingERC721/VestingERC721";
import { CollectiveVestingAdapterContract } from "../generated/VestingERC721/CollectiveVestingAdapterContract";
import { FlexVesting } from "../generated/VestingERC721/FlexVesting";
import { VintageVesting } from "../generated/VestingERC721/VintageVesting";

import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
    VintageVestEntity,
    FlexVestEntity,
    CollectiveVestEntity
} from "../generated/schema"

export function handleERC721Transfer(event: Transfer): void {
    const nftContract = VestingERC721.bind(event.address);
    const vinVestingContr = VintageVesting.bind(nftContract.vintageVestContrAddress());
    const flexVestingContr = FlexVesting.bind(nftContract.flexVestContrAddress());
    const collectiveVestingContr = CollectiveVestingAdapterContract.bind(nftContract.collectiveVestContrAddress());
    const tokenId = event.params.id;
    const newOwner = event.params.to;

    let vinVestId = BigInt.zero();
    let flexVestId = BigInt.zero();
    let colVestId = BigInt.zero();

    let rel = vinVestingContr.try_getVestIdByTokenId(event.address, tokenId);
    if (!rel.reverted && rel.value > BigInt.fromI32(0)) {
        vinVestId = rel.value;
    }
    rel = flexVestingContr.try_getVestIdByTokenId(event.address, tokenId);
    if (!rel.reverted && rel.value > BigInt.fromI32(0)) {
        flexVestId = rel.value;
    }

    rel = collectiveVestingContr.try_getVestIdByTokenId(event.address, tokenId);
    if (!rel.reverted && rel.value > BigInt.fromI32(0)) {
        colVestId = rel.value;
    }

    if (vinVestId > BigInt.fromI32(0)) {
        const vinVestEntity = VintageVestEntity.load(vinVestId.toString());
        if (vinVestEntity) {
            vinVestEntity.recipient = newOwner;

            vinVestEntity.save();
        }
    }

    if (flexVestId > BigInt.fromI32(0)) {
        const flexVestEntity = FlexVestEntity.load(flexVestId.toString());
        if (flexVestEntity) {
            flexVestEntity.recipient = newOwner;

            flexVestEntity.save();
        }
    }

    if (colVestId > BigInt.fromI32(0)) {
        const colVestEntity = CollectiveVestEntity.load(colVestId.toString());
        if (colVestEntity) {
            colVestEntity.recipient = newOwner;

            colVestEntity.save();
        }
    }

}