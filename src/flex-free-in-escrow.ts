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
import {
    EscrowFund as EscorwFundEvent,
    WithDraw as WithDrawEvent,
    FlexFreeInEscrowFundAdapterContract
} from "../generated/FlexFreeInEscrowFundAdapterContract/FlexFreeInEscrowFundAdapterContract";

import { DaoRegistry } from "../generated/FlexFreeInEscrowFundAdapterContract/DaoRegistry";
import { FlexInvestmentPoolExtension } from "../generated/FlexFreeInEscrowFundAdapterContract/FlexInvestmentPoolExtension";
import {
    FlexFreeInEscrowFundEntity,
    FlexFundingProposal
} from "../generated/schema"


export function handleWithdraw(event: WithDrawEvent): void {
    let entity = FlexFreeInEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.proposalId.toHexString());
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
    // const freeInEscrowCont = FlexFreeInEscrowFundAdapterContract.bind(event.address);
    const fundingPoolExtAddress = daoContract.getExtensionAddress(Bytes.fromHexString("0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c"))
    const fundingPoolExtContr = FlexInvestmentPoolExtension.bind(fundingPoolExtAddress)
    let entity = FlexFreeInEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.proposalId.toHexString());

    if (!entity) {
        entity = new FlexFreeInEscrowFundEntity(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.proposalId.toHexString());
    }
    // let fundingEnity: FlexFundingProposal | null;
    // let minfundgoal = BigInt.fromI32(0);
    // let finalraised = BigInt.fromI32(0);
    // fundingEnity = FlexFundingProposal.load(event.params.proposalId.toHexString());
    // if (fundingEnity) {
    //     minfundgoal = fundingEnity.minFundingAmount;
    //     finalraised = fundingEnity.totalFund;
    // }

    entity.daoAddr = event.params.dao;
    entity.fundingProposalId = event.params.proposalId;
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
    entity.myAdvanceDepositAmount = BigInt.fromI32(0);
    let rel = fundingPoolExtContr.try_getPriorAmount(
        event.params.proposalId,
        event.params.account,
        event.block.number.minus(BigInt.fromI32(1))
    );
    if (!rel.reverted) {
        entity.myAdvanceDepositAmount = rel.value;
        if (rel.value.gt(BigInt.fromI32(0)))
            entity.myConfirmedDepositAmount = rel.value.minus(event.params.amount);

    }
    // entity.myConfirmedDepositAmount = fundingPoolExtContr.balanceOf(event.params.proposalId, event.params.account)

    entity.save();
}