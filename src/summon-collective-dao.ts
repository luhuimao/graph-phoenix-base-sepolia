/*
 * @Descripttion: 
 * @version: 
 * @Author: huhuimao
 * @Date: 2023-01-05 19:50:32
 * @LastEditors: huhuimao
 * @LastEditTime: 2023-02-08 15:26:44
 */
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { DaoRegistry } from "../generated/SummonCollectiveDao/DaoRegistry";
import { CollectiveDaoCreated } from "../generated/SummonCollectiveDao/SummonCollectiveDao"
import { ColletiveGovernorManagementAdapterContract } from "../generated/SummonCollectiveDao/ColletiveGovernorManagementAdapterContract";
import {
    DaoEntiy,
    DaoEntityCounter,
    CollectiveDaoEntity,
    CollectiveDaoEntityCounter,
    CollectiveDaoGovernorMembershipEntity,
    CollectiveDaoVoteConfigEntity,
    CollectiveDaoInvestorCapacityEntity,
    CollectiveDaoFeeInfoEntity
} from "../generated/schema"

export function handleCollectiveDaoCreated(event: CollectiveDaoCreated): void {
    const daoContract = DaoRegistry.bind(event.params.daoAddr);
    const governorManagement_contractAddr = daoContract.getAdapterAddress(Bytes.fromHexString("0x1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe"));
    const governorContract = ColletiveGovernorManagementAdapterContract.bind(governorManagement_contractAddr);

    let entity = DaoEntiy.load(event.params.daoAddr.toHexString());
    let collectiveDaoGovernorMembershipEntity = CollectiveDaoGovernorMembershipEntity.load(event.params.daoAddr.toHexString());
    let collectiveDaoVoteConfigEntity = CollectiveDaoVoteConfigEntity.load(event.params.daoAddr.toHexString());
    let collectiveDaoFeeInfoEntity = CollectiveDaoFeeInfoEntity.load(event.params.daoAddr.toHexString());
    let fcounterEntity = DaoEntityCounter.load(event.address.toHexString());
    let collectiveDaoInvestorCapacityEntity = CollectiveDaoInvestorCapacityEntity.load(event.params.daoAddr.toHexString());

    if (!fcounterEntity) {
        fcounterEntity = new DaoEntityCounter(event.address.toHexString());
        fcounterEntity.count = BigInt.fromI32(0);
    }

    if (!entity) {
        entity = new DaoEntiy(event.params.daoAddr.toHexString())
        entity.daoAddr = event.params.daoAddr;
        entity.daoName = event.params.name;
        entity.creator = event.params.creator;
        entity.daoType = "collective";
        entity.createTimeStamp = event.block.timestamp;
        // entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
        entity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).
            toString();

        fcounterEntity.count = fcounterEntity.count.plus(BigInt.fromI32(1));
    }

    let collectiveDaoEntity = CollectiveDaoEntity.load(event.params.daoAddr.toHexString());
    let counterEntity = CollectiveDaoEntityCounter.load(event.address.toHexString());

    if (!counterEntity) {
        counterEntity = new CollectiveDaoEntityCounter(event.address.toHexString());
        counterEntity.count = BigInt.fromI32(0);
    }


    entity.save()
    fcounterEntity.save();

    if (!collectiveDaoEntity) {
        collectiveDaoEntity = new CollectiveDaoEntity(event.params.daoAddr.toHexString());
        // entity.daoType = "flex";
        // entity.save()

        collectiveDaoEntity.daoAddr = event.params.daoAddr;
        collectiveDaoEntity.daoName = event.params.name;
        collectiveDaoEntity.creator = event.params.creator;
        collectiveDaoEntity.createTimeStamp = event.block.timestamp;
        collectiveDaoEntity.createDateTime = new Date(event.block.timestamp.toI64() * 1000).toISOString();
        collectiveDaoEntity.collectiveDaoInvestorCapacityEntity = event.params.daoAddr.toHexString();
        collectiveDaoEntity.collectiveDaoVoteConfigEntity = event.params.daoAddr.toHexString();
        collectiveDaoEntity.collectiveGovernorMembership = event.params.daoAddr.toHexString();
        collectiveDaoEntity.collectiveDaoFeeInfoEntity = event.params.daoAddr.toHexString();
        collectiveDaoEntity.save();

        counterEntity.count = counterEntity.count.plus(BigInt.fromI32(1));
        counterEntity.save();
    }

    if (!collectiveDaoGovernorMembershipEntity) {
        collectiveDaoGovernorMembershipEntity = new CollectiveDaoGovernorMembershipEntity(event.params.daoAddr.toHexString());

        const COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x02049446ffbff09ad55d6fdb03c8c6027cf548332d30663e8fdf960abdab86ea"));
        const COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE = daoContract.getConfiguration(Bytes.fromHexString("0x09f0ac4191623c4a1e481e66bb865f218d9f5bcef4e65b597583a054b10182bc"));
        const COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING = daoContract.getConfiguration(Bytes.fromHexString("0x6bdd30ca7a0b5a78cdfd780fd2f234880048cafa893e9ccbc9f82df25cdc717f"));
        const COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x0567bf43e78d815625031c35adddd5d701cb6b913fbad3b625b4f8c00fdc42aa"));
        const COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID = daoContract.getConfiguration(Bytes.fromHexString("0x032de4639c5a8edd1ea478b1345b2d031f42ecd2b29442d3080c9ac0545b5f8e"));
        const COLLECTIVE_GOVERNOR_MEMBERSHIP_NAME = daoContract.getStringConfiguration(Bytes.fromHexString("0xe8c0cc8a9993875960b545b0c8b4b345a98d03a2c0ddf4b918a5ef119f5ab528"));


        const whitelist = governorContract.try_getGovernorWhitelist(event.params.daoAddr);
        let tem: string[] = [];

        if (!whitelist.reverted && whitelist.value.length > 0) {
            for (let j = 0; j < whitelist.value.length; j++) {
                tem.push(whitelist.value[j].toHexString())
            }
        }
        collectiveDaoGovernorMembershipEntity.daoAddr = event.params.daoAddr;
        collectiveDaoGovernorMembershipEntity.enable = COLLECTIVE_GOVERNOR_MEMBERSHIP_ENABLE == BigInt.fromI32(1) ? true : false;
        collectiveDaoGovernorMembershipEntity.name = COLLECTIVE_GOVERNOR_MEMBERSHIP_NAME;
        collectiveDaoGovernorMembershipEntity.varifyType = COLLECTIVE_GOVERNOR_MEMBERSHIP_TYPE;
        collectiveDaoGovernorMembershipEntity.minHolding = COLLECTIVE_GOVERNOR_MEMBERSHIP_MINI_HOLDING;
        collectiveDaoGovernorMembershipEntity.tokenAddress = COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ADDRESS;
        collectiveDaoGovernorMembershipEntity.tokenId = COLLECTIVE_GOVERNOR_MEMBERSHIP_TOKEN_ID;
        collectiveDaoGovernorMembershipEntity.whiteList = tem;
        collectiveDaoGovernorMembershipEntity.collectiveDaoEntity = event.params.daoAddr.toHexString();

        collectiveDaoGovernorMembershipEntity.save();
    }


    if (!collectiveDaoInvestorCapacityEntity) {
        collectiveDaoInvestorCapacityEntity = new CollectiveDaoInvestorCapacityEntity(event.params.daoAddr.toHexString());

        const MAX_INVESTORS_ENABLE = daoContract.getConfiguration(Bytes.fromHexString("0x69f4ffb3ebcb7809550bddd3e4d449a47e737bf6635bc7a730996643997b0e48"));
        const MAX_INVESTORS = daoContract.getConfiguration(Bytes.fromHexString("0xecbde689cc6337d29a750b8b8a8abbfa97427b4ac800ab55be2f2c87311510f2"));

        collectiveDaoInvestorCapacityEntity.daoAddr = event.params.daoAddr
        collectiveDaoInvestorCapacityEntity.enable = MAX_INVESTORS_ENABLE == BigInt.fromI32(1) ? true : false;
        collectiveDaoInvestorCapacityEntity.capacityAmount = MAX_INVESTORS;
        collectiveDaoInvestorCapacityEntity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        collectiveDaoInvestorCapacityEntity.save();
    }

    if (!collectiveDaoVoteConfigEntity) {
        collectiveDaoVoteConfigEntity = new CollectiveDaoVoteConfigEntity(event.params.daoAddr.toHexString());

        const votingPeriod = daoContract.getConfiguration(Bytes.fromHexString("0x9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc"));
        const support = daoContract.getConfiguration(Bytes.fromHexString("0xb4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df32"));
        const votingAsset = daoContract.getConfiguration(Bytes.fromHexString("0xeee23dc9ab95b6666db01c2b6cae6a5ef706099a25926e21e0a2e043fe885604"));
        const weightAlgorithm = daoContract.getConfiguration(Bytes.fromHexString("0xd093d4a34a12a221b19c0a6689d5449f1346aa769d15cca4e9782c36fda9339a"));
        const quorum = daoContract.getConfiguration(Bytes.fromHexString("0x0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e7"));
        const supportType = daoContract.getConfiguration(Bytes.fromHexString("0x1aeed2c0ea31fb81f41489b79a1d09374a270e0f9340ace7354cce77586a7d16"));
        const quorumType = daoContract.getConfiguration(Bytes.fromHexString("0e0434138ea29dceb1f2c0ca9b9f923f9d1c32d3d96bab2de9991f140daca712"));
        const COLLECTIVE_VOTING_GRACE_PERIOD = daoContract.getConfiguration(Bytes.fromHexString("0xb646599143db51c9136a4861a55f7140eab851836e3e1a42ba7804f5356a3655"));
        const COLLECTIVE_VOTING_EXECUTE_PERIOD = daoContract.getConfiguration(Bytes.fromHexString("0xada09015efb4d45310950167ce9728fe9635e3ef65b062ab8afb0ff348d76cad"));

        collectiveDaoVoteConfigEntity.daoAddr = event.params.daoAddr;
        collectiveDaoVoteConfigEntity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        collectiveDaoVoteConfigEntity.weightAlgorithm = weightAlgorithm;
        collectiveDaoVoteConfigEntity.votingPeriod = votingPeriod;
        collectiveDaoVoteConfigEntity.votingAsset = votingAsset;
        collectiveDaoVoteConfigEntity.support = support;
        collectiveDaoVoteConfigEntity.quorum = quorum;
        collectiveDaoVoteConfigEntity.supportType = supportType;
        collectiveDaoVoteConfigEntity.quorumType = quorumType;
        collectiveDaoVoteConfigEntity.gracePeriod = COLLECTIVE_VOTING_GRACE_PERIOD;
        collectiveDaoVoteConfigEntity.executingPeriod = COLLECTIVE_VOTING_EXECUTE_PERIOD;

        collectiveDaoVoteConfigEntity.save();
    }

    if (!collectiveDaoFeeInfoEntity) {
        collectiveDaoFeeInfoEntity = new CollectiveDaoFeeInfoEntity(event.params.daoAddr.toHexString());
        const COLLECTIVE_REDEMPT_FEE_AMOUNT = daoContract.getConfiguration(Bytes.fromHexString("0x51cc27e85946200c558b984a0c15cad2122655d647f9c02ebe9529f2a0b25a2f"));
        const COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT = daoContract.getConfiguration(Bytes.fromHexString("0xb035c58a9b643066fc5cd78a708da0456c36221a03ca174ff3b76d4306ff7c6c"));
        const COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT = daoContract.getConfiguration(Bytes.fromHexString("0x558062fa5fcc8623e6c743ab5b51793317989a5a93f03b32a485f94843f77da3"));
        // const FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS = daoContract.getAddressConfiguration(Bytes.fromHexString("0x8987d08c67963e4cacd5e5936c122a968c66853d58299dd822c1942227109839"));


        collectiveDaoFeeInfoEntity.daoAddr = event.params.daoAddr;
        // collectiveDaoFeeInfoEntity.feeReceiver = FLEX_MANAGEMENT_FEE_RECEIVE_ADDRESS;
        collectiveDaoFeeInfoEntity.collectiveDaoEntity = event.params.daoAddr.toHexString();
        collectiveDaoFeeInfoEntity.redemptionFeeAmount = COLLECTIVE_REDEMPT_FEE_AMOUNT;
        collectiveDaoFeeInfoEntity.proposerInvestTokenFeeAmount = COLLECTIVE_PROPOSER_INVEST_TOKEN_REWARD_AMOUNT;
        collectiveDaoFeeInfoEntity.proposerPayBackTokenFeeAmount = COLLECTIVE_PROPOSER_PAYBACK_TOKEN_REWARD_AMOUNT;
        collectiveDaoFeeInfoEntity.save();
    }

}