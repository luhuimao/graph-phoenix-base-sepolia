/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-16 17:01:41
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-10-08 13:46:14
 */
import {
    AllocateToken as AllocateTokenEvent,
    CollectiveAllocationAdapterContract
} from "../generated/CollectiveAllocationAdapterContract/CollectiveAllocationAdapterContract"
import {
    DaoRegistry
} from "../generated/VintageAllocationAdapterContract/DaoRegistry";
import {
    CollectiveInvestmentProposalEntity,
    CollectiveVestingEligibleUsers,
    CollectiveUserVestInfo
} from "../generated/schema"
// import { ERC20 } from "../generated/ManualVesting/ERC20";
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"

export function handleAllocateToken(event: AllocateTokenEvent): void {
    let entity = CollectiveVestingEligibleUsers.load(event.params.proposalId.toHexString())
    if (!entity) {
        entity = new CollectiveVestingEligibleUsers(event.params.proposalId.toHexString())
    }
    const daoCont = DaoRegistry.bind(event.params.daoAddr);

    entity.proposalId = event.params.proposalId
    entity.proposer = event.params.proposer

    let tem: string[] = [];
    const rel = daoCont.try_getAllSteward();
    if (!rel.reverted && rel.value.length > 0) {
        for (var j = 0; j < rel.value.length; j++) {
            tem.push(rel.value[j].toHexString())
        }
    }

    entity.lps = tem;
    entity.save()


    let vintageFundingProposalEntity = CollectiveInvestmentProposalEntity.load(event.params.proposalId.toHexString())
    if (vintageFundingProposalEntity) {
        const vestingStartTime = vintageFundingProposalEntity.vestingStartTime;
        const vestingCliffEndTime = vintageFundingProposalEntity.cliffEndTime;
        const vestingInterval = vintageFundingProposalEntity.vestingInterval;
        const vestingEndTime = vintageFundingProposalEntity.vestingEndTime;

        let allocContract = CollectiveAllocationAdapterContract.bind(event.address);
        // const paybackTokenDecimals = ERC20.bind(Address.fromBytes(vintageFundingProposalEntity.paybackToken)).decimals();
        //investors
        for (var i = 0; i < entity.lps.length; i++) {
            let collectiveUserVestInfo = new CollectiveUserVestInfo(entity.proposalId.toHexString() + "-" + entity.lps[i]);
            collectiveUserVestInfo.daoAddr = event.params.daoAddr;
            collectiveUserVestInfo.investmentProposalId = event.params.proposalId;
            collectiveUserVestInfo.recipient = Bytes.fromHexString(entity.lps[i]);
            collectiveUserVestInfo.originalRecipient = collectiveUserVestInfo.recipient;
            let paybackAmount = BigInt.zero();;
            const rel = allocContract.try_getInvestmentRewards(event.params.daoAddr,
                Address.fromBytes(collectiveUserVestInfo.recipient),
                event.params.proposalId
            );
            if (!rel.reverted) paybackAmount = rel.value;
            collectiveUserVestInfo.vestingStartTime = vestingStartTime;
            collectiveUserVestInfo.vestingCliffEndTime = vestingCliffEndTime;
            collectiveUserVestInfo.vestingInterval = vestingInterval;
            collectiveUserVestInfo.vestingEndTime = vestingEndTime;
            collectiveUserVestInfo.totalAmount = paybackAmount;
            collectiveUserVestInfo.totalAmountFromWei = ""// collectiveUserVestInfo.totalAmount.div(BigInt.fromI64(10 ** (paybackTokenDecimals))).toString();
            collectiveUserVestInfo.created = false;
            collectiveUserVestInfo.tokenAddress = vintageFundingProposalEntity.paybackToken;
            collectiveUserVestInfo.save();
        }
        const managementFeeAddr = daoCont.getAddressConfiguration(
            Address.fromHexString("0x5460409b9aa4688f80c10b29c3d7ad16025f050f472a6882a45fa7bb9bd12fb1")
        );
        //payback token for management fee
        let vestInfo = allocContract.vestingInfos(
            event.params.daoAddr,
            event.params.proposalId,
            managementFeeAddr
        );
        //payback token reward
        if (vestInfo.getTokenAmount().gt(BigInt.fromI32(0))) {
            let collectiveUserVestInfo = CollectiveUserVestInfo.load(entity.proposalId.toHexString() + "-" + managementFeeAddr.toHexString());
            if (!collectiveUserVestInfo) {
                collectiveUserVestInfo = new CollectiveUserVestInfo(entity.proposalId.toHexString() + "-" + managementFeeAddr.toHexString());
                collectiveUserVestInfo.daoAddr = event.params.daoAddr;
                collectiveUserVestInfo.investmentProposalId = event.params.proposalId;
                collectiveUserVestInfo.recipient = managementFeeAddr;
                collectiveUserVestInfo.originalRecipient = collectiveUserVestInfo.recipient;
                collectiveUserVestInfo.vestingStartTime = vestingStartTime;
                collectiveUserVestInfo.vestingCliffEndTime = vestingCliffEndTime;
                collectiveUserVestInfo.vestingInterval = vestingInterval;
                collectiveUserVestInfo.vestingEndTime = vestingEndTime;
                collectiveUserVestInfo.totalAmount = vestInfo.getTokenAmount();
                collectiveUserVestInfo.totalAmountFromWei = ""// collectiveUserVestInfo.totalAmount.div(BigInt.fromI64(10 ** (paybackTokenDecimals))).toString();
                collectiveUserVestInfo.created = false;
                collectiveUserVestInfo.tokenAddress = vintageFundingProposalEntity.paybackToken;

                collectiveUserVestInfo.save();
            } else {
                collectiveUserVestInfo.totalAmount = collectiveUserVestInfo.totalAmount.plus(vestInfo.getTokenAmount());
                collectiveUserVestInfo.totalAmountFromWei = ""// collectiveUserVestInfo.totalAmount.div(BigInt.fromI64(10 ** (paybackTokenDecimals))).toString();
                collectiveUserVestInfo.save();
            }

        }

        //proposer rewards
        vestInfo = allocContract.vestingInfos(
            event.params.daoAddr,
            event.params.proposalId,
            Address.fromBytes(vintageFundingProposalEntity.proposer)
        );
        if (vestInfo.getTokenAmount().gt(BigInt.fromI32(0))) {
            let collectiveUserVestInfo = CollectiveUserVestInfo.load(entity.proposalId.toHexString() + "-" + vintageFundingProposalEntity.proposer.toHexString());
            if (!collectiveUserVestInfo) {
                collectiveUserVestInfo = new CollectiveUserVestInfo(entity.proposalId.toHexString() + "-" + vintageFundingProposalEntity.proposer.toHexString());
                collectiveUserVestInfo.daoAddr = event.params.daoAddr;
                collectiveUserVestInfo.investmentProposalId = event.params.proposalId;
                collectiveUserVestInfo.recipient = vintageFundingProposalEntity.proposer;
                collectiveUserVestInfo.originalRecipient = collectiveUserVestInfo.recipient;
                collectiveUserVestInfo.vestingStartTime = vestingStartTime;
                collectiveUserVestInfo.vestingCliffEndTime = vestingCliffEndTime;
                collectiveUserVestInfo.vestingInterval = vestingInterval;
                collectiveUserVestInfo.vestingEndTime = vestingEndTime;
                collectiveUserVestInfo.totalAmount = vestInfo.getTokenAmount();
                collectiveUserVestInfo.totalAmountFromWei = ""//collectiveUserVestInfo.totalAmount.div(BigInt.fromI64(10 ** (paybackTokenDecimals))).toString();
                collectiveUserVestInfo.created = false;
                collectiveUserVestInfo.tokenAddress = vintageFundingProposalEntity.paybackToken;

                collectiveUserVestInfo.save();
            } else {
                collectiveUserVestInfo.totalAmount = collectiveUserVestInfo.totalAmount.plus(vestInfo.getTokenAmount());
                collectiveUserVestInfo.totalAmountFromWei = ""// collectiveUserVestInfo.totalAmount.div(BigInt.fromI64(10 ** (paybackTokenDecimals))).toString();
                collectiveUserVestInfo.save();
            }
        }
    }
}


