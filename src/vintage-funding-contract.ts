/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-16 17:00:56
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-08-17 14:49:01
 */
import {
    ProposalCreated as ProposalCreatedEvent,
    ProposalExecuted as ProposalExecutedEvent,
    StartVote as handleStartVoteEvent,
    VintageFundingAdapterContract
} from "../generated/VintageFundingAdapterContract/VintageFundingAdapterContract";
import { VintageFundRaiseAdapterContract } from "../generated/VintageFundRaiseAdapterContract/VintageFundRaiseAdapterContract";
import { VintageFundingPoolAdapterContract } from "../generated/VintageFundingAdapterContract/VintageFundingPoolAdapterContract";
import { DaoRegistry } from "../generated/VintageFundingAdapterContract/DaoRegistry";
import { VintageFundingPoolExtension } from "../generated/VintageFundingAdapterContract/VintageFundingPoolExtension";
import {
    VintageFundingProposalInfo,
    VintageFundRoundToNewFundProposalId,
    VintageDaoStatistic,
    VintageProposalVoteInfo,
    VintageFundRoundStatistic,
    VintageFundRaiseEntity,
    VintageEscrowFundEntity,
    VintageInvestorInvestmentEntity,
    VintageSuccessedFundCounter
} from "../generated/schema"
import { bigInt, BigInt, Bytes, Address, log } from "@graphprotocol/graph-ts"

export function handleProposalCreated(event: ProposalCreatedEvent): void {

    let entity = VintageFundingProposalInfo.load(event.params.proposalId.toHexString())

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
        entity = new VintageFundingProposalInfo(event.params.proposalId.toHexString())
        // Entity fields can be set using simple assignments
        // entity.count = BigInt.fromI32(0)
    }

    let vintageFundingContract = VintageFundingAdapterContract.bind(event.address);
    const vintageFundingProposalInfo = vintageFundingContract.
        proposals(event.params.daoAddr,
            event.params.proposalId);
    entity.proposalId = event.params.proposalId
    entity.daoAddress = event.params.daoAddr;
    entity.state = BigInt.fromI32(0);
    entity.escrow = vintageFundingProposalInfo.getProposalPaybackTokenInfo().escrow;
    entity.approverAddr = vintageFundingProposalInfo.getProposalPaybackTokenInfo().approveOwnerAddr;
    entity.minDepositAmount = BigInt.fromI32(0);
    entity.minDepositAmountFromWei = entity.minDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.maxDepositAmount = BigInt.fromI32(0);
    entity.maxDepositAmountFromWei = entity.maxDepositAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.fundingToken = vintageFundingProposalInfo.getInvestmentToken();
    entity.fundingAmount = vintageFundingProposalInfo.getInvestmentAmount();
    entity.fundingAmountFromWei = entity.fundingAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.totalAmount = vintageFundingProposalInfo.getTotalAmount();
    entity.totalAmountFromWei = entity.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.price = vintageFundingProposalInfo.getPrice();
    entity.recipientAddr = vintageFundingProposalInfo.getRecipientAddr();
    entity.proposer = vintageFundingProposalInfo.getProposer();
    entity.vestingStartTime = vintageFundingProposalInfo.getVestInfo().vestingStartTime;
    entity.vetingEndTime = vintageFundingProposalInfo.getVestInfo().vetingEndTime;
    entity.vestingCliffEndTime = vintageFundingProposalInfo.getVestInfo().vestingCliffEndTime;
    entity.vestingCliffLockAmount = vintageFundingProposalInfo.getVestInfo().vestingCliffLockAmount;
    entity.vestingInterval = vintageFundingProposalInfo.getVestInfo().vestingInterval;
    entity.paybackToken = vintageFundingProposalInfo.getProposalPaybackTokenInfo().paybackToken;
    entity.paybackTokenAmount = vintageFundingProposalInfo.getProposalPaybackTokenInfo().paybackTokenAmount;
    entity.paybackTokenAmountFromWei = entity.paybackTokenAmount.div(BigInt.fromI64(10 ** 18)).toString();
    entity.inQueueTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().inQueueTimestamp;
    entity.proposalStartVotingTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().proposalStartVotingTimestamp;
    entity.proposalStopVotingTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().proposalStopVotingTimestamp;
    entity.proposalExecuteTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().proposalExecuteTimestamp;
    entity.creationTime = event.block.timestamp;
    entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
    entity.vintageDaoEntity = event.params.daoAddr.toHexString();
    let successedFundCounter = VintageSuccessedFundCounter.load(event.params.daoAddr.toString());

    entity.succeedFundRound = successedFundCounter ? successedFundCounter.counter : BigInt.fromI32(0);
    entity.save()
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
    const daoContract = DaoRegistry.bind(event.params.daoAddr);
    const fundingPoolContractAddress = daoContract.getAdapterAddress(Bytes.fromHexString("0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892"));
    const fundingPoolAdapt = VintageFundingPoolAdapterContract.bind(fundingPoolContractAddress);

    const fundingPoolExtAddress = daoContract.getExtensionAddress(Bytes.fromHexString("0x161fca6912f107b0f13c9c7275de7391b32d2ea1c52ffba65a3c961880a0c60f"))
    const fundingPoolExtContr = VintageFundingPoolExtension.bind(fundingPoolExtAddress)

    const vintageFundingContract = VintageFundingAdapterContract.bind(event.address);
    const proposalInfo = vintageFundingContract.proposals(event.params.daoAddr, event.params.proposalID);
    let proposalEntity = VintageFundingProposalInfo.load(event.params.proposalID.toHexString())
    // log.error("funding proposal state: {}", [event.params.state.toString()]);
    if (proposalEntity) {
        const vintageFundingContract = VintageFundingAdapterContract.bind(event.address);
        const vintageFundingProposalInfo = vintageFundingContract.
            proposals(event.params.daoAddr,
                event.params.proposalID);

        proposalEntity.state = BigInt.fromI32(vintageFundingProposalInfo.getStatus());
        proposalEntity.proposalExecuteTimestamp = event.block.timestamp;
        proposalEntity.executeBlockNum = proposalInfo.getExecuteBlockNum();
        proposalEntity.save();

        if (proposalEntity.state == BigInt.fromI32(3)) {
            let VintageDaoStatisticsEntity = VintageDaoStatistic.load(event.params.daoAddr.toHexString());
            if (!VintageDaoStatisticsEntity) {
                VintageDaoStatisticsEntity = new VintageDaoStatistic(event.params.daoAddr.toHexString());
                VintageDaoStatisticsEntity.fundRaised = BigInt.fromI64(0);
                VintageDaoStatisticsEntity.fundRaisedFromWei = "0";
                VintageDaoStatisticsEntity.fundInvestedFromWei = "0";
                VintageDaoStatisticsEntity.fundInvested = BigInt.fromI64(0);
                VintageDaoStatisticsEntity.fundedVentures = BigInt.fromI64(0);
                VintageDaoStatisticsEntity.members = BigInt.fromI64(0);
                VintageDaoStatisticsEntity.daoAddr = event.params.daoAddr;
            }
            VintageDaoStatisticsEntity.fundInvested = VintageDaoStatisticsEntity.fundInvested.plus(proposalEntity.fundingAmount);
            VintageDaoStatisticsEntity.fundInvestedFromWei = VintageDaoStatisticsEntity.fundInvested.div(BigInt.fromI64(10 ** 18)).toString();
            VintageDaoStatisticsEntity.fundedVentures = VintageDaoStatisticsEntity.fundedVentures.plus(BigInt.fromI32(1));

            VintageDaoStatisticsEntity.save();
        }

        let voteInfoEntity = VintageProposalVoteInfo.load(event.params.proposalID.toHexString());

        if (voteInfoEntity) {
            voteInfoEntity.nbYes = event.params.nbYes;
            voteInfoEntity.nbNo = event.params.nbNo;
            voteInfoEntity.totalWeights = event.params.allVotingWeight;
            voteInfoEntity.save();
        }

        const daoContract = DaoRegistry.bind(event.params.daoAddr);
        const fundRaiseAddress = daoContract.getAdapterAddress(Bytes.fromHexString("0xa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed"));
        const fundRaiseContract = VintageFundRaiseAdapterContract.bind(fundRaiseAddress);
        const currentFundRound = fundRaiseContract.createdFundCounter(event.params.daoAddr);


        if (proposalEntity.state == BigInt.fromI32(3)) {
            let fundRoundEntity = VintageFundRoundStatistic.load(event.params.daoAddr.toString() + currentFundRound.toString());
            if (fundRoundEntity) {
                fundRoundEntity.fundInvested = fundRoundEntity.fundInvested.plus(proposalEntity.fundingAmount);
                fundRoundEntity.fundedVentures = fundRoundEntity.fundedVentures.plus(BigInt.fromI32(1));
                fundRoundEntity.save();
            }

            const roundProposalIdEntity = VintageFundRoundToNewFundProposalId.load(event.params.daoAddr.toHexString() + currentFundRound.toString());
            if (roundProposalIdEntity) {
                const newFundProposalId = roundProposalIdEntity.proposalId;
                let fundRaiseEntity = VintageFundRaiseEntity.load(roundProposalIdEntity.proposalId.toHexString());
                if (fundRaiseEntity) {
                    fundRaiseEntity.fundInvested = fundRaiseEntity.fundInvested.plus(proposalEntity.fundingAmount);
                    fundRaiseEntity.fundInvestedFromWei = fundRaiseEntity.fundInvested.div(BigInt.fromI64(10 ** 18)).toString();
                    fundRaiseEntity.fundedVentures = fundRaiseEntity.fundedVentures.plus(BigInt.fromI32(1));

                    fundRaiseEntity.save();
                }
            }
            // log.error("currentFundRound {}", [currentFundRound.toString()]);
            const investors = fundingPoolAdapt.try_getFundInvestors(event.params.daoAddr, currentFundRound);
            if (!investors.reverted && investors.value.length > 0) {
                // log.error("investors: {}", [investors.value.toString()]);

                for (var i = 0; i < investors.value.length; i++) {
                    const bal1 = fundingPoolExtContr.try_getPriorAmount(investors.value[i], Address.fromBytes(proposalEntity.fundingToken), proposalInfo.getExecuteBlockNum().minus(BigInt.fromI32(1)));
                    // const bal2 = fundingPoolExtContr.try_getPriorAmount(investors.value[i], Address.fromBytes(proposalEntity.fundingToken), proposalInfo.getExecuteBlockNum());
                    const bal2 = fundingPoolAdapt.balanceOf(event.params.daoAddr, investors.value[i]);
                    if (!bal1.reverted) {
                        // log.error("prior value1: {}", [bal1.value.toString()]);
                        // log.error("prior value2: {}", [bal2.toString()]);
                        const investedAmount = bal1.value.minus(bal2);
                        // log.error("investedAmount: {}", [investedAmount.toString()]);
                        let investorInvestmentEntity = VintageInvestorInvestmentEntity.load(event.params.daoAddr.toHexString() + currentFundRound.toHexString() + investors.value[i].toHexString());
                        // let escrowFundEntity = VintageEscrowFundEntity.load(event.params.daoAddr.toHexString() + investors.value[i].toHexString() + currentFundRound.toHexString());
                        if (!investorInvestmentEntity) {
                            investorInvestmentEntity = new VintageInvestorInvestmentEntity(
                                event.params.daoAddr.toHexString()
                                + currentFundRound.toHexString() +
                                investors.value[i].toHexString()
                            );
                            investorInvestmentEntity.daoAddr = event.params.daoAddr;
                            investorInvestmentEntity.fundRound = currentFundRound;
                            investorInvestmentEntity.investor = investors.value[i];
                            investorInvestmentEntity.investedAmount = BigInt.fromI32(0);
                        }
                        investorInvestmentEntity.investedAmount = investorInvestmentEntity.investedAmount.plus(investedAmount);
                        investorInvestmentEntity.save();
                    }
                }

            }
        }
    }
}

export function handleStartVote(event: handleStartVoteEvent): void {
    let entity = VintageFundingProposalInfo.load(event.params.proposalID.toHexString())
    if (entity) {
        const vintageFundingContract = VintageFundingAdapterContract.bind(event.address);
        const vintageFundingProposalInfo = vintageFundingContract.
            proposals(event.params.daoAddr,
                event.params.proposalID);

        entity.state = BigInt.fromI32(vintageFundingProposalInfo.getStatus());
        entity.proposalStartVotingTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().proposalStartVotingTimestamp;
        entity.proposalStopVotingTimestamp = vintageFundingProposalInfo.getProposalTimeInfo().proposalStopVotingTimestamp;
        entity.save();
    }
}

