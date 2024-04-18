/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-22 15:32:03
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-07 13:35:12
 */
import { BigInt, Bytes, Address, bigInt } from "@graphprotocol/graph-ts";
// import { toUtf8 } from "web3-utils";
import {
    FlexFundingAdapterContract,
    ProposalCreated,
    ProposalExecuted
} from "../generated/FlexFundingAdapterContract/FlexFundingAdapterContract"
import { DaoRegistry } from "../generated/FlexFundingAdapterContract/DaoRegistry";
// import { DaoFactory } from "../generated/DaoFactory/DaoFactory";
import { FlexInvestmentPoolAdapterContract } from "../generated/FlexInvestmentPoolAdapterContract/FlexInvestmentPoolAdapterContract";

import { FlexInvestmentProposal, FlexDaoStatistic } from "../generated/schema"
// import { encodeBase58 } from "ethers";

export function handleProposalCreated(event: ProposalCreated): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let entity = FlexInvestmentProposal.load(event.params.proposalId.toHexString())


    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new FlexInvestmentProposal(event.params.proposalId.toHexString())
    }

    // BigInt and BigDecimal math are supported
    // entity.count = entity.count + BigInt.fromI32(1)
    let flexFundingContract = FlexFundingAdapterContract.bind(event.address);
    let proposalInfo = flexFundingContract.Proposals((event.params.daoAddress),
        event.params.proposalId);

    // Entity fields can be set based on event parameters
    entity.proposalId = event.params.proposalId
    entity.daoAddress = event.params.daoAddress;
    entity.proposer = event.params.proposer;
    entity.tokenAddress = proposalInfo.getInvestmentInfo().tokenAddress;
    entity.minInvestmentAmount = proposalInfo.getInvestmentInfo().minInvestmentAmount;
    entity.maxInvestmentAmount = proposalInfo.getInvestmentInfo().maxInvestmentAmount;
    entity.minInvestmentAmountFromWei = entity.minInvestmentAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.maxInvestmentAmountFromWei = entity.maxInvestmentAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.escrow = proposalInfo.getInvestmentInfo().escrow;
    entity.paybackTokenAddr = proposalInfo.getInvestmentInfo().paybackTokenAddr;
    entity.paybackTokenAmount = proposalInfo.getInvestmentInfo().paybackTokenAmount;
    entity.paybackTokenAmountFromWei = entity.paybackTokenAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.price = proposalInfo.getInvestmentInfo().price;
    entity.minReturnAmount = proposalInfo.getInvestmentInfo().minReturnAmount;
    entity.maxReturnAmount = proposalInfo.getInvestmentInfo().maxReturnAmount.plus(BigInt.fromI32(10000));
    entity.minReturnAmountFromWei = entity.minReturnAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.maxReturnAmountFromWei = entity.maxReturnAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.approverAddr = proposalInfo.getInvestmentInfo().approverAddr;
    entity.recipientAddr = proposalInfo.getInvestmentInfo().recipientAddr;
    entity.vestingStartTime = proposalInfo.getVestInfo().vestingStartTime;
    entity.vestingCliffEndTime = proposalInfo.getVestInfo().vestingCliffEndTime;
    entity.vestingEndTime = proposalInfo.getVestInfo().vestingEndTime;
    entity.vestingInterval = proposalInfo.getVestInfo().vestingInterval;
    entity.vestingCliffLockAmount = proposalInfo.getVestInfo().vestingCliffLockAmount;
    entity.vestingERC721 = proposalInfo.getVestInfo().erc721;
    entity.vestingNFTEnable = proposalInfo.getVestInfo().nftEnable;
    entity.vestingName = proposalInfo.getVestInfo().vestName;
    entity.vestingDescription = proposalInfo.getVestInfo().vestDescription;

    entity.fundRaiseType = BigInt.fromI32(proposalInfo.getFundRaiseInfo().fundRaiseType);
    entity.fundRaiseStartTime = proposalInfo.getFundRaiseInfo().fundRaiseStartTime;
    entity.fundRaiseEndTime = proposalInfo.getFundRaiseInfo().fundRaiseEndTime;
    entity.fundRaiseStartTimeString = new Date(entity.fundRaiseStartTime.toI64() * 1000).toISOString();
    entity.fundRaiseEndTimeString = new Date(entity.fundRaiseEndTime.toI64() * 1000).toISOString();
    entity.minDepositAmount = proposalInfo.getFundRaiseInfo().minDepositAmount;
    entity.maxDepositAmount = proposalInfo.getFundRaiseInfo().maxDepositAmount;
    entity.minDepositAmountFromWei = entity.minDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.maxDepositAmountFromWei = entity.maxDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.investorIdentification = proposalInfo.getFundRaiseInfo().investorIdentification;
    entity.bType = BigInt.fromI32(proposalInfo.getFundRaiseInfo().investorIdentificationInfo.bType);
    entity.bChainId = proposalInfo.getFundRaiseInfo().investorIdentificationInfo.bChainId;
    entity.bTokanAddr = proposalInfo.getFundRaiseInfo().investorIdentificationInfo.bTokanAddr;
    entity.bTokenId = proposalInfo.getFundRaiseInfo().investorIdentificationInfo.bTokenId;
    entity.bMinHoldingAmount = proposalInfo.getFundRaiseInfo().investorIdentificationInfo.bMinHoldingAmount;
    entity.priorityDepositEnalbe = proposalInfo.getFundRaiseInfo().priorityDepositInfo.enable;
    entity.priorityDepositType = BigInt.fromI32(proposalInfo.getFundRaiseInfo().priorityDepositInfo.pType);
    entity.priorityDepositTokenAddr = proposalInfo.getFundRaiseInfo().priorityDepositInfo.token;
    entity.priorityDepositTokenId = proposalInfo.getFundRaiseInfo().priorityDepositInfo.tokenId;
    entity.priorityDepositAmount = proposalInfo.getFundRaiseInfo().priorityDepositInfo.amount;
    if (proposalInfo.getFundRaiseInfo().priorityDepositInfo.pType == 3) {
        const whitelist = flexFundingContract.try_getPriorityDepositedWhitelist(event.params.daoAddress, event.params.proposalId);
        let tem: string[] = [];
        if (!whitelist.reverted && whitelist.value.length > 0) {
            for (let j = 0; j < whitelist.value.length; j++) {
                tem.push(whitelist.value[j].toHexString())
            }
        }
        entity.priorityDepositWhiteList = tem;
    }
    entity.tokenRewardAmount = proposalInfo.getProposerRewardInfo().tokenRewardAmount;
    entity.cashRewardAmount = proposalInfo.getProposerRewardInfo().cashRewardAmount;
    entity.startVoteTime = proposalInfo.getStartVoteTime();
    entity.stopVoteTime = proposalInfo.getStopVoteTime();
    entity.state = BigInt.fromI32(proposalInfo.getState());
    entity.creationTime = event.block.timestamp;
    entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.stopVoteTimeString = new Date(proposalInfo.getStopVoteTime().toI64() * 1000).toISOString();
    entity.totalFund = BigInt.fromI32(0);
    entity.totalFundFromWei = "0";
    entity.investors = [];
    entity.executeHash = Bytes.empty();
    entity.ultimateInvestedFund = BigInt.fromI32(0);
    entity.flexDaoEntity = event.params.daoAddress.toHexString();
    // Entities can be written to the store with `.save()`
    entity.save();
}

export function handleproposalExecuted(event: ProposalExecuted): void {
    let entity = FlexInvestmentProposal.load(event.params.proposalId.toHexString())
    let flexFundingContract = FlexFundingAdapterContract.bind(event.address);
    let proposalInfo = flexFundingContract.Proposals((event.params.daoAddress),
        event.params.proposalId);
    const daoContract = DaoRegistry.bind(event.params.daoAddress);

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);

        let flexFundingContract = FlexFundingAdapterContract.bind(event.address);
        let proposalInfo = flexFundingContract.Proposals((event.params.daoAddress),
            event.params.proposalId);

        entity.paybackTokenAmount = proposalInfo.getInvestmentInfo().paybackTokenAmount;
        entity.paybackTokenAmountFromWei = entity.paybackTokenAmount.div(BigInt.fromI64(10 ** 18)).toString();
        entity.executeHash = event.transaction.hash;

        if (entity.state == BigInt.fromI32(3)) {
            entity.totalFund = proposalInfo.getInvestmentInfo().finalRaisedAmount;
            const protocolFee =
                (entity.totalFund.times(flexFundingContract.protocolFee())).div(
                    BigInt.fromI64(10 ** 18));

            const managementFeeAmount = daoContract.getConfiguration(
                Bytes.fromHexString("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87")
            );
            const managementFeeType = daoContract.getConfiguration(
                Bytes.fromHexString("0xda34ff95e06cbf2c9c32a559cd8aadd1a10104596417d62c03db2c1258df83d3")
            );

            const managementFee = managementFeeType == BigInt.fromI32(0)
                ? (entity.totalFund.times(
                    managementFeeAmount)
                ).div(BigInt.fromI64(10 ** 18))
                : managementFeeAmount; // type 0:percentage of fund pool  type 1: fixed amount
            const proposerReward =
                (entity.totalFund.times(
                    proposalInfo.getProposerRewardInfo().cashRewardAmount)).div(BigInt.fromI64(10 ** 18))
                ;
            entity.ultimateInvestedFund = entity.totalFund.minus(protocolFee.plus(managementFee).plus(proposerReward));
            let FlexDaoStatisticsEntity = FlexDaoStatistic.load(event.params.daoAddress.toHexString());
            if (!FlexDaoStatisticsEntity) {
                FlexDaoStatisticsEntity = new FlexDaoStatistic(event.params.daoAddress.toHexString());

                FlexDaoStatisticsEntity.fundRaised = BigInt.fromI64(0);
                FlexDaoStatisticsEntity.fundRaisedFromWei = "0";
                FlexDaoStatisticsEntity.fundInvested = BigInt.fromI64(0);
                FlexDaoStatisticsEntity.fundInvestedFromWei = "0";
                FlexDaoStatisticsEntity.fundedVentures = BigInt.fromI64(0);
                FlexDaoStatisticsEntity.members = BigInt.fromI64(0);
                FlexDaoStatisticsEntity.daoAddr = event.params.daoAddress;
            }
            FlexDaoStatisticsEntity.fundInvested = FlexDaoStatisticsEntity.fundInvested.plus(entity.totalFund);
            FlexDaoStatisticsEntity.fundInvestedFromWei = FlexDaoStatisticsEntity.fundInvested.div(BigInt.fromI64(10 ** 18)).toString();
            FlexDaoStatisticsEntity.fundedVentures = FlexDaoStatisticsEntity.fundedVentures.plus(BigInt.fromI32(1));

            const flexFundingPoolAdaptAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c"));
            const flexFundingPoolAdapt = FlexInvestmentPoolAdapterContract.bind(flexFundingPoolAdaptAddr);

            const raiseAmount = flexFundingPoolAdapt.getTotalFundByProposalId(event.params.daoAddress, event.params.proposalId);


            FlexDaoStatisticsEntity.fundRaised = FlexDaoStatisticsEntity.fundRaised.plus(raiseAmount);
            FlexDaoStatisticsEntity.fundRaisedFromWei = FlexDaoStatisticsEntity.fundRaised.div(BigInt.fromI64(10 ** 18)).toString();

            FlexDaoStatisticsEntity.save();
        }

        entity.save();

    }
}
