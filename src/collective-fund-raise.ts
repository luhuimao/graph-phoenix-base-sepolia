import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
    ColletiveFundRaiseProposalAdapterContract,
    ProposalCreated,
    proposalExecuted
} from "../generated/ColletiveFundRaiseProposalAdapterContract/ColletiveFundRaiseProposalAdapterContract"
import {
    CollectiveFundRaiseProposalEntity,
    CollectiveProposalVoteInfo
} from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
    let entity = new CollectiveFundRaiseProposalEntity(event.params.proposalId.toHexString());
    const contract = ColletiveFundRaiseProposalAdapterContract.bind(event.address);
    const rel = contract.try_proposals(event.params.daoAddr, event.params.proposalId);
    if (!rel.reverted) {
        rel.value.getCreationTime();
        rel.value.getFundInfo().maxCap;
        rel.value.getFundInfo().maxDeposit;
        rel.value.getFundInfo().miniDeposit;
        rel.value.getFundInfo().miniTarget;
        rel.value.getFundInfo().tokenAddress;

        rel.value.getFundRaiseType();
        rel.value.getPriorityDepositor().enable;
        rel.value.getPriorityDepositor().miniHolding;
        rel.value.getPriorityDepositor().tokenAddress;
        rel.value.getPriorityDepositor().tokenId;
        rel.value.getPriorityDepositor().valifyType;
        rel.value.getPriorityDepositor().whitelist;

        rel.value.getState();
        rel.value.getStopVoteTime();
        rel.value.getTimeInfo().endTime;
        rel.value.getTimeInfo().startTime;

        entity.acceptTokenAddr = rel.value.getFundInfo().tokenAddress;

        entity.fundRaiseTarget = rel.value.getFundInfo().miniTarget;
        entity.fundRaiseTargetFromWei = entity.fundRaiseTarget.div(BigInt.fromI32(10 ** 18)).toString();
        // entity.fundRaiseMaxAmount: BigInt! # uint256
        // entity.fundRaiseMaxAmountFromWei: String!
        entity.lpMinDepositAmount = rel.value.getFundInfo().miniDeposit;
        entity.lpMinDepositAmountFromWei = entity.lpMinDepositAmount.div(BigInt.fromI32(10 ** 18)).toString();
        entity.lpMaxDepositAmount = rel.value.getFundInfo().maxDeposit;
        entity.lpMaxDepositAmountFromWei = entity.lpMaxDepositAmount.div(BigInt.fromI32(10 ** 18)).toString();
        entity.fundRaiseStartTime = rel.value.getTimeInfo().startTime;
        entity.fundRaiseEndTime = rel.value.getTimeInfo().endTime;

        entity.priorityDepositEnable = rel.value.getPriorityDepositor().enable;

        entity.priorityDepositType = BigInt.fromI32(rel.value.getPriorityDepositor().valifyType);

        entity.priorityDepositTokenAddress = rel.value.getPriorityDepositor().tokenAddress;

        entity.priorityDepositTokenId = rel.value.getPriorityDepositor().tokenId;

        entity.priorityDepositAmount = rel.value.getPriorityDepositor().miniHolding;

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

        // entity.fundStartTime: BigInt! # uint256
        // entity.fundEndTime: BigInt! # uint256
        // entity.totalFund: BigInt! # uint256
        // entity.totalFundFromWei: String!
        // entity.fundRaiseType: BigInt # uint256
        // entity.fundRaiseTypeInString: String

        entity.daoAddr = event.params.daoAddr;
        entity.proposer = event.transaction.from;
        entity.proposalId = event.params.proposalId;
        entity.creationTime = event.block.timestamp;
        entity.stopVoteTime = rel.value.getStopVoteTime();
        entity.executeHash = Bytes.empty();
        entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        entity.save();
    }
}


export function handlerProposalProcessed(event: proposalExecuted): void {
    let entity = CollectiveFundRaiseProposalEntity.load(event.params.proposalId.toHexString());
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
        entity.executeHash = event.transaction.hash;
        entity.save();
    }

    let voteInfoEntity = CollectiveProposalVoteInfo.load(event.params.proposalId.toHexString());

    if (voteInfoEntity) {
        voteInfoEntity.nbYes = event.params.nbYes;
        voteInfoEntity.nbNo = event.params.nbNo;
        voteInfoEntity.totalWeights = event.params.allVotingWeight;
        voteInfoEntity.save();
    }
}