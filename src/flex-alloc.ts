/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-16 17:01:41
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-08 13:47:42
 */
import {
    AllocateToken as AllocateTokenEvent,
    ConfigureDao as ConfigureDaoEvent,
    FlexAllocationAdapterContract
} from "../generated/FlexAllocationAdapterContract/FlexAllocationAdapterContract"
import { DaoRegistry } from "../generated/FlexAllocationAdapterContract/DaoRegistry";
import {
    ConfigureDao,
    FlexInvestmentProposal,
    FlexVestingEligibleUsers,
    FlexUserVestInfo
} from "../generated/schema"
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"

export function handleAllocateToken(event: AllocateTokenEvent): void {
    let entity = FlexVestingEligibleUsers.load(event.params.proposalId.toHexString())
    if (!entity) {
        entity = new FlexVestingEligibleUsers(event.params.proposalId.toHexString())
    }

    entity.proposalId = event.params.proposalId
    entity.proposer = event.params.proposer

    let tem: string[] = [];

    if (event.params.lps.length > 0) {
        for (var j = 0; j < event.params.lps.length; j++) {
            tem.push(event.params.lps[j].toHexString())
        }
    }
    entity.lps = tem;
    entity.save()

    let flexInvstmentProposalEntity = FlexInvestmentProposal.load(event.params.proposalId.toHexString());
    let allocContract = FlexAllocationAdapterContract.bind(event.address);

    if (flexInvstmentProposalEntity) {
        const vestingStartTime = flexInvstmentProposalEntity.vestingStartTime;
        const vestingCliffEndTime = flexInvstmentProposalEntity.vestingCliffEndTime;
        const vestingInterval = flexInvstmentProposalEntity.vestingInterval;
        const vestingEndTime = flexInvstmentProposalEntity.vestingEndTime;

        //investors 
        for (var i = 0; i < entity.lps.length; i++) {
            let flexUserVestInfo = new FlexUserVestInfo(entity.proposalId.toHexString() + "-" + entity.lps[i]);
            flexUserVestInfo.daoAddr = event.params.daoAddr;
            flexUserVestInfo.investmentProposalId = event.params.proposalId;
            flexUserVestInfo.recipient = Bytes.fromHexString(entity.lps[i]);
            flexUserVestInfo.originalRecipient = flexUserVestInfo.recipient;
            const paybackAmount = allocContract.getInvestmentRewards(
                event.params.daoAddr,
                event.params.proposalId,
                Address.fromBytes(flexUserVestInfo.recipient)
            );
            flexUserVestInfo.vestingStartTime = vestingStartTime;
            flexUserVestInfo.vestingCliffEndTime = vestingCliffEndTime;
            flexUserVestInfo.vestingInterval = vestingInterval;
            flexUserVestInfo.vestingEndTime = vestingEndTime;
            flexUserVestInfo.totalAmount = paybackAmount;
            flexUserVestInfo.created = false;
            flexUserVestInfo.tokenAddress = flexInvstmentProposalEntity.paybackTokenAddr;
            flexUserVestInfo.save();
        }

        //management fee
        const dao = DaoRegistry.bind(event.params.daoAddr);
        const managementFeeAddress = dao.getAddressConfiguration(Bytes.fromHexString("0x8987d08c67963e4cacd5e5936c122a968c66853d58299dd822c1942227109839"));
        const vestInfo = allocContract.vestingInfos(
            event.params.daoAddr,
            event.params.proposalId,
            managementFeeAddress
        );

        if (vestInfo.getTokenAmount() > BigInt.fromI32(0)) {
            let flexUserVestInfo = FlexUserVestInfo.load(entity.proposalId.toHexString() + "-" + managementFeeAddress.toHexString());
            if (!flexUserVestInfo) {
                let flexUserVestInfo = new FlexUserVestInfo(entity.proposalId.toHexString() + "-" + managementFeeAddress.toHexString());
                flexUserVestInfo.daoAddr = event.params.daoAddr;
                flexUserVestInfo.investmentProposalId = event.params.proposalId;
                flexUserVestInfo.recipient = managementFeeAddress;
                flexUserVestInfo.originalRecipient = flexUserVestInfo.recipient;
                flexUserVestInfo.vestingStartTime = vestingStartTime;
                flexUserVestInfo.vestingCliffEndTime = vestingCliffEndTime;
                flexUserVestInfo.vestingInterval = vestingInterval;
                flexUserVestInfo.vestingEndTime = vestingEndTime;
                flexUserVestInfo.totalAmount = vestInfo.getTokenAmount();
                flexUserVestInfo.created = false;
                flexUserVestInfo.tokenAddress = flexInvstmentProposalEntity.paybackTokenAddr;

                flexUserVestInfo.save();
            } else {
                flexUserVestInfo.totalAmount = flexUserVestInfo.totalAmount.plus(vestInfo.getTokenAmount());
                flexUserVestInfo.save();
            }
        }

        //proposer payback token reward
        const proposerVestInfo = allocContract.vestingInfos(
            event.params.daoAddr,
            event.params.proposalId,
            event.params.proposer
        );

        if (proposerVestInfo.getTokenAmount() > BigInt.fromI32(0)) {
            let flexUserVestInfo = FlexUserVestInfo.load(entity.proposalId.toHexString() + "-" + event.params.proposer.toHexString());
            if (!flexUserVestInfo) {
                let flexUserVestInfo = new FlexUserVestInfo(entity.proposalId.toHexString() + "-" + event.params.proposer.toHexString());
                flexUserVestInfo.daoAddr = event.params.daoAddr;
                flexUserVestInfo.investmentProposalId = event.params.proposalId;
                flexUserVestInfo.recipient = event.params.proposer;
                flexUserVestInfo.originalRecipient = flexUserVestInfo.recipient;
                flexUserVestInfo.vestingStartTime = vestingStartTime;
                flexUserVestInfo.vestingCliffEndTime = vestingCliffEndTime;
                flexUserVestInfo.vestingInterval = vestingInterval;
                flexUserVestInfo.vestingEndTime = vestingEndTime;
                flexUserVestInfo.totalAmount = proposerVestInfo.getTokenAmount();
                flexUserVestInfo.created = false;
                flexUserVestInfo.tokenAddress = flexInvstmentProposalEntity.paybackTokenAddr;

                flexUserVestInfo.save();
            } else {
                if (event.params.proposer.toHexString() != managementFeeAddress.toHexString())
                    flexUserVestInfo.totalAmount = flexUserVestInfo.totalAmount.plus(proposerVestInfo.getTokenAmount());
                flexUserVestInfo.save();
            }
        }
    }

}

export function handleConfigureDao(event: ConfigureDaoEvent): void {
    let entity = new ConfigureDao(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    )
    entity.gpAllocationBonusRadio = event.params.gpAllocationBonusRadio
    entity.riceStakeAllocationRadio = event.params.riceStakeAllocationRadio
    entity.save()
}
