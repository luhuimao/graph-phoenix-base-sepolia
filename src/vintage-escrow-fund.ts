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
import { BigInt, Bytes, bigInt, Address } from "@graphprotocol/graph-ts";
import {
    EscrowFund as EscorwFundEvent,
    WithDraw as WithDrawEvent,
    EscrowFundFromFailedFundRaising,
    EscrowFundFromOverRaised,
    EscrowFundFromLiquidation,
    WithdrawFromLiquidation,
    WithdrawFromFailedFundRaising,
    WithdrawFromOverRaised,
    VintageEscrowFundAdapterContract
} from "../generated/VintageEscrowFundAdapterContract/VintageEscrowFundAdapterContract"
import { VintageFundingPoolExtension } from "../generated/VintageEscrowFundAdapterContract/VintageFundingPoolExtension";
import { VintageFundRaiseAdapterContract } from "../generated/VintageEscrowFundAdapterContract/VintageFundRaiseAdapterContract";
import { DaoRegistry } from "../generated/VintageEscrowFundAdapterContract/DaoRegistry";
import {
    // VintageEscrowFundEntity,
    VintageFundRoundToFundEstablishmentProposalId,
    VintageFundEstablishmentProposal,
    // VintageFundRoundStatistic,
    // VintageInvestorInvestmentEntity,
    // VintageInvestorRedemptionsInFundRoundEntity,
    VintageEscrowFailedFundRaisingFundEntity,
    VintageEscrowLiquidationFundEntity,
    VintageEscrowOverRaisedFundEntity
} from "../generated/schema"


// export function handleWithDraw(event: WithDrawEvent): void {
//     let entity = VintageEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
//     if (entity) {
//         entity.amount = BigInt.fromI32(0);
//         entity.amountFromWei = "0";
//         entity.withdrawTimeStamp = event.block.timestamp;
//         entity.withdrawDateTime = new Date(entity.withdrawTimeStamp.toI64() * 1000).toISOString();
//         entity.withdrawTxHash = event.transaction.hash;
//         entity.myWithdraw = entity.myWithdraw.plus(event.params.amount);
//         entity.save();
//     }
// }

// export function handleEscrowFund(event: EscorwFundEvent): void {
//     let entity = VintageEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
//     const dao = DaoRegistry.bind(event.params.dao);
//     const fundingPoolExtAddress = dao.getExtensionAddress(Bytes.fromHexString("0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f"));
//     const vintageFundingPoolExt = VintageFundingPoolExtension.bind(fundingPoolExtAddress);
//     if (!entity) {
//         entity = new VintageEscrowFundEntity(event.params.dao.toHexString() + event.params.account.toHexString() + event.params.fundRound.toHexString());
//         entity.myWithdraw = BigInt.fromI32(0);
//     }
//     let newFundEntity: VintageFundEstablishmentProposal | null;
//     let minfundgoal = BigInt.fromI32(0);
//     let finalraised = BigInt.fromI32(0);
//     let newFundProposalId = Bytes.empty();
//     let newFundExeBlockNum= BigInt.fromI32(0);
//     const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.dao.toHexString() + event.params.fundRound.toString());
//     if (roundProposalIdEntity) {
//         newFundProposalId = roundProposalIdEntity.proposalId;
//         newFundEntity = VintageFundEstablishmentProposal.load(newFundProposalId.toHexString());
//         if (newFundEntity) {
//             minfundgoal = newFundEntity.fundRaiseTarget;
//             finalraised = newFundEntity.totalFund;
//             newFundExeBlockNum= newFundEntity.executeBlockNum;
//         }
//     }

//     entity.daoAddr = event.params.dao;
//     entity.fundEstablishmentProposalId = newFundProposalId;
//     entity.account = event.params.account;
//     entity.fundRound = event.params.fundRound;
//     entity.token = event.params.token;
//     entity.createTimeStamp = event.block.timestamp;
//     entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
//     entity.withdrawTimeStamp = BigInt.fromI32(0);
//     entity.withdrawDateTime = "0";
//     entity.amount = event.params.amount;
//     entity.amountFromWei = entity.amount.div(BigInt.fromI64(10 ** 18)).toString();
//     entity.withdrawTxHash = Bytes.empty();
//     entity.minFundGoal = minfundgoal;
//     entity.minFundGoalFromWei = entity.minFundGoal.div(BigInt.fromI64(10 ** 18)).toString();
//     entity.finalRaised = finalraised;
//     entity.finalRaisedFromWei = entity.finalRaised.div(BigInt.fromI64(10 ** 18)).toString();
//     entity.succeedFundRound = BigInt.fromI32(0);
//     entity.escrowBlockNum = event.block.number;

//     let rel = vintageFundingPoolExt.try_getPriorAmount(event.params.account, event.params.token,newFundExeBlockNum.plus(BigInt.fromI32(1)));
//     if (!rel.reverted) entity.myConfirmedDepositAmount = rel.value;

//     let investorInvestmentEntity = VintageInvestorInvestmentEntity.load(
//         event.params.dao.toHexString()
//         + event.params.fundRound.toHexString() +
//         event.params.account.toHexString());

//     if (investorInvestmentEntity) {
//         entity.myInvestmentAmount = investorInvestmentEntity.investedAmount;
//     } else {
//         entity.myInvestmentAmount = BigInt.fromI32(0);
//     }

//     let redemptionsInFundRoundEntity = VintageInvestorRedemptionsInFundRoundEntity.load(
//         event.params.dao.toHexString() +
//         event.params.fundRound.toHexString() +
//         event.params.account.toHexString()
//     );
//     if (redemptionsInFundRoundEntity) {
//         entity.myRedemptionAmount = redemptionsInFundRoundEntity.redemptionAmount;
//     } else {
//         entity.myRedemptionAmount = BigInt.fromI32(0);
//     }

//     if (finalraised >= minfundgoal)
//         entity.fundRaisedSucceed = true;
//     else entity.fundRaisedSucceed = false;
//     const fundRoundStatisticEntity = VintageFundRoundStatistic.load(event.params.dao.toString() + event.params.fundRound.toString());
//     if (fundRoundStatisticEntity) {
//         entity.succeedFundRound = fundRoundStatisticEntity.fundRound;
//     }
//     entity.save();
// }

export function handleEscrowFundFromFailedFundRaising(event: EscrowFundFromFailedFundRaising): void {
    // const escrowContr = VintageEscrowFundAdapterContract.bind(event.address);

    let entity = VintageEscrowFailedFundRaisingFundEntity.load(event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaiseId.toHexString());
    const daoContract = DaoRegistry.bind(event.params.dao);

    const vintageNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed"));
    const vintageNewFundCont = VintageFundRaiseAdapterContract.bind(vintageNewFundContAddr);
    // const fundingPoolExtAddress = dao.getExtensionAddress(Bytes.fromHexString("0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f"));
    // const vintageFundingPoolExt = VintageFundingPoolExtension.bind(fundingPoolExtAddress);

    // const poolAmount = collectiveFundingPoolExt.getPriorAmount(
    //     Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000decd")),
    //     raiseTokenAddr,
    //     event.block.number.minus(BigInt.fromI32(1)));
    // // const accumulateRaiseAmount = collectiveFundingPoolAdapterContract.try_accumulateRaiseAmount(event.params.dao);

    // const raisedAmount = poolAmount.minus(accumulateRaiseAmount.reverted ? BigInt.zero() : accumulateRaiseAmount.value);
    // const fundRaiseTarget = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));

    let newFundEntity: VintageFundEstablishmentProposal | null;
    let minFundGoal = BigInt.fromI32(0);
    let finalRaised = BigInt.fromI32(0);
    let newFundProposalId = Bytes.empty();
    let newFundExeBlockNum = BigInt.fromI32(0);
    const fundRound = vintageNewFundCont.try_createdFundCounter(event.params.dao);
    const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.dao.toHexString() + (fundRound.reverted ? "0" : fundRound.value.toString()));
    if (roundProposalIdEntity) {
        newFundProposalId = roundProposalIdEntity.proposalId;
        newFundEntity = VintageFundEstablishmentProposal.load(newFundProposalId.toHexString());
        if (newFundEntity) {
            minFundGoal = newFundEntity.fundRaiseTarget;
            finalRaised = newFundEntity.totalFund;
            newFundExeBlockNum = newFundEntity.executeBlockNum;
        }
    }

    if (!entity) {
        entity = new VintageEscrowFailedFundRaisingFundEntity(
            event.params.dao.toHexString()
            + event.params.token.toHexString()
            + event.params.account.toHexString()
            + event.params.fundRaiseId.toHexString()
        );
        entity.fundEstablishmentProposalId = newFundProposalId;
        entity.myWithdrawAmount = BigInt.fromI32(0);
        entity.daoAddr = event.params.dao;
        entity.account = event.params.account;
        entity.createTimeStamp = event.block.timestamp;
        entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
        entity.withdrawTimeStamp = BigInt.fromI32(0);
        entity.withdrawDateTime = "0";
        entity.fundRaiseId = event.params.fundRaiseId;
        entity.withdrawTxHash = Bytes.empty();
    }
    // let rel = vintageFundingPoolExt.try_getPriorAmount(event.params.account, event.params.token, newFundExeBlockNum.plus(BigInt.fromI32(1)));
    // if (!rel.reverted) entity.myConfirmedDepositAmount = rel.value;

    entity.fundEstablishmentProposalId = newFundProposalId;
    entity.fundRound = fundRound.reverted ? BigInt.zero() : fundRound.value;
    entity.token = event.params.token;
    entity.minFundGoal = minFundGoal;
    entity.minFundGoalFromWei = entity.minFundGoal.div(BigInt.fromI64(10 ** 18)).toString();
    entity.finalRaised = finalRaised;
    entity.finalRaisedFromWei = entity.finalRaised.div(BigInt.fromI64(10 ** 18)).toString();
    entity.escrowBlockNum = event.block.number;
    entity.myAdvanceDepositAmount = event.params.amount;
    entity.myRefundable = event.params.amount;
    entity.save();
}

export function handleEscrowFundFromLiquidation(event: EscrowFundFromLiquidation): void {
    // const escrowContr = VintageEscrowFundAdapterContract.bind(event.address);
    let entity = VintageEscrowLiquidationFundEntity.load(
        event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaiseId.toHexString());
    const daoContract = DaoRegistry.bind(event.params.dao);
    const vintageNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed"));
    const vintageNewFundCont = VintageFundRaiseAdapterContract.bind(vintageNewFundContAddr);
    const fundRound = vintageNewFundCont.try_createdFundCounter(event.params.dao);

    // const FUND_RAISING_TARGET = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));

    // const collectiveFundingPoolAdapterContractAddr = dao.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    // const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);

    // const fundingPoolExtAddress = dao.getExtensionAddress(Bytes.fromHexString("0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f"));
    // const vintageFundingPoolExt = VintageFundingPoolExtension.bind(fundingPoolExtAddress);

    // const raiseTokenAddr = collectiveFundingPoolExt.getFundRaisingTokenAddress();
    // const poolAmount = collectiveFundingPoolExt.getPriorAmount(
    //     Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000decd")),
    //     raiseTokenAddr,
    //     event.block.number.minus(BigInt.fromI32(1)));
    // const accumulateRaiseAmount = collectiveFundingPoolAdapterContract.try_accumulateRaiseAmount(event.params.dao);

    // const raisedAmount = poolAmount.minus(accumulateRaiseAmount.reverted ? BigInt.zero() : accumulateRaiseAmount.value);
    // const fundRaiseTarget = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));
    let newFundProposalId = Bytes.empty();
    const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.dao.toHexString() + (fundRound.reverted ? "0" : fundRound.value.toString()));
    if (roundProposalIdEntity) {
        newFundProposalId = roundProposalIdEntity.proposalId;
    }

    if (!entity) {
        entity = new VintageEscrowLiquidationFundEntity(
            event.params.dao.toHexString()
            + event.params.token.toHexString()
            + event.params.account.toHexString()
            + event.params.fundRaiseId.toHexString()
        );
        entity.fundEstablishmentProposalId = newFundProposalId;
        entity.myWithdrawAmount = BigInt.fromI32(0);
        entity.daoAddr = event.params.dao;
        entity.account = event.params.account;
        entity.createTimeStamp = event.block.timestamp;
        entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
        entity.withdrawTimeStamp = BigInt.fromI32(0);
        entity.withdrawDateTime = "0";
        entity.withdrawTxHash = Bytes.empty();
        entity.fundRaiseId = event.params.fundRaiseId;
    }

    entity.fundRound = fundRound.reverted ? BigInt.zero() : fundRound.value;
    entity.token = event.params.token;
    entity.escrowBlockNum = event.block.number;
    entity.myRefundable = event.params.amount;
    entity.save();
}

export function handleEscrowFundFromOverRaised(event: EscrowFundFromOverRaised): void {
    // const escrowContr = VintageEscrowFundAdapterContract.bind(event.address);
    let entity = VintageEscrowOverRaisedFundEntity.load(event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaiseId.toHexString()
    );

    const daoContract = DaoRegistry.bind(event.params.dao);

    const vintageNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed"));
    const vintageNewFundCont = VintageFundRaiseAdapterContract.bind(vintageNewFundContAddr);
    const fundRound = vintageNewFundCont.try_createdFundCounter(event.params.dao);

    // const FUND_RAISING_TARGET = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));

    // const collectiveFundingPoolAdapterContractAddr = dao.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    // const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);

    const fundingPoolExtAddress = daoContract.getExtensionAddress(Bytes.fromHexString("0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f"));
    const vintageFundingPoolExt = VintageFundingPoolExtension.bind(fundingPoolExtAddress);

    // const raiseTokenAddr = vintageFundingPoolExt.getFundRaisingTokenAddress();
    // const poolAmount = vintageFundingPoolExt.getPriorAmount(
    //     Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000decd")),
    //     raiseTokenAddr,
    //     event.block.number.minus(BigInt.fromI32(1)));
    // const accumulateRaiseAmount = collectiveFundingPoolAdapterContract.try_accumulateRaiseAmount(event.params.dao);

    // const raisedAmount = poolAmount.minus(accumulateRaiseAmount.reverted ? BigInt.zero() : accumulateRaiseAmount.value);
    // const fundRaiseTarget = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));
    let newFundProposalId = Bytes.empty();
    // const currentFundRaiseId = dao.try_getCurrentFundEstablishmentProposalId();
    const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.dao.toHexString() + (fundRound.reverted ? "0" : fundRound.value.toString()));
    if (roundProposalIdEntity) {
        newFundProposalId = roundProposalIdEntity.proposalId;
    }

    if (!entity) {
        entity = new VintageEscrowOverRaisedFundEntity(
            event.params.dao.toHexString()
            + event.params.token.toHexString()
            + event.params.account.toHexString()
            + event.params.fundRaiseId.toHexString()
        );
        entity.fundEstablishmentProposalId = newFundProposalId;
        entity.myWithdrawAmount = BigInt.fromI32(0);
        entity.daoAddr = event.params.dao;
        entity.account = event.params.account;
        entity.createTimeStamp = event.block.timestamp;
        entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
        entity.withdrawTimeStamp = BigInt.fromI32(0);
        entity.withdrawDateTime = "0";
        entity.withdrawTxHash = Bytes.empty();
        entity.fundRaiseId = event.params.fundRaiseId;
    }

    entity.fundRound = fundRound.reverted ? BigInt.zero() : fundRound.value;
    entity.token = event.params.token;
    entity.escrowBlockNum = event.block.number;
    let rel1 = vintageFundingPoolExt.try_getPriorAmount(event.params.account, event.params.token, event.block.number.minus(BigInt.fromI32(1)));
    entity.myAdvanceDepositAmount = rel1.reverted ? BigInt.fromI32(0) : rel1.value;
    entity.myRefundable = event.params.amount;
    entity.amount = event.params.amount;
    entity.amountFromWei = entity.amount.div(BigInt.fromI64(10 ** 18)).toString()
    entity.myConfirmedDepositAmount = entity.myAdvanceDepositAmount.minus(entity.myRefundable);
    entity.save();
}

export function handleWithdrawFromLiquidation(event: WithdrawFromLiquidation): void {
    let entity = VintageEscrowLiquidationFundEntity.load(event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaiseId.toHexString());

    if (entity) {
        entity.withdrawTimeStamp = event.block.timestamp;
        entity.withdrawDateTime = new Date(entity.withdrawTimeStamp.toI64() * 1000).toISOString();
        entity.myWithdrawAmount = event.params.amount;
        entity.withdrawTxHash = event.transaction.hash;
        entity.myRefundable = BigInt.zero();
        entity.save();
    }
}

export function handleWithdrawFromOverRaised(event: WithdrawFromOverRaised): void {

    // let newFundProposalId;
    // const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.dao.toHexString() + event.params.fundRound.toString());
    // if (roundProposalIdEntity) {
    //     newFundProposalId = roundProposalIdEntity.proposalId;
    // }

    let entity = VintageEscrowOverRaisedFundEntity.load(
        event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaiseId.toHexString());

    if (entity) {
        entity.withdrawTimeStamp = event.block.timestamp;
        entity.withdrawDateTime = new Date(entity.withdrawTimeStamp.toI64() * 1000).toISOString();
        entity.myWithdrawAmount = event.params.amount;
        entity.withdrawTxHash = event.transaction.hash;
        entity.myRefundable = BigInt.zero();
        entity.save();
    }
}

export function handleWithdrawFromFailedFundRaising(event: WithdrawFromFailedFundRaising): void {
    let entity = VintageEscrowFailedFundRaisingFundEntity.load(
        event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaiseId.toHexString());

    if (entity) {
        entity.withdrawTimeStamp = event.block.timestamp;
        entity.withdrawDateTime = new Date(entity.withdrawTimeStamp.toI64() * 1000).toISOString();
        entity.myWithdrawAmount = event.params.amount;
        entity.withdrawTxHash = event.transaction.hash;
        entity.myRefundable = BigInt.zero();
        entity.save();
    }
}