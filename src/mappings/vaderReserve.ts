import {
  GrantDistributed,
  LossCovered
} from "../../generated/VaderReserve/VaderReserve";
import {
  GrantDistributedEvent,
  LossCoveredEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount
} from "./common";

export function handleGrantDistributedEvent(
  _event: GrantDistributed
): void {
  let account = getOrCreateAccount(
    _event.params.recipient.toHexString(),
    _event.block.timestamp
  );

  createOrUpdateGlobal('lastGrant', _event.block.timestamp.toString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new GrantDistributedEvent(eventId);
  event.recipient = account.id;
  event.amount = _event.params.amount;
  event.save();
}

export function handleLossCoveredEvent(
  _event: LossCovered
): void {
  let account = getOrCreateAccount(
    _event.params.recipient.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new LossCoveredEvent(eventId);
  event.recipient = account.id;
  event.amount = _event.params.amount;
  event.save();
}
