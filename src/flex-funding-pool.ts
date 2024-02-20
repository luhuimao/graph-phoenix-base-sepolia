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
    FlexInvestmentPoolAdapterContract,
    Deposit,
    WithDraw,
    InvestorMembershipCreated
} from "../generated/FlexInvestmentPoolAdapterContract/FlexInvestmentPoolAdapterContract";
import { DaoRegistry } from "../generated/FlexAllocationAdapterContract/DaoRegistry";
import {
    InvestorBalance,
    InvestorAtivity,
    FlexFundingProposal,
    FlexDaoStatistic,
    FlexDaoInvestorMembershipEntity
} from "../generated/schema"

export function handleDeposit(event: Deposit): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = InvestorAtivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new InvestorAtivity(event.transaction.hash.toHex())
    }
    let InvestorBalanceEntity = InvestorBalance.load(event.params.proposalId.toHexString() + event.params.account.toString());
    if (!InvestorBalanceEntity) {
        InvestorBalanceEntity = new InvestorBalance(event.params.proposalId.toHexString() + event.params.account.toString());
        InvestorBalanceEntity.balance = BigInt.fromI64(0);
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
    InvestorBalanceEntity.balanceFromWei = InvestorBalanceEntity.balance.div(BigInt.fromI64(10 ** 18)).toString();
    InvestorBalanceEntity.save();

    let flexFundingProposal = FlexFundingProposal.load(event.params.proposalId.toHexString())
    if (flexFundingProposal) {
        flexFundingProposal.totalFund = flexFundingProposal.totalFund.plus(event.params.amount);
        flexFundingProposal.totalFundFromWei = flexFundingProposal.totalFund.div(BigInt.fromI64(10 ** 18)).toString();
        // if (!contains(flexFundingProposal.investors, event.params.account)) {
        let tem: string[] = [];
        if (flexFundingProposal.investors.length > 0) {
            for (var j = 0; j < flexFundingProposal.investors.length; j++) {
                tem.push(flexFundingProposal.investors[j])
            }
        }
        if (!contains(tem, event.params.account.toHexString())) {
            tem.push(event.params.account.toHexString());
            flexFundingProposal.investors = tem;
        }

        flexFundingProposal.save();
    }

    // let FlexDaoStatisticsEntity = FlexDaoStatistic.load(event.params.daoAddress.toString());
    // if (!FlexDaoStatisticsEntity) {
    //     FlexDaoStatisticsEntity = new FlexDaoStatistic(event.params.daoAddress.toString());
    //     FlexDaoStatisticsEntity.fundRaised = BigInt.fromI64(0);
    //     FlexDaoStatisticsEntity.fundRaisedFromWei = "0";
    //     FlexDaoStatisticsEntity.fundInvested = BigInt.fromI64(0);
    //     FlexDaoStatisticsEntity.fundInvestedFromWei = "0";
    //     FlexDaoStatisticsEntity.fundedVentures = BigInt.fromI64(0);
    //     FlexDaoStatisticsEntity.members = BigInt.fromI64(0);
    //     FlexDaoStatisticsEntity.daoAddr = event.params.daoAddress;
    // }
    // FlexDaoStatisticsEntity.fundRaised = FlexDaoStatisticsEntity.fundRaised.plus(event.params.amount);
    // FlexDaoStatisticsEntity.fundRaisedFromWei = FlexDaoStatisticsEntity.fundRaised.div(BigInt.fromI64(10 ** 18)).toString();

    // FlexDaoStatisticsEntity.save();

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
    let entity = InvestorAtivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new InvestorAtivity(event.transaction.hash.toHex())
    }
    let InvestorBalanceEntity = InvestorBalance.load(
        event.params.proposalId.toHexString() + event.params.account.toString()
    );
    if (!InvestorBalanceEntity) {
        InvestorBalanceEntity = new InvestorBalance(
            event.params.proposalId.toHexString() + event.params.account.toString()
        );
        InvestorBalanceEntity.balance = BigInt.fromI64(0);
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


    InvestorBalanceEntity.balance = InvestorBalanceEntity.balance.minus(event.params.amount);
    InvestorBalanceEntity.balanceFromWei = InvestorBalanceEntity.balance.div(BigInt.fromI64(10 ** 18)).toString();
    InvestorBalanceEntity.save();

    let flexFundingProposal = FlexFundingProposal.load(event.params.proposalId.toHexString())
    if (flexFundingProposal) {
        flexFundingProposal.totalFund = flexFundingProposal.totalFund.minus(event.params.amount);
        flexFundingProposal.totalFundFromWei = flexFundingProposal.totalFund.div(BigInt.fromI64(10 ** 18)).toString();

        if (InvestorBalanceEntity.balance.le(BigInt.fromI64(0))) {
            let tem: string[] = [];
            if (flexFundingProposal.investors.length > 0) {
                for (var j = 0; j < flexFundingProposal.investors.length; j++) {
                    tem.push(flexFundingProposal.investors[j])
                }
            }
            remove(tem, event.params.account.toHexString());
            flexFundingProposal.investors = tem;
        }

        flexFundingProposal.save();
    }

    // let FlexDaoStatisticsEntity = FlexDaoStatistic.load(event.params.daoAddress.toString());
    // if (!FlexDaoStatisticsEntity) {
    //     FlexDaoStatisticsEntity = new FlexDaoStatistic(event.params.daoAddress.toString());
    //     FlexDaoStatisticsEntity.fundRaised = BigInt.fromI64(0);
    //     FlexDaoStatisticsEntity.fundInvestedFromWei = "0";
    //     FlexDaoStatisticsEntity.fundInvested = BigInt.fromI64(0);
    //     FlexDaoStatisticsEntity.fundInvestedFromWei = "0";
    //     FlexDaoStatisticsEntity.fundedVentures = BigInt.fromI64(0);
    //     FlexDaoStatisticsEntity.members = BigInt.fromI64(0);
    //     FlexDaoStatisticsEntity.daoAddr = event.params.daoAddress;
    // }

    // FlexDaoStatisticsEntity.fundRaised = FlexDaoStatisticsEntity.fundRaised.minus(event.params.amount);
    // FlexDaoStatisticsEntity.fundInvestedFromWei = FlexDaoStatisticsEntity.fundRaised.div(BigInt.fromI64(10 ** 18)).toString();


    // FlexDaoStatisticsEntity.save();
}

// export function handleInvestorMembershipCreated(event: InvestorMembershipCreated): void {
//     let flexDaoInvestorMembershipEntity = FlexDaoInvestorMembershipEntity.load(event.params.daoAddress.toHexString() + event.params.name);
//     if (!flexDaoInvestorMembershipEntity) {
//         flexDaoInvestorMembershipEntity = new FlexDaoInvestorMembershipEntity(event.params.daoAddress.toHexString() + event.params.name);
//         const daoContract = DaoRegistry.bind(event.params.daoAddress);

//         const contractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c"));
//         const flexInvestmentPoolAdapterContract = FlexInvestmentPoolAdapterContract.bind(contractAddr);

//         const FLEX_INVESTOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0xfeddffed075d0686e697569ece0ce2fd26bfbbb18719086f36d16c7117edb553"));
//         const rel = flexInvestmentPoolAdapterContract.investorMemberShips(event.params.daoAddress, event.params.hashName);
//         const whitelist = flexInvestmentPoolAdapterContract.getParticipanWhitelist(event.params.daoAddress);
//         let tem: string[] = [];

//         if (whitelist.length > 0) {
//             for (let j = 0; j < whitelist.length; j++) {
//                 tem.push(whitelist[j].toHexString())
//             }
//         }

//         flexDaoInvestorMembershipEntity.enable = FLEX_INVESTOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
//         flexDaoInvestorMembershipEntity.daoAddr = event.params.daoAddress;
//         flexDaoInvestorMembershipEntity.name = event.params.name;
//         flexDaoInvestorMembershipEntity.varifyType = BigInt.fromI32(rel.getVarifyType());
//         flexDaoInvestorMembershipEntity.minHolding = rel.getMinHolding();
//         flexDaoInvestorMembershipEntity.tokenAddress = rel.getTokenAddress();
//         flexDaoInvestorMembershipEntity.tokenId = rel.getTokenId();
//         flexDaoInvestorMembershipEntity.whiteList = tem;
//         flexDaoInvestorMembershipEntity.flexDaoEntity = event.params.daoAddress.toHexString();

//         flexDaoInvestorMembershipEntity.save();

//     }
// }