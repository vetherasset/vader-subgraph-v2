import {
  Vested,
  VestingInitialized
} from "../../generated/LinearVesting/LinearVesting";
import {
  VestedEvent,
  VestingInitializedEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount,
  getOrCreateVest,
  VESTING_DURATION,
} from "./common";

export function handleVestedEvent(
  _event: Vested
): void {
  let account = getOrCreateAccount(_event.params.from.toHexString());

  let vest = getOrCreateVest(account.id);
  vest.account = account.id;
  vest.amount = vest.amount.minus(_event.params.amount);
  vest.lastClaim = _event.block.timestamp;
  vest.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new VestedEvent(eventId);
  event.from = account.id;
  event.amount = _event.params.amount;
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
  event.save();
}
