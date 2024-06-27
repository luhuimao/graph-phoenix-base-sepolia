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
    EscrowFund as EscrowFundEvent,
    WithDraw as WithDrawEvent,
    CollectiveEscrowFundAdapterContract
} from "../generated/CollectiveEscrowFundAdapterContract/CollectiveEscrowFundAdapterContract";
import { ColletiveFundingPoolAdapterContract } from "../generated/CollectiveEscrowFundAdapterContract/ColletiveFundingPoolAdapterContract";
import { ColletiveFundRaiseProposalAdapterContract } from "../generated/CollectiveEscrowFundAdapterContract/ColletiveFundRaiseProposalAdapterContract";
import { CollectiveInvestmentPoolExtension } from "../generated/CollectiveEscrowFundAdapterContract/CollectiveInvestmentPoolExtension";
import { DaoRegistry } from "../generated/VintageEscrowFundAdapterContract/DaoRegistry";
import {
    CollectiveEscrowFundEntity,
    CollectiveFundRaiseProposalEntity,
    // VintageFundRoundStatistic,
    VintageInvestorInvestmentEntity,
    VintageInvestorRedemptionsInFundRoundEntity
} from "../generated/schema"


export function handleWithDraw(event: WithDrawEvent): void {
    let entity = CollectiveEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString());
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

export function handleEscrowFund(event: EscrowFundEvent): void {
    const escrowContr = CollectiveEscrowFundAdapterContract.bind(event.address);
    let entity = CollectiveEscrowFundEntity.load(event.params.dao.toHexString() + event.params.account.toHexString());
    const dao = DaoRegistry.bind(event.params.dao);

    // const collectiveFundRaiseProposalAdapterContractAddr = dao.getAdapterAddress(Bytes.fromHexString("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b"));
    // const collectiveFundRaiseProposalAdapterContract = ColletiveFundRaiseProposalAdapterContract.bind(collectiveFundRaiseProposalAdapterContractAddr);

    // const fundRaiseProposalId = collectiveFundRaiseProposalAdapterContract.lastProposalIds(event.params.dao);
    // collectiveFundRaiseProposalAdapterContract.proposals(event.params.dao, fundRaiseProposalId);

    const collectiveFundingPoolAdapterContractAddr = dao.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);
    const fundRaiseState = collectiveFundingPoolAdapterContract.fundState(event.params.dao)
    // const fundingPoolExtAddress = dao.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"));
    // const collectiveFundingPoolExt = CollectiveInvestmentPoolExtension.bind(fundingPoolExtAddress);

    // daoAddr: Bytes! # address
    // fundEstablishmentProposalId: Bytes! # bytes32
    // token: Bytes! # address
    // createTimeStamp: BigInt! # uint256
    // createDateTime: String!
    // amount: BigInt! # uint256
    // amountFromWei: String!
    // account: Bytes! # address
    // fundRound: BigInt! # uint256
    // withdrawTimeStamp: BigInt! # uint256
    // withdrawDateTime: String!
    // withdrawTxHash: Bytes! # address
    // minFundGoal: BigInt! # uint256
    // minFundGoalFromWei: String!
    // finalRaised: BigInt! # uint256
    // finalRaisedFromWei: String!
    // fundRaisedSucceed: Boolean!
    // succeedFundRound: BigInt! # uint256
    // myRedemptionAmount: BigInt
    // myInvestmentAmount: BigInt
    // myWithdraw: BigInt!
    // myConfirmedDepositAmount: BigInt!
    // escrowBlockNum: BigInt


    if (!entity) {
        entity = new CollectiveEscrowFundEntity(event.params.dao.toHexString() + event.params.account.toHexString());
    }

    entity.myWithdraw = BigInt.fromI32(0);
    entity.daoAddr = event.params.dao;
    entity.account = event.params.account;
    entity.createTimeStamp = event.block.timestamp;
    entity.createDateTime = new Date(entity.createTimeStamp.toI64() * 1000).toISOString();
    entity.fundEstablishmentProposalId = Bytes.empty();
    entity.fundRound = BigInt.fromI32(0);
    entity.token = event.params.token;
    entity.withdrawTimeStamp = BigInt.fromI32(0);
    entity.withdrawDateTime = "0";
    const rel = escrowContr.try_escrowFunds(event.params.dao, event.params.token, event.params.account);
    entity.amount = BigInt.fromI32(0);
    if (!rel.reverted) entity.amount = rel.value;
    entity.amountFromWei = entity.amount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.withdrawTxHash = Bytes.empty();
    entity.minFundGoal = BigInt.fromI32(0);
    entity.minFundGoalFromWei = entity.minFundGoal.div(BigInt.fromI64(10 ** 18)).toString();
    entity.finalRaised = BigInt.fromI32(0);
    entity.finalRaisedFromWei = entity.finalRaised.div(BigInt.fromI64(10 ** 18)).toString();
    entity.succeedFundRound = BigInt.fromI32(0);
    entity.escrowBlockNum = event.block.number;
    // let rel = collectiveFundingPoolExt.try_getPriorAmount(event.params.account, event.params.token, newFundExeBlockNum.plus(BigInt.fromI32(1)));
    entity.myConfirmedDepositAmount = BigInt.fromI32(0);
    entity.myInvestmentAmount = BigInt.fromI32(0);
    entity.myRedemptionAmount = BigInt.fromI32(0);
    entity.fundRaisedSucceed = fundRaiseState == 2 ? true : false;
    entity.succeedFundRound = BigInt.fromI32(0);
    entity.save();
}