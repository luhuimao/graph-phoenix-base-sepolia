/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-22 15:32:03
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-16 14:25:56
 */
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import {
    VintageFundRaiseAdapterContract,
    ProposalCreated,
    proposalExecuted
} from "../generated/VintageFundRaiseAdapterContract/VintageFundRaiseAdapterContract"
import { ERC20 } from "../generated/VintageFundRaiseAdapterContract/ERC20";
import {
    VintageFundEstablishmentProposal,
    VintageProposalVoteInfo,
    VintageFundRoundToFundEstablishmentProposalId,
    VintageFundRaiseEntity,
    VintageDaoFeeInfoEntity
} from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    // log.error("proposalId {}", [event.params.proposalId.toHexString()]);

    let entity = VintageFundEstablishmentProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new VintageFundEstablishmentProposal(event.params.proposalId.toHexString())
    }

    let vintageFundRaiseContract = VintageFundRaiseAdapterContract.bind(event.address);
    let proposalInfo = vintageFundRaiseContract.Proposals(event.params.daoAddr,
        event.params.proposalId);
    if (proposalInfo) {
        entity.daoAddr = event.params.daoAddr;
        entity.proposalId = event.params.proposalId;
        entity.proposer = event.transaction.from;
        entity.acceptTokenAddr = proposalInfo.getAcceptTokenAddr();
        entity.fundRaiseTarget = proposalInfo.getAmountInfo().fundRaiseTarget;
        entity.fundRaiseTargetFromWei = entity.fundRaiseTarget.div(BigInt.fromI64(10 ** 18)).toString();
        entity.fundRaiseMaxAmount = proposalInfo.getAmountInfo().fundRaiseMaxAmount;
        entity.fundRaiseMaxAmountFromWei = entity.fundRaiseMaxAmount.div(BigInt.fromI64(10 ** 18)).toString();
        entity.lpMinDepositAmount = proposalInfo.getAmountInfo().lpMinDepositAmount;
        entity.lpMinDepositAmountFromWei = entity.lpMinDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
        entity.lpMaxDepositAmount = proposalInfo.getAmountInfo().lpMaxDepositAmount;
        entity.lpMaxDepositAmountFromWei = entity.lpMaxDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
        entity.fundRaiseStartTime = proposalInfo.getTimesInfo().fundRaiseStartTime;
        entity.fundRaiseEndTime = proposalInfo.getTimesInfo().fundRaiseEndTime;
        entity.fundTerm = proposalInfo.getTimesInfo().fundTerm;
        entity.redemptPeriod = proposalInfo.getTimesInfo().redemptPeriod;
        entity.redemptDuration = proposalInfo.getTimesInfo().redemptDuration;
        entity.returnDuration = proposalInfo.getTimesInfo().refundDuration;
        entity.managementFeeRatio = proposalInfo.getFeeInfo().managementFeeRatio;
        entity.paybackTokenManagementFeeRatio = proposalInfo.getFeeInfo().paybackTokenManagementFeeRatio;
        entity.redepmtFeeRatio = proposalInfo.getFeeInfo().redepmtFeeRatio;
        entity.protocolFeeRatio = proposalInfo.getFeeInfo().protocolFeeRatio;
        entity.managementFeeAddress = proposalInfo.getFeeInfo().managementFeeAddress;
        entity.fundFromInverstor = proposalInfo.getProposerReward().fundFromInverstor;
        entity.projectTokenFromInvestor = proposalInfo.getProposerReward().projectTokenFromInvestor;
        entity.state = BigInt.fromI32(proposalInfo.getState());
        entity.creationTime = proposalInfo.getCreationTime();
        entity.stopVoteTime = proposalInfo.getStopVoteTime();
        entity.fundStartTime = BigInt.fromI32(0);
        entity.fundEndTime = BigInt.fromI32(0);
        entity.totalFund = BigInt.fromI32(0);
        entity.totalFundFromWei = "0";
        entity.fundRaiseType = BigInt.fromI32(proposalInfo.getFundRaiseType());
        entity.fundRaiseTypeInString = proposalInfo.getFundRaiseType() == 0 ? "FCFS" : "Free In";
        entity.priorityDepositEnable = proposalInfo.getPriorityDeposite().enable;
        entity.priorityDepositType = BigInt.fromI32(proposalInfo.getPriorityDeposite().vtype);
        entity.priorityDepositTokenAddress = proposalInfo.getPriorityDeposite().token;
        entity.priorityDepositTokenId = proposalInfo.getPriorityDeposite().tokenId;
        entity.priorityDepositAmount = proposalInfo.getPriorityDeposite().amount;
        if (proposalInfo.getPriorityDeposite().vtype == 3) {
            const whitelist = vintageFundRaiseContract.try_getWhiteList(event.params.daoAddr, event.params.proposalId);
            let tem: string[] = [];
            if (!whitelist.reverted && whitelist.value.length > 0) {
                for (let j = 0; j < whitelist.value.length; j++) {
                    tem.push(whitelist.value[j].toHexString())
                }
            }
            entity.priorityDepositWhiteList = tem;
        }
        entity.vintageDaoEntity = event.params.daoAddr.toHexString();
        entity.executeBlockNum = BigInt.fromI32(0);
        entity.executeHash = Bytes.empty();
        entity.save()

        const erc20 = ERC20.bind(Address.fromBytes(entity.acceptTokenAddr));
        let fundRaiseEntity = new VintageFundRaiseEntity(event.params.proposalId.toHexString());
        const sym = erc20.try_symbol();
        fundRaiseEntity.tokenSymbol = sym.reverted ? "" : sym.value;
        fundRaiseEntity.daoAddr = event.params.daoAddr;
        fundRaiseEntity.fundRaiseProposalId = event.params.proposalId;
        fundRaiseEntity.tokenName = erc20.name();
        fundRaiseEntity.fundNumber = " ";
        fundRaiseEntity.raisedAmount = BigInt.fromI32(0);
        fundRaiseEntity.raisedAmountFromWei = "0";
        fundRaiseEntity.miniGoalAmount = entity.fundRaiseTarget;
        fundRaiseEntity.miniGoalAmountFromWei = entity.fundRaiseTargetFromWei;
        fundRaiseEntity.maxGoalAmount = entity.fundRaiseMaxAmount;
        fundRaiseEntity.maxGoalAmountFromWei = entity.fundRaiseMaxAmountFromWei;
        fundRaiseEntity.fundRaiseState = "";
        fundRaiseEntity.fundRaiseStartTimestamp = entity.fundRaiseStartTime;
        fundRaiseEntity.fundRaiseStartDateTime = new Date(fundRaiseEntity.fundRaiseStartTimestamp.toI64() * 1000).toISOString();
        fundRaiseEntity.fundRaiseEndTimestamp = entity.fundRaiseEndTime;
        fundRaiseEntity.fundRaiseEndDateTime = new Date(fundRaiseEntity.fundRaiseEndTimestamp.toI64() * 1000).toISOString();
        fundRaiseEntity.fundStartTimestamp = BigInt.fromI32(0);
        fundRaiseEntity.fundStartDateTime = "0";
        fundRaiseEntity.fundEndTimestamp = BigInt.fromI32(0);
        fundRaiseEntity.fundEndDateTime = "0";
        fundRaiseEntity.fundInvested = BigInt.fromI32(0);
        fundRaiseEntity.fundInvestedFromWei = "0";
        fundRaiseEntity.fundedVentures = BigInt.fromI32(0);
        fundRaiseEntity.save();
    }
}

export function handleProposalExecuted(event: proposalExecuted): void {
    let entity = VintageFundEstablishmentProposal.load(event.params.proposalId.toHexString())

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
        let fundNumber = BigInt.fromI32(0);
        if (event.params.state == 2) {
            entity.fundStartTime = event.block.timestamp;
            entity.fundEndTime = entity.fundStartTime.plus(entity.fundTerm);

            let vintageFundRaiseContract = VintageFundRaiseAdapterContract.bind(event.address);
            const fundRound = vintageFundRaiseContract.createdFundCounter(event.params.daoAddr);
            fundNumber = fundRound;
            let roundPropossalEntity = new VintageFundRoundToFundEstablishmentProposalId(event.params.daoAddr.toHexString() + fundRound.toString());
            roundPropossalEntity.daoAddr = event.params.daoAddr;
            roundPropossalEntity.fundRound = fundRound;
            roundPropossalEntity.proposalId = event.params.proposalId;
            roundPropossalEntity.save();

            let vintageDaoFeeInfoEntity = VintageDaoFeeInfoEntity.load(event.params.daoAddr.toHexString());
            if (!vintageDaoFeeInfoEntity) {
                vintageDaoFeeInfoEntity = new VintageDaoFeeInfoEntity(event.params.daoAddr.toHexString());
                vintageDaoFeeInfoEntity.daoAddr = event.params.daoAddr;
                vintageDaoFeeInfoEntity.vintageDaoEntity = event.params.daoAddr.toHexString();
            }
            vintageDaoFeeInfoEntity.feeReceiver = entity.managementFeeAddress;
            vintageDaoFeeInfoEntity.managementFee = entity.managementFeeRatio;
            vintageDaoFeeInfoEntity.payTokenManagementFee = entity.paybackTokenManagementFeeRatio;
            vintageDaoFeeInfoEntity.proposerPaybackTokenReward = entity.projectTokenFromInvestor;
            vintageDaoFeeInfoEntity.proposerReward = entity.fundFromInverstor;
            vintageDaoFeeInfoEntity.redemptionFee = entity.redepmtFeeRatio;
            vintageDaoFeeInfoEntity.save();
        }
        entity.executeHash = event.transaction.hash;
        entity.save();

        let fundRaiseEntity = VintageFundRaiseEntity.load(event.params.proposalId.toHexString());
        if (fundRaiseEntity) {
            fundRaiseEntity.fundStartTimestamp = event.block.timestamp;
            fundRaiseEntity.fundStartDateTime = new Date(fundRaiseEntity.fundStartTimestamp.toI64() * 1000).toISOString();
            fundRaiseEntity.fundEndTimestamp = entity.fundEndTime;
            fundRaiseEntity.fundEndDateTime = new Date(fundRaiseEntity.fundEndTimestamp.toI64() * 1000).toISOString();
            fundRaiseEntity.fundNumber = "FundEstablishment#" + fundNumber.toString();
            fundRaiseEntity.save();
        }
    }

    let voteInfoEntity = VintageProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}
