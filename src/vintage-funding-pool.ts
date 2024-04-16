/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-06 11:00:10
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-16 14:08:46
 */
// import { BigInt } from "@graphprotocol/graph-ts"
// import { EnsResolver } from "ethers"
// import { EventLog } from "ethers/types/contract"
import { BigInt, Bytes, bigDecimal, log } from "@graphprotocol/graph-ts";
import {
    VintageFundingPoolAdapterContract,
    Deposit,
    WithDraw,
    RedeptionFeeCharged,
    ClearFund,
    ProcessFundRaise
} from "../generated/VintageFundingPoolAdapterContract/VintageFundingPoolAdapterContract";
import { VintageFundRaiseAdapterContract } from "../generated/VintageFundRaiseAdapterContract/VintageFundRaiseAdapterContract";
import { DaoRegistry } from "../generated/VintageFundingPoolAdapterContract/DaoRegistry";
import {
    VintageRedempteEntity,
    VintageInvestorBalance,
    VintageInvestorAtivity,
    VintageNewFundProposal,
    VintageDaoStatistic,
    VintageClearFundEntity,
    VintageFundRoundStatistic,
    VintageSuccessedFundCounter,
    VintageFundRoundToNewFundProposalId,
    VintageFundRaiseEntity,
    VintageInvestorRedemptionsInFundRoundEntity,
    VintageEscrowFundEntity
} from "../generated/schema"

export function handleDeposit(event: Deposit): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageInvestorAtivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageInvestorAtivity(event.transaction.hash.toHex())
    }
    const daoContract = DaoRegistry.bind(event.params.daoAddress);
    const vintageNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed"));
    const vintageNewFundCont = VintageFundRaiseAdapterContract.bind(vintageNewFundContAddr);
    const createdNewFundId = vintageNewFundCont.createdFundCounter(event.params.daoAddress);
    const roundProposalIdEntity = VintageFundRoundToNewFundProposalId.load(event.params.daoAddress.toHexString() + createdNewFundId.toString());


    if (roundProposalIdEntity) {
        let InvestorBalanceEntity = VintageInvestorBalance.load(
            event.params.daoAddress.toString()
            + roundProposalIdEntity.proposalId.toString()
            + event.params.account.toString());

        if (!InvestorBalanceEntity) {
            InvestorBalanceEntity = new VintageInvestorBalance(
                event.params.daoAddress.toString() +
                roundProposalIdEntity.proposalId.toString() +
                event.params.account.toString());

            InvestorBalanceEntity.balance = BigInt.fromI64(0);
            InvestorBalanceEntity.balanceFromWei = "0";
            InvestorBalanceEntity.daoAddr = event.params.daoAddress;
            InvestorBalanceEntity.account = event.params.account;
            InvestorBalanceEntity.newFundProposalId = roundProposalIdEntity.proposalId;
            InvestorBalanceEntity.fundId = createdNewFundId;
        }

        InvestorBalanceEntity.balance = InvestorBalanceEntity.balance.plus(event.params.amount);
        InvestorBalanceEntity.balanceFromWei = InvestorBalanceEntity.balance.div(BigInt.fromI64(10 ** 18)).toString();
        InvestorBalanceEntity.save();
    }

    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.daoAddr = event.params.daoAddress;
    entity.account = event.params.account;
    entity.type = "deposit";
    entity.amount = event.params.amount;
    entity.amountFromWei = event.params.amount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.timeStamp = event.block.timestamp;
    entity.timeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();

    // Entities can be written to the store with `.save()`
    entity.save()


}

function contains(investors: string[], account: string): boolean {
    const index = investors.indexOf(account);
    if (index !== -1) return true;
    return false;
}

function remove(investors: string[], account: string): void {
    const index = investors.indexOf(account);
    if (index !== -1) investors.splice(index, 1);
}


export function handleWithDraw(event: WithDraw): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageInvestorAtivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageInvestorAtivity(event.transaction.hash.toHex())
    }

    const daoContract = DaoRegistry.bind(event.params.daoAddress);
    const vintageNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed"));
    const vintageNewFundCont = VintageFundRaiseAdapterContract.bind(vintageNewFundContAddr);
    const createdNewFundId = vintageNewFundCont.createdFundCounter(event.params.daoAddress);
    const roundProposalIdEntity = VintageFundRoundToNewFundProposalId.load(event.params.daoAddress.toHexString() + createdNewFundId.toString());

    if (roundProposalIdEntity) {
        let newFundEntity = VintageNewFundProposal.load(roundProposalIdEntity.proposalId.toHexString());

        let InvestorBalanceEntity = VintageInvestorBalance.load(
            event.params.daoAddress.toString()
            + roundProposalIdEntity.proposalId.toString()
            + event.params.account.toString());

        if (InvestorBalanceEntity) {
            InvestorBalanceEntity.balance = InvestorBalanceEntity.balance.minus(event.params.amount);
            InvestorBalanceEntity.balanceFromWei = InvestorBalanceEntity.balance.div(BigInt.fromI64(10 ** 18)).toString();
            InvestorBalanceEntity.save();
        }

        if (newFundEntity) {
            const lastFundEndTime = newFundEntity.fundEndTime;
            const refundDuration = daoContract.getConfiguration(
                Bytes.fromHexString("0xb0d4178853a5320a41f8c55fa6d58af06637e392beff71e66dba4e8f32c39bb8")
            );
            let fundRaiseEntity = VintageFundRaiseEntity.load(roundProposalIdEntity.proposalId.toHexString());
            let escrowFundEntity = VintageEscrowFundEntity.load(
                event.params.daoAddress.toHexString()
                + event.params.account.toHexString()
                + createdNewFundId.toHexString()
            );
            if (fundRaiseEntity && fundRaiseEntity.fundRaiseState == "failed") {
                if (event.block.timestamp > newFundEntity.fundRaiseEndTime) {
                    if (!escrowFundEntity) {
                        escrowFundEntity = new VintageEscrowFundEntity(
                            event.params.daoAddress.toHexString()
                            + event.params.account.toHexString()
                            + createdNewFundId.toHexString()
                        );
                        escrowFundEntity.daoAddr = event.params.daoAddress;
                        escrowFundEntity.newFundProposalId = roundProposalIdEntity.proposalId;
                        escrowFundEntity.account = event.params.account;
                        escrowFundEntity.fundRound = createdNewFundId;
                        escrowFundEntity.token = Bytes.empty();
                        escrowFundEntity.createTimeStamp = BigInt.fromI32(0);
                        escrowFundEntity.createDateTime = "0";
                        escrowFundEntity.withdrawTimeStamp = BigInt.fromI32(0);
                        escrowFundEntity.withdrawDateTime = "0";
                        escrowFundEntity.amount = BigInt.fromI32(0);
                        escrowFundEntity.amountFromWei = "0";
                        escrowFundEntity.withdrawTxHash = Bytes.empty();
                        escrowFundEntity.minFundGoal = BigInt.fromI32(0);
                        escrowFundEntity.minFundGoalFromWei = "0";
                        escrowFundEntity.finalRaised = BigInt.fromI32(0);
                        escrowFundEntity.finalRaisedFromWei = "0";
                        escrowFundEntity.succeedFundRound = BigInt.fromI32(0);
                        escrowFundEntity.escrowBlockNum = BigInt.fromI32(0);
                        escrowFundEntity.myWithdraw = BigInt.fromI32(0);
                        escrowFundEntity.myInvestmentAmount = BigInt.fromI32(0);
                        escrowFundEntity.myRedemptionAmount = BigInt.fromI32(0);
                        escrowFundEntity.fundRaisedSucceed = false;
                        escrowFundEntity.succeedFundRound = BigInt.fromI32(0);
                        escrowFundEntity.myConfirmedDepositAmount=BigInt.fromI32(0);
                    }
                    escrowFundEntity.myWithdraw = escrowFundEntity.myWithdraw.plus(event.params.amount);
                    escrowFundEntity.save();

                }

            }
            if (fundRaiseEntity && fundRaiseEntity.fundRaiseState == "succeed") {
                if (event.block.timestamp > lastFundEndTime.plus(refundDuration)) {
                    if (!escrowFundEntity) {
                        escrowFundEntity = new VintageEscrowFundEntity(
                            event.params.daoAddress.toHexString()
                            + event.params.account.toHexString()
                            + createdNewFundId.toHexString()
                        );
                        escrowFundEntity.daoAddr = event.params.daoAddress;
                        escrowFundEntity.newFundProposalId = roundProposalIdEntity.proposalId;
                        escrowFundEntity.account = event.params.account;
                        escrowFundEntity.fundRound = createdNewFundId;
                        escrowFundEntity.token = Bytes.empty();
                        escrowFundEntity.createTimeStamp = BigInt.fromI32(0);
                        escrowFundEntity.createDateTime = "0";
                        escrowFundEntity.withdrawTimeStamp = BigInt.fromI32(0);
                        escrowFundEntity.withdrawDateTime = "0";
                        escrowFundEntity.amount = BigInt.fromI32(0);
                        escrowFundEntity.amountFromWei = "0";
                        escrowFundEntity.withdrawTxHash = Bytes.empty();
                        escrowFundEntity.minFundGoal = BigInt.fromI32(0);
                        escrowFundEntity.minFundGoalFromWei = "0";
                        escrowFundEntity.finalRaised = BigInt.fromI32(0);
                        escrowFundEntity.finalRaisedFromWei = "0";
                        escrowFundEntity.succeedFundRound = BigInt.fromI32(0);
                        escrowFundEntity.escrowBlockNum = BigInt.fromI32(0);
                        escrowFundEntity.myWithdraw = BigInt.fromI32(0);
                        escrowFundEntity.myInvestmentAmount = BigInt.fromI32(0);
                        escrowFundEntity.myRedemptionAmount = BigInt.fromI32(0);
                        escrowFundEntity.fundRaisedSucceed = true;
                        escrowFundEntity.succeedFundRound = BigInt.fromI32(0);
                        escrowFundEntity.myConfirmedDepositAmount=BigInt.fromI32(0);
                    }
                    escrowFundEntity.myWithdraw = escrowFundEntity.myWithdraw.plus(event.params.amount);

                    escrowFundEntity.save();

                }
            }


        }
    }


    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.daoAddr = event.params.daoAddress;
    entity.account = event.params.account;
    entity.type = "withdraw";
    entity.amount = event.params.amount;
    entity.amountFromWei = event.params.amount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.timeStamp = event.block.timestamp;
    entity.timeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();

    // Entities can be written to the store with `.save()`
    entity.save();
}

export function handleClearFund(event: ClearFund): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageClearFundEntity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageClearFundEntity(event.transaction.hash.toHex())
    }
    const daoContract = DaoRegistry.bind(event.params.dao);
    const vintageNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed"));
    const vintageNewFundCont = VintageFundRaiseAdapterContract.bind(vintageNewFundContAddr);
    const createdFundRound = vintageNewFundCont.createdFundCounter(event.params.dao);
    const roundProposalIdEntity = VintageFundRoundToNewFundProposalId.load(event.params.dao.toHexString() + createdFundRound.toString());
    const fundRoundStatisticEntity = VintageFundRoundStatistic.load(event.params.dao.toString() + createdFundRound.toString());
    let newFundProposalId = Bytes.empty();
    let createdSucceedFundCounter = BigInt.fromI32(0);
    if (roundProposalIdEntity) {
        newFundProposalId = roundProposalIdEntity.proposalId;
    }
    if (fundRoundStatisticEntity) createdSucceedFundCounter = fundRoundStatisticEntity.fundRound;
    entity.daoAddr = event.params.dao;
    entity.amount = event.params.amount;
    entity.executor = event.params.executor;
    entity.timeStamp = event.block.timestamp;
    entity.newFundProposalId = newFundProposalId;
    entity.createdFundCounter = createdFundRound;
    entity.createdSucceedFundCounter = createdSucceedFundCounter;
    entity.save();
}

export function handleRedeptionFeeCharged(event: RedeptionFeeCharged): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = VintageRedempteEntity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageRedempteEntity(event.transaction.hash.toHex())
    }

    entity.daoAddr = event.params.dao;
    entity.chargedFee = event.params.redemptionFee;
    entity.redemptAmount = event.params.redempAmount;
    entity.account = event.params.account;
    entity.timeStamp = event.block.timestamp;
    entity.txHash = event.transaction.hash;
    entity.save();

    const daoContract = DaoRegistry.bind(event.params.dao);
    const vintageNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed"));
    const vintageNewFundCont = VintageFundRaiseAdapterContract.bind(vintageNewFundContAddr);
    const createdNewFundId = vintageNewFundCont.createdFundCounter(event.params.dao);

    let redemptionsInFundRoundEntity = VintageInvestorRedemptionsInFundRoundEntity.load(
        event.params.dao.toHexString() +
        createdNewFundId.toHexString() +
        event.params.account.toHexString()
    );
    if (!redemptionsInFundRoundEntity) {
        redemptionsInFundRoundEntity = new VintageInvestorRedemptionsInFundRoundEntity(
            event.params.dao.toHexString() +
            createdNewFundId.toHexString() +
            event.params.account.toHexString()
        );
        redemptionsInFundRoundEntity.daoAddr = event.params.dao;
        redemptionsInFundRoundEntity.fundRound = createdNewFundId;
        redemptionsInFundRoundEntity.investor = event.params.account;
        redemptionsInFundRoundEntity.redemptionAmount = BigInt.fromI32(0);
    }
    redemptionsInFundRoundEntity.redemptionAmount = redemptionsInFundRoundEntity.redemptionAmount.plus(event.params.redempAmount);
    redemptionsInFundRoundEntity.save();
}

export function handleProcessFundRaise(event: ProcessFundRaise): void {
    const fundingPoolAdapt = VintageFundingPoolAdapterContract.bind(event.address);
    const daoContract = DaoRegistry.bind(event.params.dao);
    const fundRaisedState = fundingPoolAdapt.daoFundRaisingStates(event.params.dao);
    let successedFundCounter = VintageSuccessedFundCounter.load(event.params.dao.toString());
    if (!successedFundCounter) {
        successedFundCounter = new VintageSuccessedFundCounter(event.params.dao.toString());
        successedFundCounter.daoAddr = event.params.dao;
        successedFundCounter.counter = BigInt.fromI32(0);
    }
    const totoalRaised = event.params.fundRaisedAmount;
    const round = event.params.fundRound
    const roundProposalIdEntity = VintageFundRoundToNewFundProposalId.load(event.params.dao.toHexString() + round.toString());
    if (roundProposalIdEntity) {
        let newFundEntity = VintageNewFundProposal.load(roundProposalIdEntity.proposalId.toHexString());
        if (newFundEntity) {
            newFundEntity.totalFund = totoalRaised;
            newFundEntity.totalFundFromWei = newFundEntity.totalFund.div(BigInt.fromI64(10 ** 18)).toString();
            newFundEntity.save();
        }

        let fundRaiseEntity = VintageFundRaiseEntity.load(roundProposalIdEntity.proposalId.toHexString());
        if (fundRaiseEntity) {
            fundRaiseEntity.raisedAmount = event.params.fundRaisedAmount;
            fundRaiseEntity.raisedAmountFromWei = fundRaiseEntity.raisedAmount.div(BigInt.fromI64(10 ** 18)).toString();
            fundRaiseEntity.fundRaiseState = fundRaisedState == 2 ? "succeed" : "failed";

            fundRaiseEntity.save();
        }

    }
    // log.debug("fundRaisedState {}", [fundRaisedState.toString()]);
    if (fundRaisedState == 2) {
        successedFundCounter.counter = successedFundCounter.counter.plus(BigInt.fromI32(1));

        let fundRoundEntity = new VintageFundRoundStatistic(event.params.dao.toString() + event.params.fundRound.toString());
        fundRoundEntity.daoAddr = event.params.dao;
        fundRoundEntity.fundInvested = BigInt.fromI32(0);
        fundRoundEntity.fundRaised = event.params.fundRaisedAmount;
        fundRoundEntity.fundRound = successedFundCounter.counter;
        fundRoundEntity.fundedVentures = BigInt.fromI32(0);
        fundRoundEntity.tokenAddress = daoContract.getAddressConfiguration(
            Bytes.fromHexString("0x7fa36390a0e9b8b8004035572fd8345b1128cea12d1763a1baf8fbd4fb7b2027")
        );
        // fundingPoolAdapt.getFundInvestors(event.params.dao, event.params.fundRound);
        let VintageDaoStatisticsEntity = VintageDaoStatistic.load(event.params.dao.toHexString());
        if (!VintageDaoStatisticsEntity) {
            VintageDaoStatisticsEntity = new VintageDaoStatistic(event.params.dao.toHexString());
            VintageDaoStatisticsEntity.fundRaised = BigInt.fromI64(0);
            VintageDaoStatisticsEntity.fundRaisedFromWei = "0";
            VintageDaoStatisticsEntity.fundInvestedFromWei = "0";
            VintageDaoStatisticsEntity.fundInvested = BigInt.fromI64(0);
            VintageDaoStatisticsEntity.fundedVentures = BigInt.fromI64(0);
            VintageDaoStatisticsEntity.members = BigInt.fromI64(0);
            VintageDaoStatisticsEntity.daoAddr = event.params.dao;
        }
        VintageDaoStatisticsEntity.fundRaised = VintageDaoStatisticsEntity.fundRaised.plus(event.params.fundRaisedAmount);
        VintageDaoStatisticsEntity.fundRaisedFromWei = VintageDaoStatisticsEntity.fundRaised.div(BigInt.fromI64(10 ** 18)).toString();
        VintageDaoStatisticsEntity.save();
        fundRoundEntity.save();
    }
    successedFundCounter.save();
}