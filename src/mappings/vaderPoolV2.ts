import { BigInt } from "@graphprotocol/graph-ts";
import {
  Approval,
  ApprovalForAll,
  Transfer,
  Burn,
  BurnCall,
  Mint,
  MintCall,
  PositionClosed,
  PositionOpened,
  QueueActive,
  SetTokenSupportCall,
  Swap,
  Sync
} from "../../generated/VaderPoolV2/VaderPoolV2";
import {
  NFTApproval,
  BurnEvent,
  MintEvent,
  PositionClosedEvent,
  PositionOpenedEvent,
  QueueActiveEvent,
  SwapEvent,
  SyncEvent
} from "../../generated/schema";
import {
  createApprovalEvent,
  createTransferEvent,
  createOrUpdateGlobal,
  getOrCreateAccount,
  getOrCreateGlobal,
  getOrCreatePairInfo,
  getOrCreatePosition,
  getOrCreateToken,
  UINT112_MAX,
  UINT32_MAX,
  ZERO
} from "./common";
import { convertStringToBigInt } from "./util";

export function handleApprovalEvent(
  _event: Approval
): void {
  createApprovalEvent(
    _event.transaction.hash.toHexString(),
    _event.address.toHexString(),
    _event.params.owner.toHexString(),
    _event.params.approved.toHexString(),
    _event.params.tokenId,
    _event.block.timestamp,
    true
  );
}

export function handleApprovalForAllEvent(
  _event: ApprovalForAll
): void {
  let approvalId = _event.address.toHexString()
    + '_' + _event.params.owner.toHexString()
    + '_' + _event.params.operator.toHexString();
  let approval = NFTApproval.load(approvalId);

  if (!approval) {
    approval = new NFTApproval(approvalId);
    let token = getOrCreateToken(_event.address.toHexString());
    let ownerAccount = getOrCreateAccount(
      _event.params.owner.toHexString(),
      _event.block.timestamp
    );
    let operatorAccount = getOrCreateAccount(
      _event.params.operator.toHexString(),
      _event.block.timestamp
    );
    approval.token = token.id;
    approval.owner = ownerAccount.id;
    approval.operator = operatorAccount.id;
    approval.approved = false;
  }

  approval.approved = _event.params.approved;
  approval.save();
}

export function handleTransferEvent(
  _event: Transfer
): void {
  createTransferEvent(
    _event.transaction.hash.toHexString(),
    _event.address.toHexString(),
    _event.params.from.toHexString(),
    _event.params.to.toHexString(),
    _event.params.tokenId,
    _event.block.timestamp,
    true
  );
}

export function handleBurn(
  _call: BurnCall
): void {
  let position = getOrCreatePosition(_call.to.toHexString(), _call.inputs.id);
  let token = getOrCreateToken(position.foreignAsset);

  let pairInfo = getOrCreatePairInfo(token.id);
  pairInfo.totalSupply = pairInfo.totalSupply.minus(position.liquidity);
  pairInfo.save();

  position.isDeleted = true;
  position.save();
}

export function handleBurnEvent(
  _event: Burn
): void {
  let sender = getOrCreateAccount(
    _event.params.sender.toHexString(),
    _event.block.timestamp
  );
  let receiver = getOrCreateAccount(
    _event.params.to.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new BurnEvent(eventId);
  event.sender = sender.id;
  event.amount0 = _event.params.amount0;
  event.amount1 = _event.params.amount1;
  event.to = receiver.id;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleMint(
  _call: MintCall
): void {
  let token = getOrCreateToken(_call.inputs.foreignAsset.toHexString());

  let pairInfo = getOrCreatePairInfo(token.id);
  pairInfo.totalSupply = pairInfo.totalSupply.plus(_call.outputs.liquidity);
  pairInfo.save();

  let globalValue = getOrCreateGlobal('positionId').value;
  let positionIndex = ZERO;
  if (globalValue.length > 0) {
    positionIndex = convertStringToBigInt(globalValue).plus(BigInt.fromI32(1));
  }

  createOrUpdateGlobal('positionId', positionIndex.toString());

  let position = getOrCreatePosition(_call.to.toHexString(), positionIndex);
  position.foreignAsset = token.id;
  position.creation = _call.block.timestamp;
  position.originalNative = _call.inputs.nativeDeposit;
  position.originalForeign = _call.inputs.foreignDeposit;
  position.liquidity = _call.outputs.liquidity;
  position.save();
}

export function handleMintEvent(
  _event: Mint
): void {
  let sender = getOrCreateAccount(
    _event.params.sender.toHexString(),
    _event.block.timestamp
  );
  let receiver = getOrCreateAccount(
    _event.params.to.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new MintEvent(eventId);
  event.sender = sender.id;
  event.amount0 = _event.params.amount0;
  event.amount1 = _event.params.amount1;
  event.to = receiver.id;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handlePositionOpenedEvent(
  _event: PositionOpened
): void {
  let fromAccount = getOrCreateAccount(
    _event.params.from.toHexString(),
    _event.block.timestamp
  );
  let toAccount = getOrCreateAccount(
    _event.params.to.toHexString(),
    _event.block.timestamp
  );

  let position = getOrCreatePosition(
    _event.address.toHexString(), _event.params.id
  );
  position.liquidity = _event.params.liquidity;
  position.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new PositionOpenedEvent(eventId);
  event.from = fromAccount.id;
  event.to = toAccount.id;
  event.index = _event.params.id;
  event.liquidity = _event.params.liquidity;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handlePositionClosedEvent(
  _event: PositionClosed
): void {
  let sender = getOrCreateAccount(
    _event.params.sender.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new PositionClosedEvent(eventId);
  event.sender = sender.id;
  event.index = _event.params.id;
  event.liquidity = _event.params.liquidity;
  event.loss = _event.params.loss;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleQueueActiveEvent(
  _event: QueueActive
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new QueueActiveEvent(eventId);
  event.activated = _event.params.activated;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleSwapEvent(
  _event: Swap
): void {
  let sender = getOrCreateAccount(
    _event.params.sender.toHexString(),
    _event.block.timestamp
  );
  let receiver = getOrCreateAccount(
    _event.params.to.toHexString(),
    _event.block.timestamp
  );
  let token = getOrCreateToken(_event.params.foreignAsset.toHexString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new SwapEvent(eventId);
  event.foreignAsset = token.id;
  event.sender = sender.id;
  event.amount0In = _event.params.amount0In;
  event.amount1In = _event.params.amount1In;
  event.amount0Out = _event.params.amount0Out;
  event.amount1Out = _event.params.amount1Out;
  event.to = receiver.id;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleSyncEvent(
  _event: Sync
): void {
  let token = getOrCreateToken(_event.params.foreignAsset.toHexString());
  let pairInfo = getOrCreatePairInfo(token.id);

  let blockTimestamp = _event.block.timestamp.mod(UINT32_MAX);
  let timeElapsed = blockTimestamp.minus(pairInfo.blockTimestampLast);
  let reserveNative = pairInfo.reserveNative;
  let reserveForeign = pairInfo.reserveForeign;
  let nativeLast = pairInfo.nativeLast;
  let foreignLast = pairInfo.foreignLast;

  if (timeElapsed.gt(ZERO) && !reserveNative.isZero() && !reserveForeign.isZero()) {
    pairInfo.nativeLast = nativeLast.plus(
      reserveForeign.times(UINT112_MAX).div(reserveNative).times(timeElapsed)
    );
    pairInfo.foreignLast = foreignLast.plus(
      reserveNative.times(UINT112_MAX).div(reserveForeign).times(timeElapsed)
    );
  }
  pairInfo.reserveNative = _event.params.reserve0;
  pairInfo.reserveForeign = _event.params.reserve1;
  pairInfo.blockTimestampLast = blockTimestamp;
  pairInfo.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new SyncEvent(eventId);
  event.foreignAsset = token.id;
  event.reserve0 = _event.params.reserve0;
  event.reserve1 = _event.params.reserve1;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleSetTokenSupport(
  _call: SetTokenSupportCall
): void {
  let token = getOrCreateToken(_call.inputs.foreignAsset.toHexString());
  token.isSupported = _call.inputs.support;
  token.save();
}
