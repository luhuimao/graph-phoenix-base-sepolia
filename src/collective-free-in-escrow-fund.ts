/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-06 11:00:10
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-23 10:13:58
 */
// import { BigInt } from "@graphprotocol/graph-ts"
// import { EnsResolver } from "ethers"
// import { EventLog } from "ethers/types/contract"
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
// import {
//     EscrowFund as EscorwFundEvent,
//     WithDraw as WithDrawEvent
// } from "../generated/vintageEscrowFundAdapterContract/vintageEscrowFundAdapterContract";

import {
    EscrowFund as EscorwFundEvent,
    WithDraw as WithDrawEvent
} from "../generated/CollectiveFreeInEscrowFundAdapterContract/CollectiveFreeInEscrowFundAdapterContract";
import { DaoRegistry } from "../generated/CollectiveFreeInEscrowFundAdapterContract/DaoRegistry";
import { CollectiveInvestmentPoolExtension } from "../generated/CollectiveFreeInEscrowFundAdapterContract/CollectiveInvestmentPoolExtension";
import {
    CollectiveFreeInEscrowFundEntity,
    CollectiveFundRaiseProposalEntity
} from "../generated/schema"


export function handleWithDraw(event: WithDrawEvent): void {
    let entity = CollectiveFreeInEscrowFundEntity.load(
        event.params.dao.toHexString() +
        event.params.account.toHexString() +
        event.params.fundRaiseProposalId.toHexString());

    if (entity) {
        entity.amount = BigInt.fromI32(0);
        entity.amountFromWei = "0";
        entity.withdrawTimeStamp = event.block.timestamp;
        entity.withdrawDateTime = new Date(entity.withdrawTimeStamp.toI64() * 1000).toISOString();
        entity.withdrawTxHash = event.transaction.hash;
        entity.myWithdraw = event.params.amount;

        entity.save();
    }
}

export function handleEscrowFund(event: EscorwFundEvent): void {
    const daoContract = DaoRegistry.bind(event.params.dao);

    const fundingPoolExtAddress = daoContract.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"))
    const fundingPoolExtContr = CollectiveInvestmentPoolExtension.bind(fundingPoolExtAddress)
    let entity = CollectiveFreeInEscrowFundEntity.load(
        event.params.dao.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaiseProposalId.toHexString());

    if (!entity) {
        entity = new CollectiveFreeInEscrowFundEntity(
            event.params.dao.toHexString()
            + event.params.account.toHexString()
            + event.params.fundRaiseProposalId.toHexString());
    }

    let newFundEntity: CollectiveFundRaiseProposalEntity | null;
    let minfundgoal = BigInt.fromI32(0);
    let finalraised = BigInt.fromI32(0);

    newFundEntity = CollectiveFundRaiseProposalEntity.load(event.params.fundRaiseProposalId.toHexString());
    if (newFundEntity) {
        minfundgoal = newFundEntity.fundRaiseTarget;
        finalraised = newFundEntity.totalFund;
    }


    entity.daoAddr = event.params.dao;
    entity.fundEstablishmentProposalId = event.params.fundRaiseProposalId;
    entity.account = event.params.account;

    entity.token = event.params.token;
    entity.createTimeStamp = event.block.timestamp;
    entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
    entity.withdrawTimeStamp = BigInt.fromI32(0);
    entity.withdrawDateTime = "0";
    entity.amount = event.params.amount;
    entity.amountFromWei = entity.amount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.withdrawTxHash = Bytes.empty();
    entity.escrowBlockNum = event.block.number;

    let rel = fundingPoolExtContr.try_getPriorAmount(event.params.account, event.params.token, event.block.number.minus(BigInt.fromI32(1)));
    if (!rel.reverted) entity.myAdvanceDepositAmount = rel.value;

    entity.myConfirmedDepositAmount = fundingPoolExtContr.balanceOf(event.params.account)

    entity.save();
}