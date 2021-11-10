import {
  Transfer,
  EnterCall,
  LeaveCall,
} from "../../generated/XVader/XVader"
import {
  createOrUpdateXVaderPrice,
  createTransferEvent,
} from "./common";

export function handleTransferEvent(
  _event: Transfer
): void {
  createTransferEvent(
    _event.transaction.hash.toHexString(),
    _event.address.toHexString(),
    _event.params.from.toHexString(),
    _event.params.to.toHexString(),
    _event.params.value
  );
}

export function handleEnter(_call: EnterCall): void {
  createOrUpdateXVaderPrice()
}

export function handleLeave(_call: LeaveCall): void {
  createOrUpdateXVaderPrice()
}
