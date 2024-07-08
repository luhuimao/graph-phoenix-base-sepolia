import { BigInt, Bytes, log, Address } from "@graphprotocol/graph-ts"
import {
    CollectiveRedemptionFeeEscrowAdapterContract,
    EscrowFund,
    Withdraw
} from "../generated/CollectiveRedemptionFeeEscrowAdapterContract/CollectiveRedemptionFeeEscrowAdapterContract";
import { ColletiveGovernorManagementAdapterContract } from "../generated/CollectiveRedemptionFeeEscrowAdapterContract/ColletiveGovernorManagementAdapterContract";
import { ColletiveFundingPoolAdapterContract } from "../generated/CollectiveRedemptionFeeEscrowAdapterContract/ColletiveFundingPoolAdapterContract";
import { CollectiveInvestmentPoolExtension } from "../generated/CollectiveRedemptionFeeEscrowAdapterContract/CollectiveInvestmentPoolExtension";

import { DaoRegistry } from "../generated/CollectiveRedemptionFeeEscrowAdapterContract/DaoRegistry";

import {
    CollectiveRedemptionFeeEscrowEntity,
    CollectiveRedemptionFeeClaimedEntity,
    CollectiveMemberRedemptionFeeEntity
} from "../generated/schema"


export function handleEscrowFund(event: EscrowFund): void {
    let entity = CollectiveRedemptionFeeEscrowEntity.load(event.params.dao.toHexString() + event.params.tokenAddr.toHexString());
    if (!entity) {
        entity = new CollectiveRedemptionFeeEscrowEntity(event.params.dao.toHexString() + event.params.tokenAddr.toHexString());
        entity.amount = BigInt.zero();
    }

    entity.daoAddr = event.params.dao;
    entity.tokenAddr = event.params.tokenAddr;
    entity.amount = entity.amount.plus(event.params.amount);
    entity.save();

    const daoContract = DaoRegistry.bind(event.params.dao);
    // const collectiveFundingPoolAdapterContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    // const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);

    const governorContAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe"));
    const governorContr = ColletiveGovernorManagementAdapterContract.bind(governorContAddr);
    const allMembers = governorContr.try_getAllGovernor(event.params.dao);
    const contr = CollectiveRedemptionFeeEscrowAdapterContract.bind(event.address)
    if (!allMembers.reverted) {
        log.debug("allMembers: {}", [allMembers.value.length.toString()]);
        for (var j = 0; j < allMembers.value.length; j++) {
            let memberFeeEntity = CollectiveMemberRedemptionFeeEntity.load(
                event.params.dao.toHexString() +
                allMembers.value[j].toHexString() +
                event.params.tokenAddr.toHexString()
            );
            if (!memberFeeEntity) {
                memberFeeEntity = new CollectiveMemberRedemptionFeeEntity(
                    event.params.dao.toHexString() +
                    allMembers.value[j].toHexString() +
                    event.params.tokenAddr.toHexString());
                memberFeeEntity.amount = BigInt.zero();
                memberFeeEntity.daoAddr = event.params.dao;
                memberFeeEntity.tokenAddr = event.params.tokenAddr;
                memberFeeEntity.account = allMembers.value[j];
            }

            // const a = contr.try_getRedemptionFeeAmount(event.params.dao, event.params.tokenAddr, allMembers.value[j]);
            // log.debug("RedemptionFeeAmount reverted: {}", [a.reverted.toString()]);

            // if (!a.reverted) {
            //     memberFeeEntity.amount = a.value;
            //     log.debug("RedemptionFeeAmount: {}", [a.value.toString()]);
            // }

            memberFeeEntity.amount = getRedemptionFeeAmount(event.params.dao,
                event.params.tokenAddr,
                allMembers.value[j],
                event.address,
                event.block.number
            );

            // memberFeeEntity.amount = a.reverted ? BigInt.zero() : a.value;
            memberFeeEntity.save();
        }
    }

}

export function handleWithdraw(event: Withdraw): void {
    let entity = new CollectiveRedemptionFeeClaimedEntity(event.params.dao.toHexString() + event.transaction.from.toHexString() + event.params.tokenAddr.toHexString());

    entity.account = event.transaction.from;
    entity.amount = event.params.amount
    entity.daoAddr = event.params.dao;
    entity.tokenAddr = event.params.tokenAddr;
    entity.timeStamp = event.block.timestamp;
    entity.timeString = new Date(entity.timeStamp.toI64() * 1000).toISOString();
    entity.txHash = event.transaction.hash;
    entity.save();


    let memberFeeEntity = CollectiveMemberRedemptionFeeEntity.load(
        event.params.dao.toHexString() +
        event.transaction.from.toHexString() +
        event.params.tokenAddr.toHexString()
    );

    if (memberFeeEntity) {
        memberFeeEntity.amount = memberFeeEntity.amount.minus(event.params.amount);
        memberFeeEntity.save();
    }
}

function getRedemptionFeeAmount(
    dao: Address,
    tokenAddr: Address,
    account: Address,
    redContAddr: Address,
    currentBlock: BigInt
): BigInt {
    const daoContract = DaoRegistry.bind(dao);
    const collectiveInvestmentPoolExtensionAddr = daoContract.getExtensionAddress(Bytes.fromHexString("0x3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab"));
    const collectiveInvestmentPoolExtension = CollectiveInvestmentPoolExtension.bind(collectiveInvestmentPoolExtensionAddr);


    const collectiveFundingPoolAdapterContractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea"));
    const collectiveFundingPoolAdapterContract = ColletiveFundingPoolAdapterContract.bind(collectiveFundingPoolAdapterContractAddr);


    const redmCont = CollectiveRedemptionFeeEscrowAdapterContract.bind(redContAddr);
    const tem = redmCont.getBlockNumByTokenAddr(dao, tokenAddr);

    let total = BigInt.zero();

    if (tem.length > 0) {
        log.debug("BlockNums: {}", [tem.length.toString()]);
        for (var i = 0; i < tem.length; i++) {
            const pa = tem[i].ge(currentBlock) ? collectiveFundingPoolAdapterContract.balanceOf(dao, account) : collectiveInvestmentPoolExtension.getPriorAmount(
                account,
                tokenAddr,
                tem[i]
            );

            // const pa = collectiveInvestmentPoolExtension.getPriorAmount(
            //     account,
            //     tokenAddr,
            //     tem[i]
            // );

            const paPool = tem[i].ge(currentBlock) ? collectiveFundingPoolAdapterContract.poolBalance(dao) : collectiveInvestmentPoolExtension.getPriorAmount(
                Address.fromBytes(Bytes.fromHexString("0x000000000000000000000000000000000000decd")),
                tokenAddr,
                tem[i]
            );
            let redemptionFee = BigInt.zero();
            if (daoContract.getAllSteward().length == 1) {
                redemptionFee = redmCont.escrowedRedemptionFeeByBlockNum(
                    dao,
                    tem[i]);
            } else {
                if (paPool.gt(BigInt.zero())) {
                    redemptionFee =
                        pa.times(
                            redmCont.escrowedRedemptionFeeByBlockNum(dao,
                                tem[i]
                            )).div(
                                paPool);
                }
            }
            total = total.plus(redemptionFee);
        }
    }

    return total.minus(redmCont.withdrawAmount(dao, tokenAddr, account));
}