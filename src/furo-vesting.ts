/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-16 16:58:55
 * @LastEditors: huhuimao
 * @LastEditTime: 2022-12-14 11:39:24
 */
/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2022-11-16 16:58:55
 * @LastEditors: huhuimao
 * @LastEditTime: 2022-11-24 13:06:13
 */
import { BigInt } from "@graphprotocol/graph-ts"
import {
  FuroVesting,
  CancelVesting,
  CreateVesting,
  LogUpdateOwner,
  OwnershipTransferred,
  Withdraw
} from "../generated/FuroVesting/FuroVesting"
import { VestEntity, UserVestInfo } from "../generated/schema"

export function handleCancelVesting(event: CancelVesting): void {


  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.PERCENTAGE_PRECISION(...)
  // - contract.owner(...)
  // - contract.pendingOwner(...)
  // - contract.tokenURIFetcher(...)
  // - contract.vestBalance(...)
  // - contract.vestIds(...)
  // - contract.vests(...)
  // - contract.wETH(...)
}

export function handleCreateVesting(event: CreateVesting): void {
  let entity = VestEntity.load(event.params.vestId.toString())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new VestEntity(event.params.vestId.toString())

    // Entity fields can be set using simple assignments
    // entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters

  entity.vestId = event.params.vestId
  entity.recipient = event.params.recipient
  entity.proposalId = event.params.proposalId
  entity.cliffShares = event.params.cliffShares
  entity.stepShares = event.params.stepShares
  entity.tokenAddress = event.params.token
  entity.startTime = event.params.start
  entity.cliffDuration = event.params.cliffDuration
  entity.stepDuration = event.params.stepDuration
  entity.steps = event.params.steps
  entity.totalAmount = entity.stepShares * entity.steps + entity.cliffShares;
  entity.claimedAmount = BigInt.fromI32(0);
  // Entities can be written to the store with `.save()`
  entity.save()

  let userVestInfo = UserVestInfo.load(entity.proposalId.toHexString() + "-" + entity.recipient.toHexString());
  if (userVestInfo) {
    userVestInfo.created = true;
    userVestInfo.save();
  }

}

export function handleLogUpdateOwner(event: LogUpdateOwner): void { }

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }

export function handleWithdraw(event: Withdraw): void {
  let entity = VestEntity.load(event.params.vestId.toString())
  if (entity) {
    let vestingContract = FuroVesting.bind(event.address);
    let vestInfo = vestingContract.vests(event.params.vestId);
    entity.claimedAmount = vestInfo.getClaimed();
    entity.save();
  }
}
