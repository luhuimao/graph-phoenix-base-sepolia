/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
    * @Date: 2022 - 11 - 22 15: 32:03
        * @LastEditors: huhuimao
            * @LastEditTime: 2023 - 10 - 16 14: 28: 21
                */
import { BigInt, Bytes, Address, log, bigInt, Entity } from "@graphprotocol/graph-ts"
import {
    ColletiveClearFundProposalAdapterContract,
    ProposalCreated,
    ProposalProcessed
} from "../generated/ColletiveClearFundProposalAdapterContract/ColletiveClearFundProposalAdapterContract";
import { DaoRegistry } from "../generated/ColletiveClearFundProposalAdapterContract/DaoRegistry";
import { ColletiveFundingPoolAdapterContract } from "../generated/ColletiveClearFundProposalAdapterContract/ColletiveFundingPoolAdapterContract";
import { ColletiveFundRaiseProposalAdapterContract } from "../generated/ColletiveClearFundProposalAdapterContract/ColletiveFundRaiseProposalAdapterContract";
import { CollectiveInvestmentPoolExtension } from "../generated/ColletiveClearFundProposalAdapterContract/CollectiveInvestmentPoolExtension";
import {
    CollectiveClearFundProposalEntity,
    CollectiveProposalVoteInfo
} from "../generated/schema"


export function handleProposalCreated(event: ProposalCreated): void {
    let entity = CollectiveClearFundProposalEntity.load(event.params.proposalId.toHexString())
    const colletiveClearFundProposalAdapterContract = ColletiveClearFundProposalAdapterContract.bind(event.address);
    const rel = colletiveClearFundProposalAdapterContract.try_proposals(event.params.daoAddr, event.params.proposalId);

    const daoContract = DaoRegistry.bind(event.params.daoAddr);
    const collectiveFundRaiseProposalAdapterContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b"));

    const collectiveInvestmentPoolExtensionAddr = daoContract.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"));
    const collectiveInvestmentPoolExtension = CollectiveInvestmentPoolExtension.bind(collectiveInvestmentPoolExtensionAddr);
    const collectiveFundRaiseProposalAdapterContract = ColletiveFundRaiseProposalAdapterContract.bind(collectiveFundRaiseProposalAdapterContractAddr);
    const collectiveFundingPoolAdapterContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);
    const fundRaiseProposalID = collectiveFundRaiseProposalAdapterContract.lastProposalIds(event.params.daoAddr)
    const fundRaisedAmount = collectiveFundingPoolAdapterContract.try_fundRaisedByProposalId(event.params.daoAddr, fundRaiseProposalID)
    const fundRaiseToken = collectiveInvestmentPoolExtension.getFundRaisingTokenAddress();
    let stopVotingTime: BigInt = BigInt.fromI32(0);
    if (!rel.reverted) stopVotingTime = rel.value.getStopVoteTime();
    if (!entity) {
        entity = new CollectiveClearFundProposalEntity(event.params.proposalId.toHexString())
    }
    entity.daoAddr = event.params.daoAddr;
    entity.proposalId = event.params.proposalId;
    entity.creationTime = event.block.timestamp;
    entity.stopVotingTime = stopVotingTime;
    entity.proposer = event.transaction.from;
    entity.state = BigInt.fromI32(0);
    entity.executeTime = BigInt.fromI32(0);
    entity.executeHash = Bytes.empty();
    entity.amount = !fundRaisedAmount.reverted ? fundRaisedAmount.value : BigInt.fromI32(0);
    entity.currencyAddr = fundRaiseToken;
    entity.collectiveDaoEntity = event.params.daoAddr.toHexString();
    entity.save();
}

export function handleProposalExecuted(event: ProposalProcessed): void {
    let entity = CollectiveClearFundProposalEntity.load(event.params.proposalId.toHexString());

    if (entity) {
        entity.state = BigInt.fromI32(event.params.state);
        entity.executeTime = event.block.timestamp;
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