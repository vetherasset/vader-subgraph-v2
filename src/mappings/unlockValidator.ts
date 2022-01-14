import {
  InValidate,
  Validate
} from "../../generated/UnlockValidator/UnlockValidator";
import {
  InValidateEvent,
  ValidateEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount,
} from "./common";

export function handleInValidateEvent(
  _event: InValidate
): void {
  let account = getOrCreateAccount(
    _event.params.account.toHexString(),
    _event.block.timestamp
  );

  createOrUpdateGlobal(
    "InValidated_" + account.id,
    "true"
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new InValidateEvent(eventId);
  event.account = account.id;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleValidateEvent(
  _event: Validate
): void {
  let account = getOrCreateAccount(
    _event.params.account.toHexString(),
    _event.block.timestamp
  );

  createOrUpdateGlobal(
    "InValidated_" + account.id,
    "false"
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new ValidateEvent(eventId);
  event.account = account.id;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}
