import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { InvestmentReceiptERC721, Minted, Transfer } from "../generated/InvestmentReceiptERC721/InvestmentReceiptERC721"
import {
    InvestmentReceiptNFTHolderEntity,
    InvestmentReceiptNFTTokenIdEntity,
    InvestmentReceiptNFTProposalIdEntity,
    InvestmentReceiptNFTMintersEntity
} from "../generated/schema"

export function handleMinted(event: Minted): void {
    let entity = InvestmentReceiptNFTTokenIdEntity.load(event.params.proposalId.toHexString());
    const investmentReceiptERC721Contr = InvestmentReceiptERC721.bind(event.address);
    const rel = investmentReceiptERC721Contr.try_tokenIdToInvestmentProposalInfo(event.params.tokenId);
    const share = !rel.reverted ?
        rel.value.getMyInvestedAmount().times(BigInt.fromI64(10 ** 18)).div(rel.value.getTotalInvestedAmount()) :
        BigInt.zero();

    let tem: BigInt[] = [];
    let tem4: BigInt[] = [];
    if (!entity) {
        entity = new InvestmentReceiptNFTTokenIdEntity(event.params.proposalId.toHexString());
        entity.proposalId = event.params.proposalId;
        tem.push(event.params.tokenId);
        tem4.push(share);
    } else {
        if (entity.tokenIds.length > 0) {
            for (let j = 0; j < entity.tokenIds.length; j++) {
                tem.push(entity.tokenIds[j]);
                tem4.push(entity.shares[j]);
            }
        }
        tem.push(event.params.tokenId);
        tem4.push(share);
    }
    entity.tokenIds = tem;
    entity.shares = tem4;
    entity.save();

    let holderentity = InvestmentReceiptNFTHolderEntity.load(event.params.proposalId.toHexString());
    let tem1: string[] = [];
    if (!holderentity) {
        holderentity = new InvestmentReceiptNFTHolderEntity(event.params.proposalId.toHexString());
        holderentity.proposalId = event.params.proposalId;
        tem1.push(event.params.minter.toHexString());
    } else {
        if (holderentity.holders.length > 0) {
            for (let j = 0; j < holderentity.holders.length; j++) {
                tem1.push(holderentity.holders[j])
            }
            if (!contains(tem1, event.params.minter.toHexString()))
                tem1.push(event.params.minter.toHexString());
        }
    }
    holderentity.holders = tem1;
    holderentity.save();

    let proposalEntity = InvestmentReceiptNFTProposalIdEntity.load(event.address.toHexString());
    let tem2: string[] = [];
    if (!proposalEntity) {
        proposalEntity = new InvestmentReceiptNFTProposalIdEntity(event.address.toHexString());
        tem2.push(event.params.proposalId.toHexString());
    } else {
        if (proposalEntity.proposalIds.length > 0) {
            for (let j = 0; j < proposalEntity.proposalIds.length; j++) {
                tem2.push(proposalEntity.proposalIds[j].toHexString())
            }

        }
        if (!contains(tem2, event.params.proposalId.toHexString()))
            tem2.push(event.params.proposalId.toHexString());

        proposalEntity.save();
    }

    let minterEntity = InvestmentReceiptNFTMintersEntity.load(event.params.proposalId.toHexString());
    let tem3: string[] = [];
    if (!minterEntity) {
        minterEntity = new InvestmentReceiptNFTMintersEntity(event.params.proposalId.toHexString());
        minterEntity.proposalId = event.params.proposalId;
        tem3.push(event.params.minter.toHexString())
    } else {
        if (minterEntity.minters && minterEntity.minters.length > 0) {
            for (let j = 0; j < minterEntity.minters.length; j++) {
                tem3.push(minterEntity.minters[j])
            }
            if (!contains(tem3, event.params.minter.toHexString()))
                tem3.push(event.params.minter.toHexString());
        }
    }

    minterEntity.minters = tem3;
    minterEntity.save();
}

export function handleTransfer(event: Transfer): void {
    const contr = InvestmentReceiptERC721.bind(event.address)
    // let proposalEntity = InvestmentReceiptNFTProposalIdEntity.load(event.address.toHexString());
    const rel = contr.try_tokenIdToInvestmentProposalId(event.params.id);
    let iproposalId = !rel.reverted ? rel.value : Bytes.empty();

    // if (proposalEntity) {
    //     if (proposalEntity.proposalIds.length > 0) {
    //         for (let j = 0; j < proposalEntity.proposalIds.length; j++) {
    //             let tokenEntity = InvestmentReceiptNFTTokenIdEntity.load(proposalEntity.proposalIds[j].toHexString());
    //             if (tokenEntity) {
    //                 let tem: BigInt[] = [];
    //                 if (tokenEntity.tokenIds.length > 0) {
    //                     for (let i = 0; i < tokenEntity.tokenIds.length; i++) {
    //                         tem.push(tokenEntity.tokenIds[i]);
    //                     }
    //                     if (containsBigInt(tem, event.params.id)) {
    //                         iproposalId = proposalEntity.proposalIds[j];
    //                         break;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    let holderentity = InvestmentReceiptNFTHolderEntity.load(iproposalId.toHexString());

    if (holderentity && holderentity.holders.length > 0) {
        let tem3: string[] = [];
        for (let j = 0; j < holderentity.holders.length; j++) {
            tem3.push(holderentity.holders[j]);
        }

        const index = tem3.indexOf(event.params.from.toHexString());
        const index2 = tem3.indexOf(event.params.to.toHexString());
        if (index != -1) {
            if (index2 == -1)
                tem3[index] = event.params.to.toHexString();
            else
                tem3.splice(index, 1);
        }
        holderentity.holders = tem3;

        holderentity.save();
    }
}


function contains(proposalIds: string[], proposalId: string): boolean {
    const index = proposalIds.indexOf(proposalId);
    if (index !== -1) return true;
    return false;
}

function containsBigInt(tokenIds: BigInt[], tokenId: BigInt): boolean {
    const index = tokenIds.indexOf(tokenId);
    if (index !== -1) return true;
    return false;
}

