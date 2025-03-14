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
import { ERC20 } from "../generated/ColletiveFundingPoolAdapterContract/ERC20";
import {
    // CollectiveRedempteEntity,
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
    // CollectiveEscrowFundEntity,
    CollectiveFundRaisedEntity
} from "../generated/schema"

export function handleDeposit(event: Deposit): void {
    const daoContract = DaoRegistry.bind(event.params.daoAddress);

    const collectiveNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b"));
    const collectiveNewFundCont = ColletiveFundRaiseProposalAdapterContract.bind(collectiveNewFundContAddr);
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = CollectiveInvestorActivity.load(event.transaction.hash.toHex())
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand

    const fundRaiseProposalId = collectiveNewFundCont.lastProposalIds(event.params.daoAddress);

    if (!entity) {
        entity = new CollectiveInvestorActivity(event.transaction.hash.toHex());
        const rel = collectiveNewFundCont.try_lastProposalIds(event.params.daoAddress)
        entity.proposalId = rel.reverted ? Bytes.empty() : rel.value;
    }
    let decimals = 0;
    let fundRaiseProposalEntity = CollectiveFundRaiseProposalEntity.load(fundRaiseProposalId.toHexString());
    if (fundRaiseProposalEntity)
        decimals = ERC20.bind(Address.fromBytes(fundRaiseProposalEntity.acceptTokenAddr)).decimals();
    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.daoAddr = event.params.daoAddress;
    entity.account = event.params.account;
    entity.type = "deposit";
    entity.amount = event.params.amount;
    entity.amountFromWei = event.params.amount.div(BigInt.fromI64(10 ** decimals)).toString();
    entity.timeStamp = event.block.timestamp;
    entity.timeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();

    // Entities can be written to the store with `.save()`
    entity.save()


    let collectiveInvestorBalance = CollectiveInvestorBalance.load(event.params.daoAddress.toHexString() + fundRaiseProposalId.toHexString() + event.params.account.toHexString());

    if (!collectiveInvestorBalance) {
        collectiveInvestorBalance = new CollectiveInvestorBalance(event.params.daoAddress.toHexString() + fundRaiseProposalId.toHexString() + event.params.account.toHexString());
        collectiveInvestorBalance.daoAddr = event.params.daoAddress;
        collectiveInvestorBalance.account = event.params.account;
        collectiveInvestorBalance.fundEstablishmentProposalId = fundRaiseProposalId;
        collectiveInvestorBalance.balance = BigInt.zero();

        let fundId = BigInt.zero();
        if (fundRaiseProposalEntity) {
            fundId = fundRaiseProposalEntity.fundRaiseId;
        }
        collectiveInvestorBalance.fundId = fundId;
    }
    collectiveInvestorBalance.balance = collectiveInvestorBalance.balance.plus(event.params.amount);
    collectiveInvestorBalance.balanceFromWei = collectiveInvestorBalance.balance.div(BigInt.fromI64(10 ** decimals)).toString();

    collectiveInvestorBalance.save();
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
        entity = new CollectiveInvestorActivity(event.transaction.hash.toHex());
        entity.proposalId = Bytes.empty();
    }

    const daoContract = DaoRegistry.bind(event.params.daoAddress);
    const collectiveNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b"));
    const collectiveNewFundCont = ColletiveFundRaiseProposalAdapterContract.bind(collectiveNewFundContAddr);
    const fundRaiseProposalId = collectiveNewFundCont.lastProposalIds(event.params.daoAddress);
    let fundRaiseProposalEntity = CollectiveFundRaiseProposalEntity.load(fundRaiseProposalId.toHexString());
    let decimals = 0;
    if (fundRaiseProposalEntity)
        decimals = ERC20.bind(Address.fromBytes(fundRaiseProposalEntity.acceptTokenAddr)).decimals();

    // Entity fields can be set based on event parameters
    entity.txHash = event.transaction.hash;
    entity.daoAddr = event.params.daoAddress;
    entity.account = event.params.account;
    entity.type = "withdraw";
    entity.amount = event.params.amount;
    entity.amountFromWei = event.params.amount.div(BigInt.fromI64(10 ** decimals)).toString();
    entity.timeStamp = event.block.timestamp;
    entity.timeString = new Date(event.block.timestamp.toI64() * 1000).toISOString();

    // Entities can be written to the store with `.save()`
    entity.save();

    const fundRaiseStartTime = daoContract.getConfiguration(Bytes.fromHexString("0xbd04d44792b7dbfe3b50b0f9f2006f7ef449e374a39021cb9bfa7cd0bdd850d7"));
    const fundRaiseEnTime = daoContract.getConfiguration(Bytes.fromHexString("0x533afc15b6312917b5e28e2272ea69d44e5ea8e00d3bd57cada1275c2f14c9e8"));

    if (event.block.timestamp.gt(fundRaiseStartTime) && event.block.timestamp.lt(fundRaiseEnTime)) {
        let collectiveInvestorBalance = CollectiveInvestorBalance.load(event.params.daoAddress.toHexString() + fundRaiseProposalId.toHexString() + event.params.account.toHexString());

        if (collectiveInvestorBalance) {
            collectiveInvestorBalance.balance = collectiveInvestorBalance.balance.minus(event.params.amount);
            collectiveInvestorBalance.balanceFromWei = collectiveInvestorBalance.balance.div(BigInt.fromI64(10 ** decimals)).toString();

            collectiveInvestorBalance.save();
        }
    }

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

}

export function handleProcessFundRaise(event: ProcessFundRaise): void {
    const fundingPoolAdapt = ColletiveFundingPoolAdapterContract.bind(event.address);
    const daoContract = DaoRegistry.bind(event.params.daoAddress);
    const fundingPoolExtAddress = daoContract.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"));
    const fundingPoolExtContr = CollectiveInvestmentPoolExtension.bind(fundingPoolExtAddress);

    const COLLECTIVE_FUNDRAISE_STYLE = daoContract.getConfiguration(Bytes.fromHexString("0xf301d5aec67a9d816d38f9b645cac1e79a3308ff9803564bbe63a862db82f46b"));
    const FUND_RAISING_MAX = daoContract.getConfiguration(Bytes.fromHexString("0x7e07fb4530796d057ca1d76d83f47aa8629dbb7e942ac28f30ad6f5e9e8d4189"));

    const collectiveNewFundContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b"));
    const collectiveNewFundCont = ColletiveFundRaiseProposalAdapterContract.bind(collectiveNewFundContAddr);
    const fundRaiseProposalId = collectiveNewFundCont.lastProposalIds(event.params.daoAddress)
    let fundRaiseProposalEntity = CollectiveFundRaiseProposalEntity.load(fundRaiseProposalId.toHexString());

    const fundRaisedState = fundingPoolAdapt.fundState(event.params.daoAddress);
    let successedFundCounter = CollectiveSucceedFundCounter.load(event.params.daoAddress.toString());
    if (!successedFundCounter) {
        successedFundCounter = new CollectiveSucceedFundCounter(event.params.daoAddress.toString());
        successedFundCounter.daoAddr = event.params.daoAddress;
        successedFundCounter.counter = BigInt.fromI32(0);
    }
    let decimals = 0;
    let fundRaisedAmount = fundingPoolAdapt.fundRaisedByProposalId(event.params.daoAddress, fundRaiseProposalId);
    if (fundRaiseProposalEntity) {
        const erc20 = ERC20.bind(Address.fromBytes(fundRaiseProposalEntity.acceptTokenAddr));
        decimals = erc20.decimals();
        const tokenName = erc20.name();
        const tokenSymbol = erc20.symbol();
        // fundRaisedState == 2 ? fundRaiseProposalEntity.state = BigInt.fromI32(3) : fundRaiseProposalEntity.state = BigInt.fromI32(4);
        if (fundRaisedState == 2) {
            fundRaiseProposalEntity.state = BigInt.fromI32(3);

            if (COLLECTIVE_FUNDRAISE_STYLE == BigInt.fromI32(1) && fundRaisedAmount > FUND_RAISING_MAX) {//free in 
                fundRaisedAmount = FUND_RAISING_MAX;
            }

            let collectiveFundRaisedEntity = CollectiveFundRaisedEntity.load(event.params.daoAddress.toHexString() + fundRaiseProposalEntity.acceptTokenAddr.toHexString());
            if (!collectiveFundRaisedEntity) {
                collectiveFundRaisedEntity = new CollectiveFundRaisedEntity(event.params.daoAddress.toHexString() + fundRaiseProposalEntity.acceptTokenAddr.toHexString());
                collectiveFundRaisedEntity.daoAddr = event.params.daoAddress;
                collectiveFundRaisedEntity.tokenAddress = fundRaiseProposalEntity.acceptTokenAddr;
                collectiveFundRaisedEntity.raisedAmount = BigInt.zero();
                collectiveFundRaisedEntity.tokenName = tokenName;
                collectiveFundRaisedEntity.tokenSymbol = tokenSymbol;
                collectiveFundRaisedEntity.tokenDecimals = BigInt.fromI32(decimals);
                collectiveFundRaisedEntity.investedAmount = BigInt.zero();
                collectiveFundRaisedEntity.investedAmountFromWei = "";
            }

            collectiveFundRaisedEntity.raisedAmount = collectiveFundRaisedEntity.raisedAmount.plus(fundRaisedAmount);
            collectiveFundRaisedEntity.raisedAmountFromWei = collectiveFundRaisedEntity.raisedAmount.div(BigInt.fromI64(10 ** (decimals > 0 ? decimals : 1))).toString();
            collectiveFundRaisedEntity.save();
        } else {
            fundRaiseProposalEntity.state = BigInt.fromI32(4);
            fundRaiseProposalEntity.failedReason = "FundRaisingFailed";
        }
        fundRaiseProposalEntity.totalFund = fundRaisedAmount.gt(fundRaiseProposalEntity.fundRaiseMaxAmount) ? fundRaiseProposalEntity.fundRaiseMaxAmount : fundRaisedAmount;
        fundRaiseProposalEntity.totalFundFromWei = fundRaiseProposalEntity.totalFund.div(BigInt.fromI64(10 ** (decimals > 0 ? decimals : 1))).toString();
        fundRaiseProposalEntity.save();
    }

    const totoalRaised = event.params.totalRaised;

    if (fundRaisedState == 2) {
        successedFundCounter.counter = successedFundCounter.counter.plus(BigInt.fromI32(1));

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

        if (COLLECTIVE_FUNDRAISE_STYLE == BigInt.fromI32(1) && fundRaisedAmount > FUND_RAISING_MAX) {//free in 
            fundRaisedAmount = FUND_RAISING_MAX;
        }

        collectiveDaoStatisticEntity.fundRaised = collectiveDaoStatisticEntity.fundRaised.plus(fundRaisedAmount);
        collectiveDaoStatisticEntity.fundRaisedFromWei = collectiveDaoStatisticEntity.fundRaised.div(BigInt.fromI64(10 ** decimals)).toString();
        collectiveDaoStatisticEntity.save();
    }
    successedFundCounter.save();
}