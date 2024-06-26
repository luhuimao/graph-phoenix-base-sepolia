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
} from "../generated/VintageFreeInEscrowFundAdapterContract/VintageFreeInEscrowFundAdapterContract";
import { DaoRegistry } from "../generated/VintageFreeInEscrowFundAdapterContract/DaoRegistry";
import { VintageFundingPoolExtension } from "../generated/VintageFreeInEscrowFundAdapterContract/VintageFundingPoolExtension";
import {
    VintageFreeInEscrowFundEntity,
    VintageFundRoundToFundEstablishmentProposalId,
    VintageFundEstablishmentProposal
} from "../generated/schema"


export function handleWithDraw(event: WithDrawEvent): void {
    let entity = VintageFreeInEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
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
   
    const fundingPoolExtAddress = daoContract.getExtensionAddress(Bytes.fromHexString("0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f"))
    const fundingPoolExtContr = VintageFundingPoolExtension.bind(fundingPoolExtAddress)
    let entity = VintageFreeInEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());

    if (!entity) {
        entity = new VintageFreeInEscrowFundEntity(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
    }
    let newFundEntity: VintageFundEstablishmentProposal | null;
    let minfundgoal = BigInt.fromI32(0);
    let finalraised = BigInt.fromI32(0);
    let newFundProposalId = Bytes.empty();
    const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.dao.toHexString() + event.params.fundRound.toString());
    if (roundProposalIdEntity) {
        newFundProposalId = roundProposalIdEntity.proposalId;
        newFundEntity = VintageFundEstablishmentProposal.load(newFundProposalId.toHexString());
        if (newFundEntity) {
            minfundgoal = newFundEntity.fundRaiseTarget;
            finalraised = newFundEntity.totalFund;
        }
    }

    entity.daoAddr = event.params.dao;
    entity.fundEstablishmentProposalId = newFundProposalId;
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
    entity.fundRound = event.params.fundRound;
   
    entity.save();
}