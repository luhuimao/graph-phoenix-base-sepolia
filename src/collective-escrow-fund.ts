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
    EscrowFundFromFailedFundRaising,
    EscrowFundFromLiquidation,
    EscrowFundFromOverRaised,
    WithdrawFromLiquidation,
    WithdrawFromOverRaised,
    WithdrawFromFailedFundRaising,
    CollectiveEscrowFundAdapterContract
} from "../generated/CollectiveEscrowFundAdapterContract/CollectiveEscrowFundAdapterContract";
import { ColletiveFundingPoolAdapterContract } from "../generated/CollectiveEscrowFundAdapterContract/ColletiveFundingPoolAdapterContract";
import { ColletiveFundRaiseProposalAdapterContract } from "../generated/CollectiveEscrowFundAdapterContract/ColletiveFundRaiseProposalAdapterContract";
import { CollectiveInvestmentPoolExtension } from "../generated/CollectiveEscrowFundAdapterContract/CollectiveInvestmentPoolExtension";
import { DaoRegistry } from "../generated/VintageEscrowFundAdapterContract/DaoRegistry";
import {
    CollectiveEscrowFundEntity,
    CollectiveEscrowLiquidationFundEntity,
    CollectiveEscrowFailedFundRaisingFundEntity,
    CollectiveEscrowOverRaisedFundEntity,
    CollectiveFundRaiseProposalEntity,
    // VintageFundRoundStatistic,
    VintageInvestorInvestmentEntity,
    VintageInvestorRedemptionsInFundRoundEntity
} from "../generated/schema"


// export function handleWithDraw(event: WithDrawEvent): void {
//     let entity = CollectiveEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString());
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

// export function handleEscrowFund(event: EscrowFundEvent): void {
//     const escrowContr = CollectiveEscrowFundAdapterContract.bind(event.address);
//     let entity = CollectiveEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString());
//     const dao = DaoRegistry.bind(event.params.dao);

//     const FUND_RAISING_TARGET = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));

//     // const collectiveFundRaiseProposalAdapterContractAddr = dao.getAdapterAddress(Bytes.fromHexString("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b"));
//     // const collectiveFundRaiseProposalAdapterContract = ColletiveFundRaiseProposalAdapterContract.bind(collectiveFundRaiseProposalAdapterContractAddr);

//     // const fundRaiseProposalId = collectiveFundRaiseProposalAdapterContract.lastProposalIds(event.params.dao);
//     // collectiveFundRaiseProposalAdapterContract.proposals(event.params.dao, fundRaiseProposalId);

//     const collectiveFundingPoolAdapterContractAddr = dao.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
//     const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);



//     // const fundRaiseState = collectiveFundingPoolAdapterContract.fundState(event.params.dao)
//     const fundingPoolExtAddress = dao.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"));
//     const collectiveFundingPoolExt = CollectiveInvestmentPoolExtension.bind(fundingPoolExtAddress);

//     const raiseTokenAddr = collectiveFundingPoolExt.getFundRaisingTokenAddress();
//     const poolAmount = collectiveFundingPoolExt.getPriorAmount(
//         Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000decd")),
//         raiseTokenAddr,
//         event.block.number.minus(BigInt.fromI32(1)));
//     const accumulateRaiseAmount = collectiveFundingPoolAdapterContract.try_accumulateRaiseAmount(event.params.dao);


//     const raisedAmount = poolAmount.minus(accumulateRaiseAmount.reverted ? BigInt.zero() : accumulateRaiseAmount.value);
//     const fundRaiseTarget = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));


//     if (!entity) {
//         entity = new CollectiveEscrowFundEntity(event.params.dao.toHexString() + event.params.account.toHexString());
//         entity.myWithdraw = BigInt.fromI32(0);
//         entity.daoAddr = event.params.dao;
//         entity.account = event.params.account;
//         entity.createTimeStamp = event.block.timestamp;
//         entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
//         entity.withdrawTimeStamp = BigInt.fromI32(0);
//         entity.withdrawDateTime = "0";
//         entity.amount = BigInt.fromI32(0);
//         entity.withdrawTxHash = Bytes.empty();
//     }

//     entity.fundEstablishmentProposalId = Bytes.empty();
//     entity.fundRound = BigInt.fromI32(0);
//     entity.token = event.params.token;
//     const rel = escrowContr.try_escrowFunds(event.params.dao, event.params.token, event.params.account);
//     if (!rel.reverted) entity.amount = rel.value;
//     entity.amountFromWei = entity.amount.div(BigInt.fromI64(10 ** 18)).toString();

//     entity.minFundGoal = FUND_RAISING_TARGET;
//     entity.minFundGoalFromWei = entity.minFundGoal.div(BigInt.fromI64(10 ** 18)).toString();
//     entity.finalRaised = poolAmount;
//     entity.finalRaisedFromWei = entity.finalRaised.div(BigInt.fromI64(10 ** 18)).toString();
//     entity.succeedFundRound = BigInt.fromI32(0);
//     entity.escrowBlockNum = event.block.number;
//     let confirmedAmount = collectiveFundingPoolExt.try_getPriorAmount(event.params.account, event.params.token, event.block.number.minus(BigInt.fromI32(1)));
//     entity.myConfirmedDepositAmount = confirmedAmount.reverted ? BigInt.fromI32(0) : confirmedAmount.value;
//     entity.myInvestmentAmount = BigInt.fromI32(0);
//     entity.myRedemptionAmount = BigInt.fromI32(0);
//     entity.fundRaisedSucceed = raisedAmount >= fundRaiseTarget ? true : false;
//     entity.succeedFundRound = BigInt.fromI32(0);
//     entity.save();
// }

export function handleEscrowFundFromFailedFundRaising(event: EscrowFundFromFailedFundRaising): void {
    const escrowContr = CollectiveEscrowFundAdapterContract.bind(event.address);
    let entity = CollectiveEscrowFailedFundRaisingFundEntity.load(event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaisingId.toHexString());
    const dao = DaoRegistry.bind(event.params.dao);

    const FUND_RAISING_TARGET = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));

    const collectiveFundingPoolAdapterContractAddr = dao.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);

    const fundingPoolExtAddress = dao.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"));
    const collectiveFundingPoolExt = CollectiveInvestmentPoolExtension.bind(fundingPoolExtAddress);

    const raiseTokenAddr = collectiveFundingPoolExt.getFundRaisingTokenAddress();
    const poolAmount = collectiveFundingPoolExt.getPriorAmount(
        Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000decd")),
        raiseTokenAddr,
        event.block.number.minus(BigInt.fromI32(1)));
    const accumulateRaiseAmount = collectiveFundingPoolAdapterContract.try_accumulateRaiseAmount(event.params.dao);

    const raisedAmount = poolAmount.minus(accumulateRaiseAmount.reverted ? BigInt.zero() : accumulateRaiseAmount.value);
    const fundRaiseTarget = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));


    if (!entity) {
        entity = new CollectiveEscrowFailedFundRaisingFundEntity(
            event.params.dao.toHexString()
            + event.params.token.toHexString()
            + event.params.account.toHexString()
            + event.params.fundRaisingId.toHexString()
        );

        entity.myWithdrawAmount = BigInt.fromI32(0);
        entity.daoAddr = event.params.dao;
        entity.account = event.params.account;
        entity.createTimeStamp = event.block.timestamp;
        entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
        entity.withdrawTimeStamp = BigInt.fromI32(0);
        entity.withdrawDateTime = "0";
        entity.withdrawTxHash = Bytes.empty();
    }

    // entity.fundEstablishmentProposalId = Bytes.empty();
    entity.fundRaisingId = event.params.fundRaisingId;
    entity.token = event.params.token;
    entity.minFundGoal = FUND_RAISING_TARGET;
    entity.minFundGoalFromWei = entity.minFundGoal.div(BigInt.fromI64(10 ** 18)).toString();
    entity.finalRaised = poolAmount;
    entity.finalRaisedFromWei = entity.finalRaised.div(BigInt.fromI64(10 ** 18)).toString();
    entity.escrowBlockNum = event.block.number;
    let rel1 = collectiveFundingPoolExt.try_getPriorAmount(event.params.account, event.params.token, event.block.number.minus(BigInt.fromI32(1)));
    entity.myAdvanceDepositAmount = rel1.reverted ? BigInt.fromI32(0) : rel1.value;
    entity.myRefundable = event.params.amount;
    entity.save();
}

export function handleEscrowFundFromLiquidation(event: EscrowFundFromLiquidation): void {
    const escrowContr = CollectiveEscrowFundAdapterContract.bind(event.address);
    let entity = CollectiveEscrowLiquidationFundEntity.load(event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.liquidationId.toHexString());
    const dao = DaoRegistry.bind(event.params.dao);

    // const FUND_RAISING_TARGET = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));

    // const collectiveFundingPoolAdapterContractAddr = dao.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    // const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);

    const fundingPoolExtAddress = dao.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"));
    const collectiveFundingPoolExt = CollectiveInvestmentPoolExtension.bind(fundingPoolExtAddress);

    // const raiseTokenAddr = collectiveFundingPoolExt.getFundRaisingTokenAddress();
    // const poolAmount = collectiveFundingPoolExt.getPriorAmount(
    //     Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000decd")),
    //     raiseTokenAddr,
    //     event.block.number.minus(BigInt.fromI32(1)));
    // const accumulateRaiseAmount = collectiveFundingPoolAdapterContract.try_accumulateRaiseAmount(event.params.dao);

    // const raisedAmount = poolAmount.minus(accumulateRaiseAmount.reverted ? BigInt.zero() : accumulateRaiseAmount.value);
    // const fundRaiseTarget = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));


    if (!entity) {
        entity = new CollectiveEscrowLiquidationFundEntity(
            event.params.dao.toHexString()
            + event.params.token.toHexString()
            + event.params.account.toHexString()
            + event.params.liquidationId.toHexString()
        );

        entity.myWithdrawAmount = BigInt.fromI32(0);
        entity.daoAddr = event.params.dao;
        entity.account = event.params.account;
        entity.createTimeStamp = event.block.timestamp;
        entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
        entity.withdrawTimeStamp = BigInt.fromI32(0);
        entity.withdrawDateTime = "0";
        entity.withdrawTxHash = Bytes.empty();
    }

    entity.liquidationId = event.params.liquidationId;
    entity.token = event.params.token;
    entity.escrowBlockNum = event.block.number;
    entity.myRefundable = event.params.amount;
    entity.save();
}

export function handleEscrowFundFromOverRaised(event: EscrowFundFromOverRaised): void {
    const escrowContr = CollectiveEscrowFundAdapterContract.bind(event.address);
    let entity = CollectiveEscrowOverRaisedFundEntity.load(event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaisingId.toHexString());

    const dao = DaoRegistry.bind(event.params.dao);

    const FUND_RAISING_TARGET = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));

    const collectiveFundingPoolAdapterContractAddr = dao.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);

    const fundingPoolExtAddress = dao.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"));
    const collectiveFundingPoolExt = CollectiveInvestmentPoolExtension.bind(fundingPoolExtAddress);

    const raiseTokenAddr = collectiveFundingPoolExt.getFundRaisingTokenAddress();
    const poolAmount = collectiveFundingPoolExt.getPriorAmount(
        Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000decd")),
        raiseTokenAddr,
        event.block.number.minus(BigInt.fromI32(1)));
    const accumulateRaiseAmount = collectiveFundingPoolAdapterContract.try_accumulateRaiseAmount(event.params.dao);

    // const raisedAmount = poolAmount.minus(accumulateRaiseAmount.reverted ? BigInt.zero() : accumulateRaiseAmount.value);
    // const fundRaiseTarget = dao.getConfiguration(Bytes.fromHexString("0x31af571e53636dddd77f772cce9d30b42075760f2da731636acc6962da2fbef8"));


    if (!entity) {
        entity = new CollectiveEscrowOverRaisedFundEntity(
            event.params.dao.toHexString()
            + event.params.token.toHexString()
            + event.params.account.toHexString()
            + event.params.fundRaisingId.toHexString()
        );

        entity.myWithdrawAmount = BigInt.fromI32(0);
        entity.daoAddr = event.params.dao;
        entity.account = event.params.account;
        entity.createTimeStamp = event.block.timestamp;
        entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
        entity.withdrawTimeStamp = BigInt.fromI32(0);
        entity.withdrawDateTime = "0";
        entity.withdrawTxHash = Bytes.empty();
    }

    entity.fundRaisingId = event.params.fundRaisingId;
    entity.token = event.params.token;
    entity.escrowBlockNum = event.block.number;
    let rel1 = collectiveFundingPoolExt.try_getPriorAmount(event.params.account, event.params.token, event.block.number.minus(BigInt.fromI32(1)));
    entity.myAdvanceDepositAmount = rel1.reverted ? BigInt.fromI32(0) : rel1.value;
    entity.myRefundable = event.params.amount;
    entity.amount = event.params.amount;
    entity.amountFromWei = entity.amount.div(BigInt.fromI64(10 ** 18)).toString()
    entity.myConfirmedDepositAmount = entity.myAdvanceDepositAmount.minus(entity.myRefundable);
    entity.save();
}

export function handleWithdrawFromLiquidation(event: WithdrawFromLiquidation): void {
    let entity = CollectiveEscrowLiquidationFundEntity.load(event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.liquidationId.toHexString());

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
    let entity = CollectiveEscrowOverRaisedFundEntity.load(event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaisingId.toHexString());

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
    let entity = CollectiveEscrowFailedFundRaisingFundEntity.load(event.params.dao.toHexString()
        + event.params.token.toHexString()
        + event.params.account.toHexString()
        + event.params.fundRaisingId.toHexString());

    if (entity) {
        entity.withdrawTimeStamp = event.block.timestamp;
        entity.withdrawDateTime = new Date(entity.withdrawTimeStamp.toI64() * 1000).toISOString();
        entity.myWithdrawAmount = event.params.amount;
        entity.withdrawTxHash = event.transaction.hash;
        entity.myRefundable = BigInt.zero();
        entity.save();
    }
}