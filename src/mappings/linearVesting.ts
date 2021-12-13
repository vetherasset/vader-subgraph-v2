import {
  Vested,
  VestingCreated,
  VestingInitialized
} from "../../generated/LinearVesting/LinearVesting";
import {
  VestedEvent,
  VestingCreatedEvent,
  VestingInitializedEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount,
  getOrCreateVest,
  ONE_YEAR,
  VESTING_DURATION,
} from "./common";

export function handleVestedEvent(
  _event: Vested
): void {
  let account = getOrCreateAccount(
    _event.params.from.toHexString(),
    _event.block.timestamp
  );

  let vest = getOrCreateVest(account.id);
  vest.account = account.id;
  vest.amount = vest.amount.minus(_event.params.amount);
  vest.lastClaim = _event.block.timestamp;
  vest.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new VestedEvent(eventId);
  event.from = account.id;
  event.amount = _event.params.amount;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleVestingCreatedEvent(
  _event: VestingCreated
): void {
  let account = getOrCreateAccount(
    _event.params.user.toHexString(),
    _event.block.timestamp
  );

  let vest = getOrCreateVest(account.id);
  vest.account = account.id;
  vest.amount = _event.params.amount;
  vest.start = _event.block.timestamp;
  vest.end = _event.block.timestamp.plus(ONE_YEAR);
  vest.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new VestingCreatedEvent(eventId);
  event.user = account.id;
  event.amount = _event.params.amount;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleVestingInitializedEvent(
  _event: VestingInitialized
): void {
  createOrUpdateGlobal(
    'start',
    _event.block.timestamp.toString()
  );
  createOrUpdateGlobal(
    'end',
    _event.block.timestamp.plus(VESTING_DURATION).toString()
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new VestingInitializedEvent(eventId);
  event.duration = _event.params.duration;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}
