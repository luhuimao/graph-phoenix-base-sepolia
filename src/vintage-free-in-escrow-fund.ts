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
    WithDraw as WithDrawEvent
} from "../generated/vintageEscrowFundAdapterContract/vintageEscrowFundAdapterContract"
import {
    VintageFreeInEscrowFundEntity,
    VintageFundRoundToNewFundProposalId,
    VintageNewFundProposal,
    VintageFundRoundStatistic
} from "../generated/schema"


export function handleWithDraw(event: WithDrawEvent): void {
    let entity = VintageFreeInEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
    if (entity) {
        entity.amount = BigInt.fromI32(0);
        entity.amountFromWei = "0";
        entity.withdrawTimeStamp = event.block.timestamp;
        entity.withdrawDateTime = new Date(entity.withdrawTimeStamp.toI64() * 1000).toISOString();
        entity.withdrawTxHash = event.transaction.hash;

        entity.save();
    }
}

export function handleEscrowFund(event: EscorwFundEvent): void {
    let entity = VintageFreeInEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());

    if (!entity) {
        entity = new VintageFreeInEscrowFundEntity(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
    }
    let newFundEntity: VintageNewFundProposal | null;
    let minfundgoal = BigInt.fromI32(0);
    let finalraised = BigInt.fromI32(0);
    let newFundProposalId = Bytes.empty();
    const roundProposalIdEntity = VintageFundRoundToNewFundProposalId.load(event.params.dao.toHexString() + event.params.fundRound.toString());
    if (roundProposalIdEntity) {
        newFundProposalId = roundProposalIdEntity.proposalId;
        newFundEntity = VintageNewFundProposal.load(newFundProposalId.toHexString());
        if (newFundEntity) {
            minfundgoal = newFundEntity.fundRaiseTarget;
            finalraised = newFundEntity.totalFund;
        }
    }

    entity.daoAddr = event.params.dao;
    entity.newFundProposalId = newFundProposalId;
    entity.account = event.params.account;
    // entity.fundRound = event.params.fundRound;
    entity.token = event.params.token;
    entity.createTimeStamp = event.block.timestamp;
    entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
    entity.withdrawTimeStamp = BigInt.fromI32(0);
    entity.withdrawDateTime = "0";
    entity.amount = event.params.amount;
    entity.amountFromWei = entity.amount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.withdrawTxHash = Bytes.empty();
    // entity.minFundGoal = minfundgoal;
    // entity.minFundGoalFromWei = entity.minFundGoal.div(BigInt.fromI64(10 ** 18)).toString();
    // entity.finalRaised = finalraised;
    // entity.finalRaisedFromWei = entity.finalRaised.div(BigInt.fromI64(10 ** 18)).toString();
    // entity.succeedFundRound = BigInt.fromI32(0);
    // if (finalraised >= minfundgoal)
    //     entity.fundRaisedSucceed = true;
    // else entity.fundRaisedSucceed = false;
    // const fundRoundStatisticEntity = VintageFundRoundStatistic.load(event.params.dao.toString() + event.params.fundRound.toString());
    // if (fundRoundStatisticEntity) {
    //     entity.succeedFundRound = fundRoundStatisticEntity.fundRound;
    // }
    entity.save();
}