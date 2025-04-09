/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-06 11:00:10
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-17 14:47:18
 */
// import { BigInt } from "@graphprotocol/graph-ts"
// import { EnsResolver } from "ethers"
// import { EventLog } from "ethers/types/contract"
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import {
    // FlexInvestmentPoolAdapterContract,
    Deposit,
    WithDraw,
    // InvestorMembershipCreated
} from "../generated/FlexInvestmentPoolAdapterContract/FlexInvestmentPoolAdapterContract";
import { DaoRegistry } from "../generated/FlexInvestmentPoolAdapterContract/DaoRegistry";
import { FlexFundingAdapterContract } from "../generated/FlexInvestmentPoolAdapterContract/FlexFundingAdapterContract";

import {
    InvestorBalance,
    InvestorAtivity,
    FlexInvestmentProposal,
    // FlexDaoStatistic,
    // FlexDaoInvestorMembershipEntity
} from "../generated/schema"

export function handleDeposit(event: Deposit): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    const daoContract = DaoRegistry.bind(event.params.daoAddress);
    const flexFundingAdaptContrAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda"));
    const flexFundingContract = FlexFundingAdapterContract.bind(flexFundingAdaptContrAddr);
    let proposalInfo = flexFundingContract.Proposals(event.params.daoAddress, event.params.proposalId);
    let entity = InvestorAtivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new InvestorAtivity(event.transaction.hash.toHex())
    }
    let InvestorBalanceEntity = InvestorBalance.load(event.params.daoAddress.toHexString() + event.params.proposalId.toHexString() + event.params.account.toHexString());
    if (!InvestorBalanceEntity) {
        InvestorBalanceEntity = new InvestorBalance(event.params.daoAddress.toHexString() + event.params.proposalId.toHexString() + event.params.account.toHexString());
        InvestorBalanceEntity.balance = BigInt.fromI64(0);
        InvestorBalanceEntity.advanceBalance = BigInt.fromI64(0);
        InvestorBalanceEntity.daoAddr = event.params.daoAddress;
        InvestorBalanceEntity.proposalId = event.params.proposalId;
        InvestorBalanceEntity.account = event.params.account;
    }

    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.daoAddr = event.params.daoAddress;
    entity.proposalId = event.params.proposalId;
    entity.account = event.params.account;
    entity.type = "deposit";
    entity.amount = event.params.amount;
    entity.amountFromWei = event.params.amount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.timeStamp = event.block.timestamp;
    entity.timeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();

    // Entities can be written to the store with `.save()`
    entity.save()

    InvestorBalanceEntity.balance = InvestorBalanceEntity.balance.plus(event.params.amount);
    InvestorBalanceEntity.advanceBalance = InvestorBalanceEntity.advanceBalance.plus(event.params.amount);
    InvestorBalanceEntity.balanceFromWei = InvestorBalanceEntity.balance.div(BigInt.fromI64(10 ** 18)).toString();
    InvestorBalanceEntity.save();

    let flexInvestmentProposal = FlexInvestmentProposal.load(event.params.proposalId.toHexString())
    if (flexInvestmentProposal) {
        flexInvestmentProposal.totalFund = flexInvestmentProposal.totalFund.plus(event.params.amount);
        flexInvestmentProposal.totalFundFromWei = flexInvestmentProposal.totalFund.div(BigInt.fromI64(10 ** 18)).toString();

        const protocolFee =
            (flexInvestmentProposal.totalFund.times(flexFundingContract.protocolFee())).div(
                BigInt.fromI64(10 ** 18));
        const managementFeeType = daoContract.getConfiguration(
            Bytes.fromHexString("0xda34ff95e06cbf2c9c32a559cd8aadd1a10104596417d62c03db2c1258df83d3")
        );
        const managementFeeAmount = daoContract.getConfiguration(
            Bytes.fromHexString("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87")
        );
        const managementFee = managementFeeType == BigInt.fromI32(0)
            ? (flexInvestmentProposal.totalFund.times(
                managementFeeAmount)
            ).div(BigInt.fromI64(10 ** 18))
            : managementFeeAmount; // type 0:percentage of fund pool  type 1: fixed amount
        const proposerRewardAmount =
            proposalInfo.getProposerRewardInfo().cashRewardAmount;

        const proposerReward = (flexInvestmentProposal.totalFund.times(
            proposerRewardAmount)
        ).div(BigInt.fromI64(10 ** 18));
        flexInvestmentProposal.ultimateInvestedFund = flexInvestmentProposal.totalFund.minus(protocolFee.plus(managementFee).plus(proposerReward));

        let tem: string[] = [];
        if (flexInvestmentProposal.investors.length > 0) {
            for (var j = 0; j < flexInvestmentProposal.investors.length; j++) {
                tem.push(flexInvestmentProposal.investors[j])
            }
        }
        if (!contains(tem, event.params.account.toHexString())) {
            tem.push(event.params.account.toHexString());
            flexInvestmentProposal.investors = tem;
        }

        flexInvestmentProposal.save();
    }

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
    const daoContract = DaoRegistry.bind(event.params.daoAddress);
    const flexFundingAdaptContrAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda"));
    const flexFundingContract = FlexFundingAdapterContract.bind(flexFundingAdaptContrAddr);
    let proposalInfo = flexFundingContract.Proposals(event.params.daoAddress, event.params.proposalId);

    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = InvestorAtivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new InvestorAtivity(event.transaction.hash.toHex())
    }
    let InvestorBalanceEntity = InvestorBalance.load(
        event.params.daoAddress.toHexString() + event.params.proposalId.toHexString() + event.params.account.toHexString()
    );
    if (!InvestorBalanceEntity) {
        InvestorBalanceEntity = new InvestorBalance(
            event.params.daoAddress.toHexString() + event.params.proposalId.toHexString() + event.params.account.toHexString()
        );
        InvestorBalanceEntity.balance = BigInt.fromI64(0);
        InvestorBalanceEntity.advanceBalance = BigInt.fromI64(0);
        InvestorBalanceEntity.daoAddr = event.params.daoAddress;
        InvestorBalanceEntity.proposalId = event.params.proposalId;
        InvestorBalanceEntity.account = event.params.account;
    }

    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.daoAddr = event.params.daoAddress;
    entity.proposalId = event.params.proposalId;
    entity.account = event.params.account;
    entity.type = "withdraw";
    entity.amount = event.params.amount;
    entity.amountFromWei = event.params.amount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.timeStamp = event.block.timestamp;
    entity.timeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();

    // Entities can be written to the store with `.save()`
    entity.save()

    if (event.block.timestamp < proposalInfo.getFundRaiseInfo().fundRaiseEndTime) {
        InvestorBalanceEntity.advanceBalance = InvestorBalanceEntity.advanceBalance.minus(event.params.amount);
    }

    InvestorBalanceEntity.balance = InvestorBalanceEntity.balance.minus(event.params.amount);
    InvestorBalanceEntity.balanceFromWei = InvestorBalanceEntity.balance.div(BigInt.fromI64(10 ** 18)).toString();
    InvestorBalanceEntity.save();

    let flexInvestmentProposal = FlexInvestmentProposal.load(event.params.proposalId.toHexString())
    if (flexInvestmentProposal) {
        flexInvestmentProposal.totalFund = flexInvestmentProposal.totalFund.minus(event.params.amount);
        flexInvestmentProposal.totalFundFromWei = flexInvestmentProposal.totalFund.div(BigInt.fromI64(10 ** 18)).toString();

        const protocolFee =
            (flexInvestmentProposal.totalFund.times(flexFundingContract.protocolFee())).div(
                BigInt.fromI64(10 ** 18));
        const managementFeeType = daoContract.getConfiguration(
            Bytes.fromHexString("0xda34ff95e06cbf2c9c32a559cd8aadd1a10104596417d62c03db2c1258df83d3")
        );
        const managementFeeAmount = daoContract.getConfiguration(
            Bytes.fromHexString("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87")
        );
        const managementFee = managementFeeType == BigInt.fromI32(0)
            ? (flexInvestmentProposal.totalFund.times(
                managementFeeAmount)
            ).div(BigInt.fromI64(10 ** 18))
            : managementFeeAmount; // type 0:percentage of fund pool  type 1: fixed amount
        const proposerRewardAmount =
            proposalInfo.getProposerRewardInfo().cashRewardAmount;

        const proposerReward = (flexInvestmentProposal.totalFund.times(
            proposerRewardAmount)
        ).div(BigInt.fromI64(10 ** 18));
        flexInvestmentProposal.ultimateInvestedFund = flexInvestmentProposal.totalFund.minus(protocolFee.plus(managementFee).plus(proposerReward));


        if (InvestorBalanceEntity.balance.le(BigInt.fromI64(0))) {
            let tem: string[] = [];
            if (flexInvestmentProposal.investors.length > 0) {
                for (var j = 0; j < flexInvestmentProposal.investors.length; j++) {
                    tem.push(flexInvestmentProposal.investors[j])
                }
            }
            remove(tem, event.params.account.toHexString());
            flexInvestmentProposal.investors = tem;
        }

        flexInvestmentProposal.save();
    }
}