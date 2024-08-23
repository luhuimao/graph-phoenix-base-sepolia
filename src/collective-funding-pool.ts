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
import { Address, BigInt, Bytes, bigDecimal, log } from "@graphprotocol/graph-ts";
import {
    ColletiveFundingPoolAdapterContract,
    Deposit,
    WithDraw,
    DistributeRedemptionFee,
    ClearFund,
    ProcessFundRaise
} from "../generated/ColletiveFundingPoolAdapterContract/ColletiveFundingPoolAdapterContract";
import { ColletiveFundRaiseProposalAdapterContract } from "../generated/ColletiveFundingPoolAdapterContract/ColletiveFundRaiseProposalAdapterContract";
import { DaoRegistry } from "../generated/VintageFundingPoolAdapterContract/DaoRegistry";
import { CollectiveInvestmentPoolExtension } from "../generated/ColletiveFundingPoolAdapterContract/CollectiveInvestmentPoolExtension";
import {
    CollectiveRedempteEntity,
    CollectiveInvestorBalance,
    CollectiveInvestorActivity,
    CollectiveFundRaiseProposalEntity,
    CollectiveDaoStatisticEntity,
    CollectiveClearFundEntity,
    // VintageFundRoundStatistic,
    CollectiveSucceedFundCounter,
    // VintageFundRoundToFundEstablishmentProposalId,
    // VintageFundRaiseEntity,
    // VintageInvestorRedemptionsInFundRoundEntity,
    CollectiveEscrowFundEntity
} from "../generated/schema"

export function handleDeposit(event: Deposit): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = CollectiveInvestorActivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new CollectiveInvestorActivity(event.transaction.hash.toHex())
    }
    // const daoContract = DaoRegistry.bind(event.params.daoAddress);
    // const collectiveNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b"));
    // const collectiveNewFundCont = ColletiveFundRaiseProposalAdapterContract.bind(collectiveNewFundContAddr);
    // const createdNewFundId = collectiveNewFundCont.createdFundCounter(event.params.daoAddress);
    // const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.daoAddress.toHexString() + createdNewFundId.toString());


    // if (roundProposalIdEntity) {
    //     let InvestorBalanceEntity = VintageInvestorBalance.load(
    //         event.params.daoAddress.toString()
    //         + roundProposalIdEntity.proposalId.toString()
    //         + event.params.account.toString());

    //     if (!InvestorBalanceEntity) {
    //         InvestorBalanceEntity = new VintageInvestorBalance(
    //             event.params.daoAddress.toString() +
    //             roundProposalIdEntity.proposalId.toString() +
    //             event.params.account.toString());

    //         InvestorBalanceEntity.balance = BigInt.fromI64(0);
    //         InvestorBalanceEntity.balanceFromWei = "0";
    //         InvestorBalanceEntity.daoAddr = event.params.daoAddress;
    //         InvestorBalanceEntity.account = event.params.account;
    //         InvestorBalanceEntity.fundEstablishmentProposalId = roundProposalIdEntity.proposalId;
    //         InvestorBalanceEntity.fundId = createdNewFundId;
    //     }

    //     InvestorBalanceEntity.balance = InvestorBalanceEntity.balance.plus(event.params.amount);
    //     InvestorBalanceEntity.balanceFromWei = InvestorBalanceEntity.balance.div(BigInt.fromI64(10 ** 18)).toString();
    //     InvestorBalanceEntity.save();
    // }

    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.proposalId = Bytes.empty();
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
    let entity = CollectiveInvestorActivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new CollectiveInvestorActivity(event.transaction.hash.toHex())
    }

    const daoContract = DaoRegistry.bind(event.params.daoAddress);
    const collectiveNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b"));
    const collectiveNewFundCont = ColletiveFundRaiseProposalAdapterContract.bind(collectiveNewFundContAddr);
    // const createdNewFundId = vintageNewFundCont.createdFundCounter(event.params.daoAddress);
    // const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.daoAddress.toHexString() + createdNewFundId.toString());

    // if (roundProposalIdEntity) {
    //     let newFundEntity = VintageFundEstablishmentProposal.load(roundProposalIdEntity.proposalId.toHexString());

    //     let InvestorBalanceEntity = VintageInvestorBalance.load(
    //         event.params.daoAddress.toString()
    //         + roundProposalIdEntity.proposalId.toString()
    //         + event.params.account.toString());

    //     if (InvestorBalanceEntity) {
    //         InvestorBalanceEntity.balance = InvestorBalanceEntity.balance.minus(event.params.amount);
    //         InvestorBalanceEntity.balanceFromWei = InvestorBalanceEntity.balance.div(BigInt.fromI64(10 ** 18)).toString();
    //         InvestorBalanceEntity.save();
    //     }

    //     if (newFundEntity) {
    //         const lastFundEndTime = newFundEntity.fundEndTime;
    //         const refundDuration = daoContract.getConfiguration(
    //             Bytes.fromHexString("0xb0d4178853a5320a41f8c55fa6d58af06637e392beff71e66dba4e8f32c39bb8")
    //         );
    //         let fundRaiseEntity = VintageFundRaiseEntity.load(roundProposalIdEntity.proposalId.toHexString());
    //         let escrowFundEntity = VintageEscrowFundEntity.load(
    //             event.params.daoAddress.toHexString()
    //             + event.params.account.toHexString()
    //             + createdNewFundId.toHexString()
    //         );
    //         if (fundRaiseEntity && fundRaiseEntity.fundRaiseState == "failed") {
    //             if (event.block.timestamp > newFundEntity.fundRaiseEndTime) {
    //                 if (!escrowFundEntity) {
    //                     escrowFundEntity = new VintageEscrowFundEntity(
    //                         event.params.daoAddress.toHexString()
    //                         + event.params.account.toHexString()
    //                         + createdNewFundId.toHexString()
    //                     );
    //                     escrowFundEntity.daoAddr = event.params.daoAddress;
    //                     escrowFundEntity.fundEstablishmentProposalId = roundProposalIdEntity.proposalId;
    //                     escrowFundEntity.account = event.params.account;
    //                     escrowFundEntity.fundRound = createdNewFundId;
    //                     escrowFundEntity.token = Bytes.empty();
    //                     escrowFundEntity.createTimeStamp = BigInt.fromI32(0);
    //                     escrowFundEntity.createDateTime = "0";
    //                     escrowFundEntity.withdrawTimeStamp = BigInt.fromI32(0);
    //                     escrowFundEntity.withdrawDateTime = "0";
    //                     escrowFundEntity.amount = BigInt.fromI32(0);
    //                     escrowFundEntity.amountFromWei = "0";
    //                     escrowFundEntity.withdrawTxHash = Bytes.empty();
    //                     escrowFundEntity.minFundGoal = BigInt.fromI32(0);
    //                     escrowFundEntity.minFundGoalFromWei = "0";
    //                     escrowFundEntity.finalRaised = BigInt.fromI32(0);
    //                     escrowFundEntity.finalRaisedFromWei = "0";
    //                     escrowFundEntity.succeedFundRound = BigInt.fromI32(0);
    //                     escrowFundEntity.escrowBlockNum = BigInt.fromI32(0);
    //                     escrowFundEntity.myWithdraw = BigInt.fromI32(0);
    //                     escrowFundEntity.myInvestmentAmount = BigInt.fromI32(0);
    //                     escrowFundEntity.myRedemptionAmount = BigInt.fromI32(0);
    //                     escrowFundEntity.fundRaisedSucceed = false;
    //                     escrowFundEntity.succeedFundRound = BigInt.fromI32(0);
    //                     escrowFundEntity.myConfirmedDepositAmount = BigInt.fromI32(0);
    //                 }
    //                 escrowFundEntity.myWithdraw = escrowFundEntity.myWithdraw.plus(event.params.amount);
    //                 escrowFundEntity.save();

    //             }

    //         }
    //         if (fundRaiseEntity && fundRaiseEntity.fundRaiseState == "succeed") {
    //             if (event.block.timestamp > lastFundEndTime.plus(refundDuration)) {
    //                 if (!escrowFundEntity) {
    //                     escrowFundEntity = new VintageEscrowFundEntity(
    //                         event.params.daoAddress.toHexString()
    //                         + event.params.account.toHexString()
    //                         + createdNewFundId.toHexString()
    //                     );
    //                     escrowFundEntity.daoAddr = event.params.daoAddress;
    //                     escrowFundEntity.fundEstablishmentProposalId = roundProposalIdEntity.proposalId;
    //                     escrowFundEntity.account = event.params.account;
    //                     escrowFundEntity.fundRound = createdNewFundId;
    //                     escrowFundEntity.token = Bytes.empty();
    //                     escrowFundEntity.createTimeStamp = BigInt.fromI32(0);
    //                     escrowFundEntity.createDateTime = "0";
    //                     escrowFundEntity.withdrawTimeStamp = BigInt.fromI32(0);
    //                     escrowFundEntity.withdrawDateTime = "0";
    //                     escrowFundEntity.amount = BigInt.fromI32(0);
    //                     escrowFundEntity.amountFromWei = "0";
    //                     escrowFundEntity.withdrawTxHash = Bytes.empty();
    //                     escrowFundEntity.minFundGoal = BigInt.fromI32(0);
    //                     escrowFundEntity.minFundGoalFromWei = "0";
    //                     escrowFundEntity.finalRaised = BigInt.fromI32(0);
    //                     escrowFundEntity.finalRaisedFromWei = "0";
    //                     escrowFundEntity.succeedFundRound = BigInt.fromI32(0);
    //                     escrowFundEntity.escrowBlockNum = BigInt.fromI32(0);
    //                     escrowFundEntity.myWithdraw = BigInt.fromI32(0);
    //                     escrowFundEntity.myInvestmentAmount = BigInt.fromI32(0);
    //                     escrowFundEntity.myRedemptionAmount = BigInt.fromI32(0);
    //                     escrowFundEntity.fundRaisedSucceed = true;
    //                     escrowFundEntity.succeedFundRound = BigInt.fromI32(0);
    //                     escrowFundEntity.myConfirmedDepositAmount = BigInt.fromI32(0);
    //                 }
    //                 escrowFundEntity.myWithdraw = escrowFundEntity.myWithdraw.plus(event.params.amount);

    //                 escrowFundEntity.save();

    //             }
    //         }


    //     }
    // }


    // txHash:Bytes! 
    // daoAddr: Bytes! # address
    // proposalId: Bytes! # address
    // account:  Bytes! # address
    // type: String!
    // amount: BigInt! # uint256
    // amountFromWei: String!
    // timeStamp: BigInt! # uint256
    // timeString: String!

    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.proposalId = Bytes.empty();
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
    let entity = CollectiveClearFundEntity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new CollectiveClearFundEntity(event.transaction.hash.toHex())
    }
    // const daoContract = DaoRegistry.bind(event.params.daoAddress);
    // const vintageNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b"));
    // const vintageNewFundCont = VintageFundRaiseAdapterContract.bind(vintageNewFundContAddr);
    // const createdFundRound = vintageNewFundCont.createdFundCounter(event.params.dao);
    // const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.dao.toHexString() + createdFundRound.toString());
    // const fundRoundStatisticEntity = VintageFundRoundStatistic.load(event.params.dao.toString() + createdFundRound.toString());
    // let newFundProposalId = Bytes.empty();
    // let createdSucceedFundCounter = BigInt.fromI32(0);
    // if (roundProposalIdEntity) {
    //     newFundProposalId = roundProposalIdEntity.proposalId;
    // }
    // if (fundRoundStatisticEntity) createdSucceedFundCounter = fundRoundStatisticEntity.fundRound;

    // daoAddr: Bytes! # address
    // timeStamp: BigInt! # uint256
    // amount: BigInt! # uint256
    // executor: Bytes! #address
    // fundEstablishmentProposalId: Bytes! # bytes32
    // createdFundCounter: BigInt! # uint256
    // createdSucceedFundCounter: BigInt! # uint256


    entity.daoAddr = event.params.daoAddress;
    entity.amount = event.params.escrowAmount;
    entity.executor = event.params.executer;
    entity.timeStamp = event.block.timestamp;
    entity.fundEstablishmentProposalId = Bytes.empty();
    entity.createdFundCounter = BigInt.zero();
    entity.createdSucceedFundCounter = BigInt.zero();
    entity.save();
}

export function handleRedeptionFeeCharged(event: DistributeRedemptionFee): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    // let entity = CollectiveRedempteEntity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    // if (!entity) {
    //     entity = new CollectiveRedempteEntity(event.transaction.hash.toHex())
    // }

    // entity.daoAddr = event.params.daoAddress;
    // entity.chargedFee = event.params.receivedAmount;
    // entity.redemptAmount = event.params.amount;
    // entity.account = event.params.account;
    // entity.timeStamp = event.block.timestamp;
    // entity.txHash = event.transaction.hash;
    // entity.save();

    // const daoContract = DaoRegistry.bind(event.params.dao);
    // const vintageNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed"));
    // const vintageNewFundCont = VintageFundRaiseAdapterContract.bind(vintageNewFundContAddr);
    // const createdNewFundId = vintageNewFundCont.createdFundCounter(event.params.dao);

    // let redemptionsInFundRoundEntity = VintageInvestorRedemptionsInFundRoundEntity.load(
    //     event.params.dao.toHexString() +
    //     createdNewFundId.toHexString() +
    //     event.params.account.toHexString()
    // );
    // if (!redemptionsInFundRoundEntity) {
    //     redemptionsInFundRoundEntity = new VintageInvestorRedemptionsInFundRoundEntity(
    //         event.params.dao.toHexString() +
    //         createdNewFundId.toHexString() +
    //         event.params.account.toHexString()
    //     );
    //     redemptionsInFundRoundEntity.daoAddr = event.params.dao;
    //     redemptionsInFundRoundEntity.fundRound = createdNewFundId;
    //     redemptionsInFundRoundEntity.investor = event.params.account;
    //     redemptionsInFundRoundEntity.redemptionAmount = BigInt.fromI32(0);
    // }
    // redemptionsInFundRoundEntity.redemptionAmount = redemptionsInFundRoundEntity.redemptionAmount.plus(event.params.redempAmount);
    // redemptionsInFundRoundEntity.save();
}

export function handleProcessFundRaise(event: ProcessFundRaise): void {
    const fundingPoolAdapt = ColletiveFundingPoolAdapterContract.bind(event.address);
    const daoContract = DaoRegistry.bind(event.params.daoAddress);
    const fundingPoolExtAddress = daoContract.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"));
    const fundingPoolExtContr = CollectiveInvestmentPoolExtension.bind(fundingPoolExtAddress);

    // const collectiveNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b"));
    // const collectiveNewFundCont = ColletiveFundRaiseProposalAdapterContract.bind(collectiveNewFundContAddr);
    // const fundRaiseProposalId = collectiveNewFundCont.lastProposalIds(event.params.daoAddress)
    // let fundRaiseProposalEntity = CollectiveFundRaiseProposalEntity.load(fundRaiseProposalId.toHexString());

    const fundRaisedState = fundingPoolAdapt.fundState(event.params.daoAddress);
    let successedFundCounter = CollectiveSucceedFundCounter.load(event.params.daoAddress.toString());
    if (!successedFundCounter) {
        successedFundCounter = new CollectiveSucceedFundCounter(event.params.daoAddress.toString());
        successedFundCounter.daoAddr = event.params.daoAddress;
        successedFundCounter.counter = BigInt.fromI32(0);
    }
    const totoalRaised = event.params.totalRaised;
    // const round = event.params.fundRound
    // const roundProposalIdEntity = VintageFundRoundToFundEstablishmentProposalId.load(event.params.daoAddress.toHexString() + round.toString());
    // if (roundProposalIdEntity) {
    //     let newFundEntity = VintageFundEstablishmentProposal.load(roundProposalIdEntity.proposalId.toHexString());
    //     if (newFundEntity) {
    //         newFundEntity.totalFund = totoalRaised;
    //         newFundEntity.totalFundFromWei = newFundEntity.totalFund.div(BigInt.fromI64(10 ** 18)).toString();
    //         newFundEntity.executeBlockNum = event.block.number;
    //         newFundEntity.save();
    //     }

    //     let fundRaiseEntity = VintageFundRaiseEntity.load(roundProposalIdEntity.proposalId.toHexString());
    //     if (fundRaiseEntity) {
    //         fundRaiseEntity.raisedAmount = event.params.fundRaisedAmount;
    //         fundRaiseEntity.raisedAmountFromWei = fundRaiseEntity.raisedAmount.div(BigInt.fromI64(10 ** 18)).toString();
    //         fundRaiseEntity.fundRaiseState = fundRaisedState == 2 ? "succeed" : "failed";

    //         fundRaiseEntity.save();
    //     }

    // }
    // log.debug("fundRaisedState {}", [fundRaisedState.toString()]);
    if (fundRaisedState == 2) {
        successedFundCounter.counter = successedFundCounter.counter.plus(BigInt.fromI32(1));


        // let fundRoundEntity = new VintageFundRoundStatistic(event.params.daoAddress.toString() + event.params.fundRound.toString());
        // fundRoundEntity.daoAddr = event.params.daoAddress;
        // fundRoundEntity.fundInvested = BigInt.fromI32(0);
        // fundRoundEntity.fundRaised = event.params.fundRaisedAmount;
        // fundRoundEntity.fundRound = successedFundCounter.counter;
        // fundRoundEntity.fundedVentures = BigInt.fromI32(0);
        // fundRoundEntity.tokenAddress = daoContract.getAddressConfiguration(
        //     Bytes.fromHexString("0x7fa36390a0e9b8b8004035572fd8345b1128cea12d1763a1baf8fbd4fb7b2027")
        // );
        // fundingPoolAdapt.getFundInvestors(event.params.dao, event.params.fundRound);
        let collectiveDaoStatisticEntity = CollectiveDaoStatisticEntity.load(event.params.daoAddress.toHexString());
        if (!collectiveDaoStatisticEntity) {
            collectiveDaoStatisticEntity = new CollectiveDaoStatisticEntity(event.params.daoAddress.toHexString());
            collectiveDaoStatisticEntity.fundRaised = BigInt.fromI64(0);
            collectiveDaoStatisticEntity.fundRaisedFromWei = "0";
            collectiveDaoStatisticEntity.fundInvestedFromWei = "0";
            collectiveDaoStatisticEntity.fundInvested = BigInt.fromI64(0);
            collectiveDaoStatisticEntity.fundedVentures = BigInt.fromI64(0);
            collectiveDaoStatisticEntity.members = BigInt.fromI64(0);
            collectiveDaoStatisticEntity.daoAddr = event.params.daoAddress;
            collectiveDaoStatisticEntity.investors = [];
            collectiveDaoStatisticEntity.governors = [];
            collectiveDaoStatisticEntity.membersArr = [];
        }
        // if (daoContract.getConfiguration(Bytes.fromHexString("0xbe07eea886ce63e8ab49ef6fd986e9dea247fbb31da43dd1df3e153cc548277a")) == BigInt.fromI32(1)) {
        //     const fundTokenAddr = daoContract.getAddressConfiguration(Bytes.fromHexString("0x7fa36390a0e9b8b8004035572fd8345b1128cea12d1763a1baf8fbd4fb7b2027"));
        //     const rel = fundingPoolExtContr.try_getPriorAmount(
        //         Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000dECd")),
        //         fundTokenAddr,
        //         event.block.number.minus(BigInt.fromI32(1))
        //     );
        //     if (!rel.reverted)
        //         collectiveDaoStatisticEntity.fundRaised = rel.value;
        // } else {
        //     collectiveDaoStatisticEntity.fundRaised = collectiveDaoStatisticEntity.fundRaised.plus(event.params.totalRaised);
        // }

        // const fundTokenAddr = daoContract.getAddressConfiguration(Bytes.fromHexString("0x7fa36390a0e9b8b8004035572fd8345b1128cea12d1763a1baf8fbd4fb7b2027"));
        const poolBal = fundingPoolAdapt.poolBalance(
            event.params.daoAddress
            // Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000dECd"))
        );
        collectiveDaoStatisticEntity.fundRaised = collectiveDaoStatisticEntity.fundRaised.plus(poolBal);
        collectiveDaoStatisticEntity.fundRaisedFromWei = collectiveDaoStatisticEntity.fundRaised.div(BigInt.fromI64(10 ** 18)).toString();
        collectiveDaoStatisticEntity.save();
        // fundRoundEntity.save();
    }
    successedFundCounter.save();
}