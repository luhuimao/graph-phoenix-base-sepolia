/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-05 19:50:32
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-03-01 09:28:08
 */
import { BigInt } from "@graphprotocol/graph-ts"
import {
    DaoFactory,
    DAOCreated,
    OwnerChanged
} from "../generated/DaoFactory/DaoFactory"
import { DaoEntiy, DaoEntityCounter } from "../generated/schema"

export function handleDaoCreated(event: DAOCreated): void {
    let entity = DaoEntiy.load(event.params._address.toHexString());
    let counterEntity = DaoEntityCounter.load(event.address.toHexString());

    if (!counterEntity) {
        counterEntity = new DaoEntityCounter(event.address.toHexString());
        counterEntity.count = BigInt.fromI32(0);
    }

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new DaoEntiy(event.params._address.toHexString())
        entity.daoAddr = event.params._address;
        entity.daoName = event.params._name;
        entity.creator = event.params._creator;
        entity.daoType = "";
        entity.createTimeStamp = event.block.timestamp;
        // entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
        entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).
            toString();

        counterEntity.count = counterEntity.count.plus(BigInt.fromI32(1));
    }
    else {
        entity.daoName = event.params._name;
    }
    entity.save();
    counterEntity.save();
}

export function handleOwnerChanged(event: OwnerChanged): void {

}
