/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-22 15:32:03
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-07 13:35:12
 */
import { BigInt, Bytes, Address, bigInt, } from "@graphprotocol/graph-ts";
// import { toUtf8 } from "web3-utils";
import {
    FlexFundingAdapterContract,
    ProposalCreated,
    ProposalExecuted
} from "../generated/FlexFundingAdapterContract/FlexFundingAdapterContract";
import { FlexInvestmentPoolExtension } from "../generated/FlexFundingAdapterContract/FlexInvestmentPoolExtension";
import { DaoRegistry } from "../generated/FlexFundingAdapterContract/DaoRegistry";
// import { DaoFactory } from "../generated/DaoFactory/DaoFactory";
import { FlexInvestmentPoolAdapterContract } from "../generated/FlexInvestmentPoolAdapterContract/FlexInvestmentPoolAdapterContract";

import {
    FlexInvestmentProposal,
    FlexDaoStatistic,
    FlexInvestorPortfoliosEntity,
    InvestmentProposalInvestorEntity
} from "../generated/schema"
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
    const fundingPoolExtContrAddress = daoContract.getExtensionAddress(Bytes.fromHexString("0xb12a3847d47fefceb164b75823af125f9aa82b76938df0ddf08c04cd314ba37c"));
    const fundingPoolExtContr = FlexInvestmentPoolExtension.bind(fundingPoolExtContrAddress);
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);

        // let flexFundingContract = FlexFundingAdapterContract.bind(event.address);
        // let proposalInfo = flexFundingContract.Proposals((event.params.daoAddress),
        //     event.params.proposalId);

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
            const rel = fundingPoolExtContr.try_getInvestorsByProposalId(event.params.proposalId);
            if (entity.investors.length > 0) {
                // FlexDaoStatisticsEntity.members = FlexDaoStatisticsEntity.members.plus(BigInt.fromI32(rel.value.length));

                for (let j = 0; j < entity.investors.length; j++) {
                    const investor = entity.investors[j];
                    let p = new FlexInvestorPortfoliosEntity(event.params.proposalId.toHexString() + investor);
                    p.account = Bytes.fromHexString(investor);
                    p.daoAddr = event.params.daoAddress;
                    p.timeStamp = event.block.timestamp;
                    p.investmentProposalId = event.params.proposalId;
                    p.investmentCurrency = entity.tokenAddress;

                    const bal1 = fundingPoolExtContr.balanceOf(event.params.proposalId, Address.fromBytes(Bytes.fromHexString(investor)));
                    const bal2 = fundingPoolExtContr.try_getPriorAmount(event.params.proposalId,
                        Address.fromBytes(Bytes.fromHexString(investor)),
                        event.block.number.minus(BigInt.fromI32(1)));


                    const myInvestedAmount = !bal2.reverted ? bal2.value.minus(bal1) : BigInt.zero();
                    p.investedAmount = myInvestedAmount;
                    p.investedAmountFromWei = p.investedAmount.div(BigInt.fromI64(10 ** 18)).toString();
                    p.save();
                }

            }

            FlexDaoStatisticsEntity.members = FlexDaoStatisticsEntity.members.plus(BigInt.fromI32(entity.investors.length));

            FlexDaoStatisticsEntity.fundInvested = FlexDaoStatisticsEntity.fundInvested.plus(entity.ultimateInvestedFund);
            FlexDaoStatisticsEntity.fundInvestedFromWei = FlexDaoStatisticsEntity.fundInvested.div(BigInt.fromI64(10 ** 18)).toString();
            FlexDaoStatisticsEntity.fundedVentures = FlexDaoStatisticsEntity.fundedVentures.plus(BigInt.fromI32(1));

            const totalBeforeExe = fundingPoolExtContr.getPriorAmount(
                event.params.proposalId,
                Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000baBe")),
                event.block.number.minus(BigInt.fromI32(1)));


            if (proposalInfo.getFundRaiseInfo().fundRaiseType == 1) {
                FlexDaoStatisticsEntity.fundRaised = FlexDaoStatisticsEntity.fundRaised.plus(totalBeforeExe);
            } else {
                FlexDaoStatisticsEntity.fundRaised = FlexDaoStatisticsEntity.fundRaised.plus(entity.totalFund);

            }
            FlexDaoStatisticsEntity.fundRaisedFromWei = FlexDaoStatisticsEntity.fundRaised.div(BigInt.fromI64(10 ** 18)).toString();

            FlexDaoStatisticsEntity.save();

            const finalInvestors = new InvestmentProposalInvestorEntity(event.params.proposalId.toHexString());
            finalInvestors.daoAddr = event.params.daoAddress;
            finalInvestors.proposalId = event.params.proposalId;
            finalInvestors.mode = "flex";

            let tem: string[] = [];
            let tem1: BigInt[] = [];

            if (event.params.investors.length > 0) {
                const totalInvestedAmount = fundingPoolExtContr.try_getPriorAmount(
                    event.params.proposalId,
                    Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000baBe")),
                    event.block.number.minus(BigInt.fromI32(1))
                );
                for (let j = 0; j < event.params.investors.length; j++) {
                    tem.push(event.params.investors[j].toHexString())

                    const myInvestedAmount = fundingPoolExtContr.try_getPriorAmount(
                        event.params.proposalId,
                        event.params.investors[j],
                        event.block.number.minus(BigInt.fromI32(1))
                    );
                    const myShare = (!totalInvestedAmount.reverted && !myInvestedAmount.reverted) ?
                        myInvestedAmount.value.times(BigInt.fromI64(10 ** 18)).div(totalInvestedAmount.value) : BigInt.zero();
                    tem1.push(myShare);
                }
            }
            finalInvestors.investors = tem;
            finalInvestors.shares = tem1;

            finalInvestors.save();
        }

        entity.save();

    }
}
