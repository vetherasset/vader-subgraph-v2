import {
  BondCreated,
  BondRedeemed,
  BondPriceChanged,
  ControlVariableAdjustment,
  SetBondTerms,
  SetAdjustment,
  TreasuryChanged,
} from "../../generated/VaderBond/VaderBond";
import {
  BondCreatedEvent,
  BondRedeemedEvent,
  BondPriceChangedEvent,
  ControlVariableAdjustmentEvent,
  SetBondTermsEvent,
  SetAdjustmentEvent,
  TreasuryChangedEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getBondTypeFromIndex,
  getOrCreateAccount
} from "./common";

export function handleBondCreatedEvent(
  _event: BondCreated
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new BondCreatedEvent(eventId);
  event.deposit = _event.params.deposit;
  event.payout = _event.params.payout;
  event.expires = _event.params.expires;
  event.save();
}

export function handleBondRedeemedEvent(
  _event: BondRedeemed
): void {
  let account = getOrCreateAccount(
    _event.params.recipient.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new BondRedeemedEvent(eventId);
  event.recipient = account.id;
  event.payout = _event.params.payout;
  event.remaining = _event.params.remaining;
  event.save();
}

export function handleBondPriceChangedEvent(
  _event: BondPriceChanged
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new BondPriceChangedEvent(eventId);
  event.internalPrice = _event.params.internalPrice;
  event.debtRatio = _event.params.debtRatio;
  event.save();
}

export function handleControlVariableAdjustmentEvent(
  _event: ControlVariableAdjustment
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new ControlVariableAdjustmentEvent(eventId);
  event.initialBCV = _event.params.initialBCV;
  event.newBCV = _event.params.newBCV;
  event.adjustment = _event.params.adjustment;
  event.addition = _event.params.addition;
  event.save();
}

export function handleSetBondTermsEvent(
  _event: SetBondTerms
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new SetBondTermsEvent(eventId);
  event.param = getBondTypeFromIndex(_event.params.param);
  event.input = _event.params.input;
  event.save();
}

export function handleSetAdjustmentEvent(
  _event: SetAdjustment
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new SetAdjustmentEvent(eventId);
  event.add = _event.params.add;
  event.rate = _event.params.rate;
  event.target = _event.params.target;
  event.buffer = _event.params.buffer;
  event.save();
}

export function handleTreasuryChangedEvent(
  _event: TreasuryChanged
): void {
  let account = getOrCreateAccount(
    _event.params.treasury.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new TreasuryChangedEvent(eventId);
  event.treasury = account.id;
  event.save();
}
