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
import { DaoRegistry } from "../generated/VintageFundRaiseAdapterContract/DaoRegistry";
import { VintageFundingPoolAdapterContract } from "../generated/VintageFundRaiseAdapterContract/VintageFundingPoolAdapterContract"
import {
    VintageFundEstablishmentProposal,
    VintageProposalVoteInfo,
    VintageFundRoundToFundEstablishmentProposalId,
    VintageFundRaiseEntity,
    VintageDaoFeeInfoEntity,
    VintageDaoInvestorCapacityEntity,
    VintageInvestorMembershipEntity
} from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    // log.error("proposalId {}", [event.params.proposalId.toHexString()]);

    let entity = VintageFundEstablishmentProposal.load(event.params.proposalId.toHexString())

    if (!entity) {
        entity = new VintageFundEstablishmentProposal(event.params.proposalId.toHexString())
    }
    const daoContr = DaoRegistry.bind(event.params.daoAddr);

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
        entity.redemptionFeeReceiver = proposalInfo.getFeeInfo().redemptionFeeReceiver;
        entity.fundRaiseId = daoContr.getCurrentFundEstablishmentProposalId();

        entity.investorCapEnable = proposalInfo.getInvestorCap().enable;
        entity.investorCapAmount = proposalInfo.getInvestorCap().cap;

        entity.investorEligibilityEnalbe = proposalInfo.getInvestorEligibility().enable;
        entity.investorEligibilityName = proposalInfo.getInvestorEligibility().name;
        entity.investorEligibilityMinAmount = proposalInfo.getInvestorEligibility().minAmount;
        entity.investorEligibilityTokenAddress = proposalInfo.getInvestorEligibility().tokenAddress;
        entity.investorEligibilityTokenId = proposalInfo.getInvestorEligibility().tokenId;
        entity.investorEligibilityVarifyType = BigInt.fromI32(proposalInfo.getInvestorEligibility().varifyType);

        let tem: string[] = [];

        if (proposalInfo.getInvestorEligibility().whiteList.length > 0) {
            for (let j = 0; j < proposalInfo.getInvestorEligibility().whiteList.length; j++) {
                tem.push(proposalInfo.getInvestorEligibility().whiteList[j].toHexString())
            }
        }
        entity.investorEligibilityWhiteList = tem;
        entity.save()

        const erc20 = ERC20.bind(Address.fromBytes(entity.acceptTokenAddr));
        let fundRaiseEntity = new VintageFundRaiseEntity(event.params.proposalId.toHexString());
        const sym = erc20.try_symbol();
        fundRaiseEntity.tokenSymbol = sym.reverted ? "" : sym.value;
        fundRaiseEntity.daoAddr = event.params.daoAddr;
        fundRaiseEntity.fundRaiseProposalId = event.params.proposalId;
        const ercname = erc20.try_name();
        fundRaiseEntity.tokenName = ercname.reverted ? "" : ercname.value;
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
    const daoContract = DaoRegistry.bind(event.params.daoAddr);
    const fundingPoolContractAddress = daoContract.getAdapterAddress(Bytes.fromHexString("0xaaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892"));
    const fundingPoolAdapt = VintageFundingPoolAdapterContract.bind(fundingPoolContractAddress);

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


            const vintageDaoInvestorCapacityEntity = VintageDaoInvestorCapacityEntity.load(event.params.daoAddr.toHexString());
            if (vintageDaoInvestorCapacityEntity) {
                const MAX_INVESTORS_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x69f4ffb3ebcb7809550bddd3e4d449a47e737bf6635bc7a730996643997b0e48"));
                const MAX_INVESTORS = daoContract.getConfiguration(Bytes.fromHexString("0xecbde689cc6337d29a750b8b8a8abbfa97427b4ac800ab55be2f2c87311510f2"));

                vintageDaoInvestorCapacityEntity.daoAddr = event.params.daoAddr;
                vintageDaoInvestorCapacityEntity.enable = MAX_INVESTORS_ENABLE == BigInt.fromI32(1) ? true : false;
                vintageDaoInvestorCapacityEntity.capacityAmount = MAX_INVESTORS;
                vintageDaoInvestorCapacityEntity.vintageDaoEntity = event.params.daoAddr.toHexString();
                vintageDaoInvestorCapacityEntity.save();
            }

            const vintageInvestorMembershipEntity = VintageInvestorMembershipEntity.load(event.params.daoAddr.toHexString());
            if (vintageInvestorMembershipEntity) {
                const VINTAGE_INVESTOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x1405d0156cf64c805704fdf6691baebfcfa0d409ea827c231693ff0581b0b777"));
                const VINTAGE_INVESTOR_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x80140cd7e0b1d935bee578a67a41547c82987de8e7d6b3827d411b738110258b"));
                const VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0x04ecaf460eb9f82aeb70035e3f24c18a3650fa0da9ddbe7e63d70de659b9b901"));
                const VINTAGE_INVESTOR_MEMBERSHIP_TOKENID = daoContract.getConfiguration(Bytes.fromHexString("0x6cb5bc3796b0717ca4ff665886c96fb0178d6341366eb7b6c737fe79083b836a"));
                const VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0xe373ab56628c86db3f0e36774c2c5e0393f9272ff5c976bc3f0db2db60cdbc14"));
                const VINTAGE_INVESTOR_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0x324dfda0ffcc38c4650b5df076e6f7b4938c2b723873af58b1be5e221dd2cc30"));

                let tem: string[] = [];
                const whitelist = fundingPoolAdapt.getInvestorMembershipWhiteList(event.params.daoAddr)
                if (whitelist.length > 0) {
                    for (let j = 0; j < whitelist.length; j++) {
                        tem.push(whitelist[j].toHexString())
                    }
                }

                vintageInvestorMembershipEntity.daoAddr = event.params.daoAddr;
                vintageInvestorMembershipEntity.enable = VINTAGE_INVESTOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
                vintageInvestorMembershipEntity.name = VINTAGE_INVESTOR_MEMBERSHIP_NAME;
                vintageInvestorMembershipEntity.minAmount = VINTAGE_INVESTOR_MEMBERSHIP_MIN_HOLDING;
                vintageInvestorMembershipEntity.tokenAddress = VINTAGE_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS;
                vintageInvestorMembershipEntity.tokenId = VINTAGE_INVESTOR_MEMBERSHIP_TOKENID;
                vintageInvestorMembershipEntity.varifyType = VINTAGE_INVESTOR_MEMBERSHIP_TYPE;
                vintageInvestorMembershipEntity.whiteList = tem;
                vintageInvestorMembershipEntity.vintageDaoEntity = event.params.daoAddr.toHexString();
                vintageInvestorMembershipEntity.save();

            }
        }

        let fundRaiseEntity = VintageFundRaiseEntity.load(event.params.proposalId.toHexString());
        if (fundRaiseEntity) {
            fundRaiseEntity.fundStartTimestamp = event.block.timestamp;
            fundRaiseEntity.fundStartDateTime = new Date(fundRaiseEntity.fundStartTimestamp.toI64() * 1000).toISOString();
            fundRaiseEntity.fundEndTimestamp = entity.fundEndTime;
            fundRaiseEntity.fundEndDateTime = new Date(fundRaiseEntity.fundEndTimestamp.toI64() * 1000).toISOString();
            fundRaiseEntity.fundNumber = "FundEstablishment#" + fundNumber.toString();
            fundRaiseEntity.save();
        }
        entity.executeHash = event.transaction.hash;
        if (event.params.voteResult == BigInt.fromI32(1) || event.params.voteResult == BigInt.fromI32(3)) {
            entity.failedReason = "VotingFailed";
        }
        entity.save();
    }

    let voteInfoEntity = VintageProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}
