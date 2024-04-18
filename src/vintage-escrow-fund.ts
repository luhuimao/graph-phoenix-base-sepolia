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
import { BigInt, Bytes, bigInt } from "@graphprotocol/graph-ts";
import {
    EscrowFund as EscorwFundEvent,
    WithDraw as WithDrawEvent
} from "../generated/vintageEscrowFundAdapterContract/vintageEscrowFundAdapterContract"
import { VintageFundingPoolExtension } from "../generated/VintageEscrowFundAdapterContract/VintageFundingPoolExtension";
import { DaoRegistry } from "../generated/VintageEscrowFundAdapterContract/DaoRegistry";
import {
    VintageEscrowFundEntity,
    VintageFundRoundToFundEstablishmentProposalId,
    VintageFundEstablishmentProposal,
    VintageFundRoundStatistic,
    VintageInvestorInvestmentEntity,
    VintageInvestorRedemptionsInFundRoundEntity
} from "../generated/schema"


export function handleWithDraw(event: WithDrawEvent): void {
    let entity = VintageEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
    if (entity) {
        entity.amount = BigInt.fromI32(0);
        entity.amountFromWei = "0";
        entity.withdrawTimeStamp = event.block.timestamp;
        entity.withdrawDateTime = new Date(entity.withdrawTimeStamp.toI64() * 1000).toISOString();
        entity.withdrawTxHash = event.transaction.hash;
        entity.myWithdraw = entity.myWithdraw.plus(event.params.amount);
        entity.save();
    }
}

export function handleEscrowFund(event: EscorwFundEvent): void {
    let entity = VintageEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
    const dao = DaoRegistry.bind(event.params.dao);
    const fundingPoolExtAddress = dao.getExtensionAddress(Bytes.fromHexString("0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f"));
    const vintageFundingPoolExt = VintageFundingPoolExtension.bind(fundingPoolExtAddress);
    if (!entity) {
        entity = new VintageEscrowFundEntity(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
        entity.myWithdraw = BigInt.fromI32(0);
    }
    let newFundEntity: VintageFundEstablishmentProposal | null;
    let minfundgoal = BigInt.fromI32(0);
    let finalraised = BigInt.fromI32(0);
    let newFundProposalId = Bytes.empty();
    let newFundExeBlockNum= BigInt.fromI32(0);
    const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.dao.toHexString() + event.params.fundRound.toString());
    if (roundProposalIdEntity) {
        newFundProposalId = roundProposalIdEntity.proposalId;
        newFundEntity = VintageFundEstablishmentProposal.load(newFundProposalId.toHexString());
        if (newFundEntity) {
            minfundgoal = newFundEntity.fundRaiseTarget;
            finalraised = newFundEntity.totalFund;
            newFundExeBlockNum= newFundEntity.executeBlockNum;
        }
    }

    entity.daoAddr = event.params.dao;
    entity.fundEstablishmentProposalId = newFundProposalId;
    entity.account = event.params.account;
    entity.fundRound = event.params.fundRound;
    entity.token = event.params.token;
    entity.createTimeStamp = event.block.timestamp;
    entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
    entity.withdrawTimeStamp = BigInt.fromI32(0);
    entity.withdrawDateTime = "0";
    entity.amount = event.params.amount;
    entity.amountFromWei = entity.amount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.withdrawTxHash = Bytes.empty();
    entity.minFundGoal = minfundgoal;
    entity.minFundGoalFromWei = entity.minFundGoal.div(BigInt.fromI64(10 ** 18)).toString();
    entity.finalRaised = finalraised;
    entity.finalRaisedFromWei = entity.finalRaised.div(BigInt.fromI64(10 ** 18)).toString();
    entity.succeedFundRound = BigInt.fromI32(0);
    entity.escrowBlockNum = event.block.number;

    let rel = vintageFundingPoolExt.try_getPriorAmount(event.params.account, event.params.token,newFundExeBlockNum.plus(BigInt.fromI32(1)));
    if (!rel.reverted) entity.myConfirmedDepositAmount = rel.value;
   
    let investorInvestmentEntity = VintageInvestorInvestmentEntity.load(
        event.params.dao.toHexString()
        + event.params.fundRound.toHexString() +
        event.params.account.toHexString());

    if (investorInvestmentEntity) {
        entity.myInvestmentAmount = investorInvestmentEntity.investedAmount;
    } else {
        entity.myInvestmentAmount = BigInt.fromI32(0);
    }

    let redemptionsInFundRoundEntity = VintageInvestorRedemptionsInFundRoundEntity.load(
        event.params.dao.toHexString() +
        event.params.fundRound.toHexString() +
        event.params.account.toHexString()
    );
    if (redemptionsInFundRoundEntity) {
        entity.myRedemptionAmount = redemptionsInFundRoundEntity.redemptionAmount;
    } else {
        entity.myRedemptionAmount = BigInt.fromI32(0);
    }

    if (finalraised >= minfundgoal)
        entity.fundRaisedSucceed = true;
    else entity.fundRaisedSucceed = false;
    const fundRoundStatisticEntity = VintageFundRoundStatistic.load(event.params.dao.toString() + event.params.fundRound.toString());
    if (fundRoundStatisticEntity) {
        entity.succeedFundRound = fundRoundStatisticEntity.fundRound;
    }
    entity.save();
}