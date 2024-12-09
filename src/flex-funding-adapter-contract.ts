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
import { FlexInvestmentPoolAdapterContract } from "../generated/FlexFundingAdapterContract/FlexInvestmentPoolAdapterContract";
import { FlexPollingVotingContract } from "../generated/FlexFundingAdapterContract/FlexPollingVotingContract";
import { FlexFreeInEscrowFundAdapterContract } from "../generated/FlexFundingAdapterContract/FlexFreeInEscrowFundAdapterContract";
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
    const daoContract = DaoRegistry.bind(event.params.daoAddress);
    const flexPollVotingAdaptContrAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x6f48e16963713446db50a1503860d8e1fc3c888da56a85afcaa6dc29503cc610"));
    const flexPollVotingAdapt = FlexPollingVotingContract.bind(flexPollVotingAdaptContrAddr);

    const fundingPoolAdaptContrAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c"));
    const fundingPoolAdaptContr = FlexInvestmentPoolAdapterContract.bind(fundingPoolAdaptContrAddr);
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

    const managementFeeAmount = daoContract.getConfiguration(
        Bytes.fromHexString("0x64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a87")
    );
    const managementCarryAmount =
        daoContract.getConfiguration(Bytes.fromHexString("0xea659d8e1a730b10af1cecb4f8ee391adf80e75302d6aaeb9642dc8a4a5e5dbb"))
    const proposerRewardAmount =
        proposalInfo.getProposerRewardInfo().cashRewardAmount;
    const proposerCarryAmount = proposalInfo.getProposerRewardInfo().tokenRewardAmount;

    entity.managementFeeAmount = managementFeeAmount;
    entity.managementCarryAmount = managementCarryAmount;
    entity.proposerFeeAmount = proposerRewardAmount;
    entity.proposerCarryAmount = proposerCarryAmount;
    entity.protocolFeeAmount = flexFundingContract.protocolFee();


    const MAX_INVESTORS_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x69f4ffb3ebcb7809550bddd3e4d449a47e737bf6635bc7a730996643997b0e48"));
    const MAX_INVESTORS = daoContract.getConfiguration(Bytes.fromHexString("0xecbde689cc6337d29a750b8b8a8abbfa97427b4ac800ab55be2f2c87311510f2"));

    entity.investorCapEnable = MAX_INVESTORS_ENABLE == BigInt.fromI32(1) ? true : false;
    entity.investorCapAmount = MAX_INVESTORS;

    const FLEX_INVESTOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0xfeddffed075d0686e697569ece0ce2fd26bfbbb18719086f36d16c7117edb553"));
    const FLEX_INVESTOR_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0xfd9a8d4692ffc545577ff1979a0a918c2b536b6b6a891cf324a93b2c43907f83"));
    const FLEX_INVESTOR_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x77041e0d128001928f30b976713fed530b452bc354a9bad49ad1bcf93121f9dc"));
    const FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0xcab672166d6a1c8dae3ca0b03fed2e7258db17c3c3801ac2651987b066d39647"));
    const FLEX_INVESTOR_MEMBERSHIP_TOKENID = daoContract.getConfiguration(Bytes.fromHexString("0xcdc3057ec9c82a3ea3fd34ef56b1825924525fbab071e1a2b9d664a07f400480"));
    const FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x0f57fc3a39a8a66c31f52eab69ced65d5ac74e4a182b215146a45a0281de53e8"));

    entity.investorEligibilityEnable = FLEX_INVESTOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
    entity.investorEligibilityMinAmount = FLEX_INVESTOR_MEMBERSHIP_MIN_HOLDING;
    entity.investorEligibilityName = FLEX_INVESTOR_MEMBERSHIP_NAME;
    entity.investorEligibilityTokenAddress = FLEX_INVESTOR_MEMBERSHIP_TOKEN_ADDRESS;
    entity.investorEligibilityTokenId = FLEX_INVESTOR_MEMBERSHIP_TOKENID;
    entity.investorEligibilityVerifyType = FLEX_INVESTOR_MEMBERSHIP_TYPE;

    let tem1: string[] = [];
    const pwl = fundingPoolAdaptContr.try_getParticipanWhitelist(event.params.daoAddress);
    if (!pwl.reverted && pwl.value.length > 0) {
        for (let j = 0; j < pwl.value.length; j++) {
            tem1.push(pwl.value[j].toHexString())
        }
    }
    entity.investorEligibilityWhiteList = tem1;

    const FLEX_INVESTMENT_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x6e9fd67c3f2ca4e2b4e4b45b33b985dc3a1bffcadea24d12440a5901f72217b5"));
    const FLEX_POLLVOTER_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0x7bd63360ec775df97ced77d73875245296c41d88ebf2b52f8e630b4e9a51b448"));
    const FLEX_POLLVOTER_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x249486eeae30287051f65673dfa390711fd4587950c33b4150a633763f869724"));
    const FLEX_POLLVOTER_MEMBERSHIP_MIN_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0x6839e94cab6f83f7a12a5a3d1d6f3bbcaf0185a49b20b86e6f47b8c78494ac3d"));
    const FLEX_POLLVOTER_MEMBERSHIP_TOKENID = daoContract.getConfiguration(Bytes.fromHexString("0xf2b332c307ef460e99eb866928b78eca9f8af0da0626b4b48a13f9b52842fa6a"));
    const FLEX_POLLVOTER_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x770ef80745dba2953f780c8b963701e76fd3ac982923200f9214126e80f5f032"));

    entity.pollEnable = FLEX_INVESTMENT_TYPE == BigInt.fromI32(1) ? true : false;
    entity.pollVoterEligibilityMiniHoldingAmount = FLEX_POLLVOTER_MEMBERSHIP_MIN_HOLDING;
    entity.pollVoterEligibilityName = FLEX_POLLVOTER_MEMBERSHIP_NAME;
    entity.pollVoterEligibilityTokenAddress = FLEX_POLLVOTER_MEMBERSHIP_TOKEN_ADDRESS;
    entity.pollVoterEligibilityTokenId = FLEX_POLLVOTER_MEMBERSHIP_TOKENID;
    entity.pollVoterEligibilityType = FLEX_POLLVOTER_MEMBERSHIP_TYPE;

    let tem: string[] = [];

    const wl = flexPollVotingAdapt.try_getWhitelist(event.params.daoAddress)
    if (!wl.reverted && wl.value.length > 0) {
        for (let j = 0; j < wl.value.length; j++) {
            tem.push(wl.value[j].toHexString())
        }
    }
    entity.pollVoterEligibilityWhitelist = tem;

    const FLEX_POLLING_SUPER_MAJORITY = daoContract.getConfiguration(Bytes.fromHexString("0x777270e51451e60c2ce5118fc8e5844441dcc4d102e9052e60fb41312dbb848a"));
    const FLEX_POLLING_QUORUM = daoContract.getConfiguration(Bytes.fromHexString("0x7789eea44dccd66529026559d1b36215cb5766016b41a8a8f16e08b2ec875837"));

    entity.pollSupport = FLEX_POLLING_SUPER_MAJORITY;
    entity.pollQuorum = FLEX_POLLING_QUORUM;
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

    const flexFreeInEscrowFundAdaptContrAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0xeae11da953333a83b6467e2193334fb302549e1a42ad5797082aea1ab6be9120"));
    const flexFreeInEscrowFundAdaptContr = FlexFreeInEscrowFundAdapterContract.bind(flexFreeInEscrowFundAdaptContrAddr);

    const fundingPoolAdaptContrAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x2207fd6117465cefcba0abc867150698c0464aa41a293ec29ca01b67a6350c3c"));
    const fundingPoolAdaptContr = FlexInvestmentPoolAdapterContract.bind(fundingPoolAdaptContrAddr);

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);

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
            const proposerRewardAmount =
                proposalInfo.getProposerRewardInfo().cashRewardAmount;

            const proposerReward = (entity.totalFund.times(
                proposerRewardAmount)
            ).div(BigInt.fromI64(10 ** 18));

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
                const freeInEA = fundingPoolAdaptContr.try_freeInExtraAmount(event.params.daoAddress, event.params.proposalId);
                const totalInvestedAmount1 = !totalInvestedAmount.reverted ?
                    totalInvestedAmount.value.minus(
                        !freeInEA.reverted ?
                            freeInEA.value :
                            BigInt.zero()) :
                    BigInt.zero();
                for (let j = 0; j < event.params.investors.length; j++) {


                    const escRel = flexFreeInEscrowFundAdaptContr.try_getEscrowAmount(
                        event.params.daoAddress,
                        event.params.proposalId,
                        event.params.investors[j]
                    )
                    const myInvestedAmount = fundingPoolExtContr.try_getPriorAmount(
                        event.params.proposalId,
                        event.params.investors[j],
                        event.block.number.minus(BigInt.fromI32(1))
                    );
                    const myInvestedAmount1 = !myInvestedAmount.reverted ?
                        myInvestedAmount.value.minus(
                            !escRel.reverted ?
                                escRel.value.value1 :
                                BigInt.zero()
                        ) :
                        BigInt.zero();

                    if (myInvestedAmount1.gt(BigInt.zero())) tem.push(event.params.investors[j].toHexString());

                    const myShare = (!totalInvestedAmount.reverted && !myInvestedAmount.reverted) ?
                        myInvestedAmount1.times(BigInt.fromI64(10 ** 18)).div(totalInvestedAmount1) : BigInt.zero();
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
