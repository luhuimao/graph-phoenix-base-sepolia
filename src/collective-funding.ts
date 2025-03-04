import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import {
    ColletiveFundingProposalAdapterContract,
    ProposalCreated,
    ProposalExecuted,
    StartVoting
} from "../generated/ColletiveFundingProposalAdapterContract/ColletiveFundingProposalAdapterContract"
import { DaoRegistry } from "../generated/ColletiveFundingProposalAdapterContract/DaoRegistry";
import { CollectiveInvestmentPoolExtension } from "../generated/ColletiveFundingProposalAdapterContract/CollectiveInvestmentPoolExtension";
import { ColletiveFundingPoolAdapterContract } from "../generated/ColletiveFundingProposalAdapterContract/ColletiveFundingPoolAdapterContract";
import { newCollectiveProposalVoteInfoEntity } from "./collective-clear-fund-proposal";
import { ERC20 } from "../generated/ColletiveFundingProposalAdapterContract/ERC20";
import {
    CollectiveInvestmentProposalEntity,
    CollectiveDaoStatisticEntity,
    CollectiveProposalVoteInfo,
    CollectiveInvestorPortfoliosEntity,
    InvestmentProposalInvestorEntity,
    CollectiveFundRaisedEntity
} from "../generated/schema"
// import { encodeBase58 } from "ethers";

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = new CollectiveInvestmentProposalEntity(event.params.proposalId.toHexString());
    const contract = ColletiveFundingProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    const daoContr = DaoRegistry.bind(event.params.daoAddr);
    const collectiveFundingPoolAdapterContractAddr = daoContr.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);

    const COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT = daoContr.getConfiguration(Bytes.fromHexString("0xb035c58a9b643066fc5cd78a708da0456c36221a03ca174ff3b76d4306ff7c6c"));
    const COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT = daoContr.getConfiguration(Bytes.fromHexString("0x558062fa5fcc8623e6c743ab5b51793317989a5a93f03b32a485f94843f77da3"))

    if (!rel.reverted) {
        entity.daoAddr = event.params.daoAddr;
        entity.proposalId = event.params.proposalId;
        entity.approver = rel.value.getEscrowInfo().approver
        entity.escrow = rel.value.getEscrowInfo().escrow
        entity.paybackAmount = rel.value.getEscrowInfo().paybackAmount
        entity.paybackToken = rel.value.getEscrowInfo().paybackToken
        entity.price = rel.value.getEscrowInfo().price
        entity.executeBlockNum = rel.value.getExecuteBlockNum()
        entity.investmentAmount = rel.value.getFundingInfo().fundingAmount
        entity.receiver = rel.value.getFundingInfo().receiver
        entity.token = rel.value.getFundingInfo().token
        entity.totalAmount = rel.value.getFundingInfo().totalAmount
        entity.proposer = rel.value.getProposer()
        entity.state = BigInt.fromI32(rel.value.getState())
        entity.startVotingTime = rel.value.getTimeInfo().startVotingTime
        entity.stopVotingTime = rel.value.getTimeInfo().stopVotingTime
        entity.cliffEndTime = rel.value.getVestingInfo().cliffEndTime
        entity.cliffVestingAmount = rel.value.getVestingInfo().cliffVestingAmount
        entity.vestingEndTime = rel.value.getVestingInfo().endTime
        entity.vestingStartTime = rel.value.getVestingInfo().startTime
        entity.vestingInterval = rel.value.getVestingInfo().vestingInterval
        entity.executeHash = Bytes.empty();
        entity.creationTime = event.block.timestamp;
        entity.vestingNFTEnable = rel.value.getVestingInfo().nftEnable;
        entity.vestingNFTAddr = rel.value.getVestingInfo().erc721;
        entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        entity.proposalExecuteTimestamp = BigInt.zero();
        entity.protocolFeeAmount = collectiveFundingPoolAdapterContract.protocolFee();
        entity.proposerFeeAmount = COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT;
        entity.proposerCarryAmount = COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT;
        entity.save();
    }

    newCollectiveProposalVoteInfoEntity(event.params.daoAddr, event.params.proposalId);
}

export function handlerProposalProcessed(event: ProposalExecuted): void {
    let entity = CollectiveInvestmentProposalEntity.load(event.params.proposalId.toHexString());
    const contract = ColletiveFundingProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    const daoContr = DaoRegistry.bind(event.params.daoAddr);

    const collectiveFundingPoolAdapterContractAddr = daoContr.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);

    const fundingPoolExtAddress = daoContr.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"));
    const collectiveFundingPoolExt = CollectiveInvestmentPoolExtension.bind(fundingPoolExtAddress);
    if (!rel.reverted && entity) {
        const decimals = ERC20.bind(Address.fromBytes(entity.token)).decimals();

        entity.state = BigInt.fromI32(rel.value.getState());
        entity.executeBlockNum = rel.value.getExecuteBlockNum();
        entity.executeHash = event.transaction.hash;
        entity.proposalExecuteTimestamp = event.block.timestamp;
        entity.save();

        if (rel.value.getState() == 3) {
            let collectiveDaoStatisticEntity = CollectiveDaoStatisticEntity.load(event.params.daoAddr.toHexString());
            if (!collectiveDaoStatisticEntity) {
                collectiveDaoStatisticEntity = new CollectiveDaoStatisticEntity(event.params.daoAddr.toHexString());

                collectiveDaoStatisticEntity.fundRaised = BigInt.fromI64(0);
                collectiveDaoStatisticEntity.fundRaisedFromWei = "0";
                collectiveDaoStatisticEntity.fundInvestedFromWei = "0";
                collectiveDaoStatisticEntity.fundInvested = BigInt.fromI64(0);
                collectiveDaoStatisticEntity.fundedVentures = BigInt.fromI64(0);
                collectiveDaoStatisticEntity.members = BigInt.fromI64(0);
                collectiveDaoStatisticEntity.daoAddr = event.params.daoAddr;
                collectiveDaoStatisticEntity.investors = [];
                collectiveDaoStatisticEntity.governors = [];
                collectiveDaoStatisticEntity.membersArr = [];
            }
            collectiveDaoStatisticEntity.fundInvested = collectiveDaoStatisticEntity.fundInvested.plus(entity.investmentAmount);
            collectiveDaoStatisticEntity.fundInvestedFromWei = collectiveDaoStatisticEntity.fundInvested.div(BigInt.fromI64(10 ** decimals)).toString();
            collectiveDaoStatisticEntity.fundedVentures = collectiveDaoStatisticEntity.fundedVentures.plus(BigInt.fromI32(1));
            collectiveDaoStatisticEntity.save();

            let collectiveFundRaisedEntity = CollectiveFundRaisedEntity.load(event.params.daoAddr.toHexString()
                + entity.token.toHexString());
            if (collectiveFundRaisedEntity) {
                collectiveFundRaisedEntity.investedAmount = collectiveFundRaisedEntity.investedAmount.plus(entity.investmentAmount);
                collectiveFundRaisedEntity.investedAmountFromWei = collectiveFundRaisedEntity.investedAmount.div(BigInt.fromI64(10 ** (collectiveFundRaisedEntity.tokenDecimals.toI32()))).toString();
                collectiveFundRaisedEntity.save();
            }

            const members = daoContr.try_getAllSteward();
            if (!members.reverted && members.value.length > 0) {
                for (var i = 0; i < members.value.length; i++) {
                    let portfolio = new CollectiveInvestorPortfoliosEntity(event.params.proposalId.toHexString() + members.value[i].toHexString());
                    portfolio.daoAddr = event.params.daoAddr;
                    portfolio.account = members.value[i];
                    portfolio.investmentProposalId = event.params.proposalId;
                    portfolio.timeStamp = event.block.timestamp;
                    portfolio.investmentCurrency = entity.token;
                    portfolio.paybackCurrency = entity.paybackToken;
                    portfolio.price = entity.price;

                    const bal1 = collectiveFundingPoolAdapterContract.balanceOf(event.params.daoAddr, members.value[i]);
                    const raiseTokenAddr = collectiveFundingPoolExt.getFundRaisingTokenAddress();
                    const bal2 = collectiveFundingPoolExt.try_getPriorAmount(
                        members.value[i],
                        raiseTokenAddr,
                        event.block.number.minus(BigInt.fromI32(1))
                    );

                    const poolBal = collectiveFundingPoolExt.try_getPriorAmount(
                        Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000decd")),
                        raiseTokenAddr,
                        event.block.number.minus(BigInt.fromI32(1))
                    );

                    let myInvestedAmount = BigInt.zero();
                    let netInvestedAmount = BigInt.zero();
                    let myProtocolFeeAmount = BigInt.zero();
                    let myScoutFeeAmount = BigInt.zero();
                    let myScoutCarryAmount = BigInt.zero();
                    let myTotalPaybackTokenAmount = BigInt.zero();
                    let myNetPaybackTokenAmount = BigInt.zero();

                    const protocolFeeAmount =
                        entity.totalAmount.times(
                            entity.protocolFeeAmount).div(
                                BigInt.fromI64(10 ** 18));

                    const proposerFundReward =
                        entity.totalAmount.times(
                            entity.proposerFeeAmount).div(
                                BigInt.fromI64(10 ** 18));

                    const totalProposerCarryAmount = entity.paybackAmount.times(
                        entity.proposerCarryAmount).div(BigInt.fromI64(10 ** 18));

                    if (!bal2.reverted) {
                        myInvestedAmount = bal2.value.minus(bal1);
                        if (!poolBal.reverted && poolBal.value.gt(BigInt.zero())) {
                            netInvestedAmount = entity.investmentAmount.times(bal2.value).div(poolBal.value);
                            myProtocolFeeAmount = protocolFeeAmount.times(bal2.value).div(poolBal.value);
                            myScoutFeeAmount = proposerFundReward.times(bal2.value).div(poolBal.value);
                            myTotalPaybackTokenAmount = entity.paybackAmount.times(bal2.value).div(poolBal.value);
                            myScoutCarryAmount = totalProposerCarryAmount.times(bal2.value).div(poolBal.value);
                        }
                    }
                    myNetPaybackTokenAmount = myTotalPaybackTokenAmount.minus(myScoutCarryAmount);

                    portfolio.totalInvestedAmount = myInvestedAmount;
                    portfolio.totalInvestedAmountFromWei = portfolio.totalInvestedAmount.div(BigInt.fromI64(10 ** decimals)).toString();
                    portfolio.netInvestedAmount = netInvestedAmount;
                    portfolio.netInvestedAmountFromWei = portfolio.netInvestedAmount.div(BigInt.fromI64(10 ** decimals)).toString();
                    portfolio.governorFeeAmount = BigInt.zero();
                    portfolio.governorCarryAmount = BigInt.zero();
                    portfolio.ScoutFeeAmount = myScoutFeeAmount;
                    portfolio.ScoutCarryAmount = myScoutCarryAmount;
                    portfolio.protocolFeeAmount = myProtocolFeeAmount;
                    portfolio.totalPaybackTokenAmount = myTotalPaybackTokenAmount;
                    portfolio.netPaybackTokenAmount = myNetPaybackTokenAmount;

                    portfolio.save();
                }
            }

            const finalInvestors = new InvestmentProposalInvestorEntity(event.params.proposalId.toHexString());
            finalInvestors.daoAddr = event.params.daoAddr;
            finalInvestors.proposalId = event.params.proposalId;
            finalInvestors.mode = "collective";
            let tem: string[] = [];
            let tem1: BigInt[] = [];
            if (event.params.investors.length > 0) {
                const raiseTokenAddr = collectiveFundingPoolExt.getFundRaisingTokenAddress();
                const totalInvestedAmount = collectiveFundingPoolExt.try_getPriorAmount(
                    Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000decd")),
                    raiseTokenAddr,
                    event.block.number.minus(BigInt.fromI32(1)));
                for (let j = 0; j < event.params.investors.length; j++) {
                    tem.push(event.params.investors[j].toHexString());

                    const myInvestedAmount = collectiveFundingPoolExt.try_getPriorAmount(
                        event.params.investors[j],
                        raiseTokenAddr,
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
    }

    let voteInfoEntity = CollectiveProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}

export function handlerStartVoting(event: StartVoting): void {
    let entity = CollectiveInvestmentProposalEntity.load(event.params.proposalId.toHexString());
    const contract = ColletiveFundingProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    if (!rel.reverted && entity) {
        entity.startVotingTime = rel.value.getTimeInfo().startVotingTime;
        entity.stopVotingTime = rel.value.getTimeInfo().stopVotingTime;
        entity.state = BigInt.fromI32(rel.value.getState());
        entity.save();
    }
}