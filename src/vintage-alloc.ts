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
    ConfigureDao as ConfigureDaoEvent,
    VintageAllocationAdapterContract
} from "../generated/VintageAllocationAdapterContract/VintageAllocationAdapterContract"
import {
    DaoRegistry
} from "../generated/VintageAllocationAdapterContract/DaoRegistry";
import {
    VintageInvestmentProposalInfo,
    VintageVestingEligibleUsers,
    VintageUserVestInfo
} from "../generated/schema"
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"

export function handleAllocateToken(event: AllocateTokenEvent): void {
    let entity = VintageVestingEligibleUsers.load(event.params.proposalId.toHexString())
    if (!entity) {
        entity = new VintageVestingEligibleUsers(event.params.proposalId.toHexString())
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


    let vintageFundingProposalEntity = VintageInvestmentProposalInfo.load(event.params.proposalId.toHexString())
    if (vintageFundingProposalEntity) {
        const vestingStartTime = vintageFundingProposalEntity.vestingStartTime;
        const vestingCliffEndTime = vintageFundingProposalEntity.vestingCliffEndTime;
        const vestingInterval = vintageFundingProposalEntity.vestingInterval;
        const vestingEndTime = vintageFundingProposalEntity.vetingEndTime;

        let allocContract = VintageAllocationAdapterContract.bind(event.address);

        //investors
        for (var i = 0; i < entity.lps.length; i++) {
            let vintageUserVestInfo = new VintageUserVestInfo(entity.proposalId.toHexString() + "-" + entity.lps[i]);
            vintageUserVestInfo.daoAddr = event.params.daoAddr;
            vintageUserVestInfo.investmentProposalId = event.params.proposalId;
            vintageUserVestInfo.recipient = Bytes.fromHexString(entity.lps[i]);
            // let vestInfo = allocContract.vestingInfos(
            //     event.params.daoAddr,
            //     vintageUserVestInfo.fundingProposalId,
            //     Address.fromBytes(vintageUserVestInfo.recipient)
            // );
            const paybackAmount = allocContract.getInvestmentRewards(event.params.daoAddr,
                Address.fromBytes(vintageUserVestInfo.recipient),
                event.params.proposalId
            );
            vintageUserVestInfo.vestingStartTime = vestingStartTime;
            vintageUserVestInfo.vestingCliffEndTime = vestingCliffEndTime;
            vintageUserVestInfo.vestingInterval = vestingInterval;
            vintageUserVestInfo.vestingEndTime = vestingEndTime;
            vintageUserVestInfo.totalAmount = paybackAmount;
            vintageUserVestInfo.totalAmountFromWei = vintageUserVestInfo.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
            vintageUserVestInfo.created = false;
            vintageUserVestInfo.tokenAddress= vintageFundingProposalEntity.paybackToken;
            vintageUserVestInfo.save();
        }
        const daoCont = DaoRegistry.bind(event.params.daoAddr);
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
            let vintageUserVestInfo = VintageUserVestInfo.load(entity.proposalId.toHexString() + "-" + managementFeeAddr.toHexString());
            if (!vintageUserVestInfo) {
                vintageUserVestInfo = new VintageUserVestInfo(entity.proposalId.toHexString() + "-" + managementFeeAddr.toHexString());
                vintageUserVestInfo.daoAddr = event.params.daoAddr;
                vintageUserVestInfo.investmentProposalId = event.params.proposalId;
                vintageUserVestInfo.recipient = managementFeeAddr;
                vintageUserVestInfo.vestingStartTime = vestingStartTime;
                vintageUserVestInfo.vestingCliffEndTime = vestingCliffEndTime;
                vintageUserVestInfo.vestingInterval = vestingInterval;
                vintageUserVestInfo.vestingEndTime = vestingEndTime;
                vintageUserVestInfo.totalAmount = vestInfo.getTokenAmount();
                vintageUserVestInfo.totalAmountFromWei = vintageUserVestInfo.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
                vintageUserVestInfo.created = false;
                vintageUserVestInfo.tokenAddress= vintageFundingProposalEntity.paybackToken;

                vintageUserVestInfo.save();
            } else {
                vintageUserVestInfo.totalAmount = vintageUserVestInfo.totalAmount.plus(vestInfo.getTokenAmount());
                vintageUserVestInfo.totalAmountFromWei = vintageUserVestInfo.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
                vintageUserVestInfo.save();
            }

        }

        //proposer rewards
        vestInfo = allocContract.vestingInfos(
            event.params.daoAddr,
            event.params.proposalId,
            Address.fromBytes(vintageFundingProposalEntity.proposer)
        );
        if (vestInfo.getTokenAmount().gt(BigInt.fromI32(0))) {
            let vintageUserVestInfo = VintageUserVestInfo.load(entity.proposalId.toHexString() + "-" + vintageFundingProposalEntity.proposer.toHexString());
            if (!vintageUserVestInfo) {
                vintageUserVestInfo = new VintageUserVestInfo(entity.proposalId.toHexString() + "-" + vintageFundingProposalEntity.proposer.toHexString());
                vintageUserVestInfo.daoAddr = event.params.daoAddr;
                vintageUserVestInfo.investmentProposalId = event.params.proposalId;
                vintageUserVestInfo.recipient = vintageFundingProposalEntity.proposer;
                vintageUserVestInfo.vestingStartTime = vestingStartTime;
                vintageUserVestInfo.vestingCliffEndTime = vestingCliffEndTime;
                vintageUserVestInfo.vestingInterval = vestingInterval;
                vintageUserVestInfo.vestingEndTime = vestingEndTime;
                vintageUserVestInfo.totalAmount = vestInfo.getTokenAmount();
                vintageUserVestInfo.totalAmountFromWei = vintageUserVestInfo.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
                vintageUserVestInfo.created = false;
                vintageUserVestInfo.tokenAddress= vintageFundingProposalEntity.paybackToken;
                vintageUserVestInfo.save();
                
            } else {
                vintageUserVestInfo.totalAmount = vintageUserVestInfo.totalAmount.plus(vestInfo.getTokenAmount());
                vintageUserVestInfo.totalAmountFromWei = vintageUserVestInfo.totalAmount.div(BigInt.fromI64(10 ** 18)).toString();
                vintageUserVestInfo.save();
            }
        }
    }
}

export function handleConfigureDao(event: ConfigureDaoEvent): void { }

