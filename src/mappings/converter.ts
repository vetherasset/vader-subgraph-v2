import { Conversion } from "../../generated/Converter/Converter";
import { ConversionEvent } from "../../generated/schema";
import { getOrCreateAccount } from "./common";

export function handleConversionEvent(
  _event: Conversion
): void {
  let account = getOrCreateAccount(
    _event.params.user.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new ConversionEvent(eventId);
  event.user = account.id;
  event.vetherAmount = _event.params.vetherAmount;
  event.vaderAmount = _event.params.vaderAmount;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}
