import { BigInt } from "@graphprotocol/graph-ts";
import {
  Burn,
  Mint,
  PositionClosed,
  PositionOpened,
  QueueActive,
  Swap,
  Sync
} from "../../generated/templates/VaderPool/VaderPool";
import {
  BurnEvent,
  MintEvent,
  PositionClosedEvent,
  PositionOpenedEvent,
  QueueActiveEvent,
  SwapEvent,
  SyncEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount,
  getOrCreateGlobal,
  getOrCreatePool,
  getOrCreatePosition
} from "./common";
import { convertStringToBigInt } from "./util";

export function handleBurnEvent(
  _event: Burn
): void {
  let sender = getOrCreateAccount(_event.params.sender.toHexString());
  let receiver = getOrCreateAccount(_event.params.to.toHexString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new BurnEvent(eventId);
  event.sender = sender.id;
  event.amount0 = _event.params.amount0;
  event.amount1 = _event.params.amount1;
  event.to = receiver.id;
  event.save();
}

export function handleMintEvent(
  _event: Mint
): void {
  let sender = getOrCreateAccount(_event.params.sender.toHexString());
  let receiver = getOrCreateAccount(_event.params.to.toHexString());

  let globalValue = getOrCreateGlobal(
    _event.address.toHexString() + '_positionId'
  ).value;
  let positionIndex = BigInt.fromI32(1);
  if (globalValue.length > 0) {
    positionIndex = convertStringToBigInt(globalValue).plus(BigInt.fromI32(1));
  }

  createOrUpdateGlobal(
    _event.address.toHexString() + '_positionId',
    positionIndex.toString()
  );

  let position = getOrCreatePosition(_event.address.toHexString(), positionIndex);
  position.creation = _event.block.timestamp;
  position.originalNative = _event.params.amount0;
  position.originalForeign = _event.params.amount1;
  position.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new MintEvent(eventId);
  event.sender = sender.id;
  event.amount0 = _event.params.amount0;
  event.amount1 = _event.params.amount1;
  event.to = receiver.id;
  event.save();
}

export function handlePositionOpenedEvent(
  _event: PositionOpened
): void {
  let sender = getOrCreateAccount(_event.params.sender.toHexString());

  let position = getOrCreatePosition(_event.address.toHexString(), _event.params.id);
  position.liquidity = _event.params.liquidity;
  position.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new PositionOpenedEvent(eventId);
  event.sender = sender.id;
  event.index = _event.params.id;
  event.liquidity = _event.params.liquidity;
  event.save();
}

export function handlePositionClosedEvent(
  _event: PositionClosed
): void {
  let sender = getOrCreateAccount(_event.params.sender.toHexString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new PositionClosedEvent(eventId);
  event.sender = sender.id;
  event.index = _event.params.id;
  event.liquidity = _event.params.liquidity;
  event.loss = _event.params.loss;
  event.save();
}

export function handleQueueActiveEvent(
  _event: QueueActive
): void {
  let pool = getOrCreatePool(_event.address.toHexString());
  pool.queueActive = _event.params.activated;
  pool.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new QueueActiveEvent(eventId);
  event.activated = _event.params.activated;
  event.save();
}

export function handleSwapEvent(
  _event: Swap
): void {
  let sender = getOrCreateAccount(_event.params.sender.toHexString());
  let receiver = getOrCreateAccount(_event.params.to.toHexString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new SwapEvent(eventId);
  event.sender = sender.id;
  event.amount0In = _event.params.amount0In;
  event.amount1In = _event.params.amount1In;
  event.amount0Out = _event.params.amount0Out;
  event.amount1Out = _event.params.amount1Out;
  event.to = receiver.id;
  event.save();
}

export function handleSyncEvent(
  _event: Sync
): void {
  let pool = getOrCreatePool(_event.address.toHexString());
  pool.reserveNative = _event.params.reserve0;
  pool.reserveForeign = _event.params.reserve1;
  pool.blockTimestampLast = _event.block.timestamp;
  pool.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new SyncEvent(eventId);
  event.reserve0 = _event.params.reserve0;
  event.reserve1 = _event.params.reserve1;
  event.save();
}
