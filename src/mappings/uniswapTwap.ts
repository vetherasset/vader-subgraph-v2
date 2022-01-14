import {
  SetOracle
} from "../../generated/UniswapTwap/UniswapTwap";
import {
  SetOracleEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount,
} from "./common";

export function handleSetOracleEvent(
  _event: SetOracle
): void {
  let account = getOrCreateAccount(
    _event.params.oracle.toHexString(),
    _event.block.timestamp
  );

  createOrUpdateGlobal("Oracle", account.id);

  let eventId = _event.transaction.hash.toHexString();
  let event = new SetOracleEvent(eventId);
  event.oracle = account.id;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}
