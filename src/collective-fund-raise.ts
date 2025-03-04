import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import {
    ColletiveFundRaiseProposalAdapterContract,
    ProposalCreated,
    proposalExecuted
} from "../generated/ColletiveFundRaiseProposalAdapterContract/ColletiveFundRaiseProposalAdapterContract";
import { DaoRegistry } from "../generated/ColletiveFundRaiseProposalAdapterContract/DaoRegistry"
// import { ERC20 } from "../generated/ColletiveFundingPoolAdapterContract/ERC20";

import {
    CollectiveFundRaiseProposalEntity,
    CollectiveProposalVoteInfo,
    CollectiveDaoEntity,
    CollectiveDaoVoteConfigEntity
} from "../generated/schema"
import { newCollectiveProposalVoteInfoEntity } from "./collective-clear-fund-proposal";

export function handleProposalCreated(event: ProposalCreated): void {
    const contract = ColletiveFundRaiseProposalAdapterContract.bind(event.address);
    const daoContract = DaoRegistry.bind(event.params.daoAddr);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    if (!rel.reverted) {
        let entity = new CollectiveFundRaiseProposalEntity(event.params.proposalId.toHexString());
        entity.fundRaiseId = BigInt.zero();
        // entity.fundRaiseId = !contract.try_fundRaisingId(event.params.daoAddr).reverted ? contract.try_fundRaisingId(event.params.daoAddr).value : BigInt.zero();
        entity.acceptTokenAddr = rel.value.getFundInfo().tokenAddress;
        entity.fundRaiseTarget = rel.value.getFundInfo().miniTarget;
        // const decimals = ERC20.bind(Address.fromBytes(entity.acceptTokenAddr)).decimals();
        entity.fundRaiseTargetFromWei = "";// entity.fundRaiseTarget.div(BigInt.fromI64(10 ** (decimals))).toString();
        entity.fundRaiseMaxAmount = rel.value.getFundInfo().maxCap;
        entity.fundRaiseMaxAmountFromWei = ""//entity.fundRaiseMaxAmount.div(BigInt.fromI64(10 ** (decimals))).toString();
        entity.lpMinDepositAmount = rel.value.getFundInfo().miniDeposit;
        entity.lpMinDepositAmountFromWei = ""//entity.lpMinDepositAmount.div(BigInt.fromI64(10 ** (decimals))).toString();
        entity.lpMaxDepositAmount = rel.value.getFundInfo().maxDeposit;
        entity.lpMaxDepositAmountFromWei = ""// entity.lpMaxDepositAmount.div(BigInt.fromI64(10 ** (decimals))).toString();
        entity.fundRaiseStartTime = rel.value.getTimeInfo().startTime;
        entity.fundRaiseEndTime = rel.value.getTimeInfo().endTime;
        entity.priorityDepositEnable = rel.value.getPriorityDepositor().enable;
        entity.priorityDepositType = BigInt.fromI32(rel.value.getPriorityDepositor().valifyType);
        entity.priorityDepositTokenAddress = rel.value.getPriorityDepositor().tokenAddress;
        entity.priorityDepositTokenId = rel.value.getPriorityDepositor().tokenId;
        entity.priorityDepositAmount = rel.value.getPriorityDepositor().miniHolding;
        entity.totalFund = BigInt.fromI32(0);
        entity.totalFundFromWei = "0";
        let tem: string[] = [];
        if (rel.value.getPriorityDepositor().whitelist.length > 0
        ) {
            for (let i = 0; i < rel.value.getPriorityDepositor().whitelist.length; i++) {
                tem.push(rel.value.getPriorityDepositor().whitelist[i].toHexString());
            }
        }

        entity.priorityDepositWhiteList = tem;
        entity.state = BigInt.fromI32(rel.value.getState());
        entity.creationTime = event.block.timestamp;
        entity.stopVoteTime = rel.value.getStopVoteTime();
        entity.fundRaiseType = BigInt.fromI32(rel.value.getFundRaiseType());
        entity.fundRaiseTypeInString = rel.value.getFundRaiseType() == 0 ? "FCFS" : "Free In";
        entity.daoAddr = event.params.daoAddr;
        entity.proposer = event.transaction.from;
        entity.proposalId = event.params.proposalId;
        entity.executeHash = Bytes.empty();
        entity.fundRaiseId = daoContract.getCurrentFundEstablishmentProposalId();

        const MAX_INVESTORS_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x69f4ffb3ebcb7809550bddd3e4d449a47e737bf6635bc7a730996643997b0e48"));
        const MAX_INVESTORS = daoContract.getConfiguration(Bytes.fromHexString("0xecbde689cc6337d29a750b8b8a8abbfa97427b4ac800ab55be2f2c87311510f2"));
        entity.investorCapEnable = MAX_INVESTORS_ENABLE == BigInt.fromI32(1) ? true : false;
        entity.investorCapAmount = MAX_INVESTORS;
        entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        entity.save();
    }

    newCollectiveProposalVoteInfoEntity(event.params.daoAddr, event.params.proposalId);
}


export function handlerProposalProcessed(event: proposalExecuted): void {
    const contract = ColletiveFundRaiseProposalAdapterContract.bind(event.address);

    let entity = CollectiveFundRaiseProposalEntity.load(event.params.proposalId.toHexString());
    if (entity) {
        const re = contract.try_fundRaisingId(event.params.daoAddr);
        entity.fundRaiseId = !re.reverted ? re.value : BigInt.zero();

        entity.state = BigInt.fromI32(event.params.state);
        entity.executeHash = event.transaction.hash;
        if (event.params.voteResult == BigInt.fromI32(1) || event.params.voteResult == BigInt.fromI32(3))
            entity.failedReason = "VotingFailed";
        entity.save();

        let collectiveDaoEntity = CollectiveDaoEntity.load(event.params.daoAddr.toHexString());
        if (collectiveDaoEntity) {
            collectiveDaoEntity.investmentCurrency = entity.acceptTokenAddr;
            collectiveDaoEntity.save();
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