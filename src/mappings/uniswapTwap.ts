import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  GetVaderPriceCall,
  SetOracle,
  SyncVaderPriceCall,
  UniswapTwap
} from "../../generated/UniswapTwap/UniswapTwap";
import {
  SetOracleEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount,
  getOrCreateGlobal,
  updateVaderPrices,
} from "./common";

export function handleGetVaderPrice(
  _call: GetVaderPriceCall
): void {
  updateVaderPrices(_call.block.timestamp);

  let vaderPrice = getOrCreateGlobal(
    "vaderPrice",
    _call.block.timestamp
  );
  createOrUpdateGlobal(
    "vaderPrice",
    '',
    _call.block.timestamp,
    _call.outputs.value0
      .minus(BigInt.fromString(vaderPrice.value))
  );
}

export function handleSyncVaderPrice(
  _call: SyncVaderPriceCall
): void {
  updateVaderPrices(_call.block.timestamp);

  let uniswapTwap = UniswapTwap.bind(_call.to);
  let vaderPrice = getOrCreateGlobal(
    "vaderPrice",
    _call.block.timestamp
  );
  createOrUpdateGlobal(
    "vaderPrice",
    '',
    _call.block.timestamp,
    uniswapTwap.getStaleVaderPrice()
      .minus(BigInt.fromString(vaderPrice.value))
  );
}

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
