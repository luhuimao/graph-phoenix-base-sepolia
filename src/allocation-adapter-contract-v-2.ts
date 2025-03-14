/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-16 17:01:41
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-01-08 14:31:44
 */
import {
  AllocateToken as AllocateTokenEvent,
  ConfigureDao as ConfigureDaoEvent,
  AllocationAdapterContractV2,
  AllocationAdapterContractV2__vestingInfosResult
} from "../generated/AllocationAdapterContractV2/AllocationAdapterContractV2"
import { AllocateToken, ConfigureDao, VintageFundingProposal, UserVestInfo } from "../generated/schema"
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"

export function handleAllocateToken(event: AllocateTokenEvent): void {
  let entity = new AllocateToken(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.proposalId = event.params.proposalId
  entity.proposer = event.params.proposer

  let tem: Bytes[] = [];

  if (event.params.lps.length > 0) {
    for (var j = 0; j < event.params.lps.length; j++) {
      tem.push(event.params.lps[j])
    }
  }
  entity.lps = tem;
  entity.save()


  let fundingProposalEntity = VintageFundingProposal.load(event.params.proposalId.toString())
  if (fundingProposalEntity) {
    const vestingStartTime = fundingProposalEntity!.vestingStartTIme;
    const vestingCliffDuration = fundingProposalEntity!.vestingCliffDuration;
    const vestingStepDuration = fundingProposalEntity!.vestingStepDuration;
    const vestingSteps = fundingProposalEntity!.vestingSteps;

    let allocContract = AllocationAdapterContractV2.bind(event.address);

    for (var i = 0; i < entity.lps.length; i++) {
      let userVestInfo = new UserVestInfo(entity.proposalId.toString() + "-" + entity.lps[i].toHexString());
      userVestInfo.fundingProposalId = event.params.proposalId;
      userVestInfo.recipient = entity.lps[i];
      let vestInfo = allocContract.vestingInfos(Address.fromBytes(Bytes.fromHexString("0xd0a0582A8e82dC63056056188ED4406E45B84692")),
        userVestInfo.fundingProposalId,
        Address.fromBytes(userVestInfo.recipient));
      userVestInfo.vestingStartTime = vestingStartTime;
      userVestInfo.vestingCliffDuration = vestingCliffDuration;
      userVestInfo.vestingStepDuration = vestingStepDuration;
      userVestInfo.vestingSteps = vestingSteps;
      userVestInfo.totalAmount = vestInfo.getTokenAmount();
      userVestInfo.created = false;

      userVestInfo.save();
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
