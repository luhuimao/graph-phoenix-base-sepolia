import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import {
    ColletiveTopUpProposalAdapterContract,
    ProposalCreated,
    ProposalProcessed,
    StartVoting
} from "../generated/ColletiveTopUpProposalAdapterContract/ColletiveTopUpProposalAdapterContract"
import {
    CollectiveTopUpProposalEntity,
    CollectiveProposalVoteInfo,
    CollectiveDaoStatisticEntity,
    CollectiveFundRaisedEntity
} from "../generated/schema"
import { ERC20 } from "../generated/ColletiveTopUpProposalAdapterContract/ERC20";
import { CollectiveVotingAdapterContract } from "../generated/ColletiveGovernorManagementAdapterContract/CollectiveVotingAdapterContract"
import { DaoRegistry } from "../generated/ColletiveGovernorManagementAdapterContract/DaoRegistry";
// import { ColletiveFundingPoolAdapterContract } from "../generated/ColletiveGovernorManagementAdapterContract/ColletiveFundingPoolAdapterContract";
import { newCollectiveProposalVoteInfoEntity } from "./collective-clear-fund-proposal";

export function handleProposalCreated(event: ProposalCreated): void {
    const daoContract = DaoRegistry.bind(event.params.daoAddr);

    const collectiveVotingAdapterContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae"));
    const collectiveVotingAdapterContract = CollectiveVotingAdapterContract.bind(collectiveVotingAdapterContractAddr);
    // const collectiveFundingPoolAdapterContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    // const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);
    let entity = new CollectiveTopUpProposalEntity(event.params.proposalId.toHexString());
    const topupCon = ColletiveTopUpProposalAdapterContract.bind(event.address);
    const rel = topupCon.try_proposals(event.params.daoAddr, event.params.proposalId);
    if (!rel.reverted) {
        entity.daoAddr = event.params.daoAddr;
        entity.proposalId = event.params.proposalId;
        entity.account = rel.value.getAccount();
        entity.amount = rel.value.getAmount();
        entity.creationTime = rel.value.getCreationTime();
        entity.state = BigInt.fromI32(rel.value.getState());
        entity.stopVoteTime = rel.value.getStopVoteTime();
        entity.token = rel.value.getToken();
    }
    entity.executeHash = Bytes.empty();
    entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
    // const bal = collectiveFundingPoolAdapterContract.balanceOf(event.params.daoAddr, Address.fromBytes(entity.account));

    const votingPowerToBeAllocated = collectiveVotingAdapterContract.try_getVotingWeightByDepositAmount(
        event.params.daoAddr,
        entity.amount
    )
    entity.votingPowerToBeAllocated = votingPowerToBeAllocated.reverted ? BigInt.zero() : votingPowerToBeAllocated.value;
    entity.save();

    newCollectiveProposalVoteInfoEntity(event.params.daoAddr, event.params.proposalId);
}

export function handleProposalProcessed(event: ProposalProcessed): void {
    let entity = CollectiveTopUpProposalEntity.load(event.params.proposalId.toHexString());
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
        entity.executeHash = event.transaction.hash;
        entity.save();

        if (event.params.state == 3) {
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

            collectiveDaoStatisticEntity.fundRaised = collectiveDaoStatisticEntity.fundRaised.plus(entity.amount);
            collectiveDaoStatisticEntity.fundRaisedFromWei = collectiveDaoStatisticEntity.fundRaised.div(BigInt.fromI64(10 ** 18)).toString();
            collectiveDaoStatisticEntity.save();

            let collectiveFundRaisedEntity = CollectiveFundRaisedEntity.load(event.params.daoAddr.toHexString() + entity.token.toHexString());
            if (!collectiveFundRaisedEntity) {
                const erc20 = ERC20.bind(Address.fromBytes(entity.token));
                collectiveFundRaisedEntity = new CollectiveFundRaisedEntity(event.params.daoAddr.toHexString() + entity.token.toHexString());
                collectiveFundRaisedEntity.daoAddr = event.params.daoAddr;
                collectiveFundRaisedEntity.tokenAddress = entity.token;
                collectiveFundRaisedEntity.raisedAmount = BigInt.zero();
                collectiveFundRaisedEntity.tokenName = erc20.name();
                collectiveFundRaisedEntity.tokenSymbol = erc20.symbol();
                collectiveFundRaisedEntity.tokenDecimals = BigInt.fromI32(erc20.decimals());
                collectiveFundRaisedEntity.investedAmount = BigInt.zero();
                collectiveFundRaisedEntity.investedAmountFromWei = "";
            }
            if (collectiveFundRaisedEntity) {
                collectiveFundRaisedEntity.raisedAmount = collectiveFundRaisedEntity.raisedAmount.plus(entity.amount);
                collectiveFundRaisedEntity.raisedAmountFromWei = collectiveFundRaisedEntity.raisedAmount.div(BigInt.fromI64
                    (10 ** (collectiveFundRaisedEntity.tokenDecimals.toI32()))).toString();
                collectiveFundRaisedEntity.save();
            }
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

export function handleStartVoting(event: StartVoting): void {
    let entity = CollectiveTopUpProposalEntity.load(event.params.proposalId.toHexString());
    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
        const topupCon = ColletiveTopUpProposalAdapterContract.bind(event.address);
        const rel = topupCon.try_proposals(event.params.daoAddr, event.params.proposalId);
        if (!rel.reverted) {
            entity.stopVoteTime = rel.value.getStopVoteTime();
        }
        entity.save();
    }
}