/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-05 19:50:32
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-02-08 15:26:44
 */
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"

import { CollectiveDaoCreated } from "../generated/SummonCollectiveDao/SummonCollectiveDao"

import {
    DaoEntiy,
    CollectiveDaoEntity,
    CollectiveDaoEntityCounter
} from "../generated/schema"

export function handleCollectiveDaoCreated(event: CollectiveDaoCreated): void {
    let entity = DaoEntiy.load(event.params.daoAddr.toHexString());
    let collectiveDaoEntity = CollectiveDaoEntity.load(event.params.daoAddr.toHexString());
    let counterEntity = CollectiveDaoEntityCounter.load(event.address.toHexString());

    if (!counterEntity) {
        counterEntity = new CollectiveDaoEntityCounter(event.address.toHexString());
        counterEntity.count = BigInt.fromI32(0);
    }

    if (entity) {
        entity.daoType = "collective";
        entity.save()
    }

    if (!collectiveDaoEntity) {
        collectiveDaoEntity = new CollectiveDaoEntity(event.params.daoAddr.toHexString());
        // entity.daoType = "flex";
        // entity.save()

        collectiveDaoEntity.daoAddr = event.params.daoAddr;
        collectiveDaoEntity.daoName = event.params.name;
        collectiveDaoEntity.creator = event.params.creator;
        collectiveDaoEntity.createTimeStamp = event.block.timestamp;
        collectiveDaoEntity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
        collectiveDaoEntity.save();

        counterEntity.count = counterEntity.count.plus(BigInt.fromI32(1));
        counterEntity.save();
    }

}