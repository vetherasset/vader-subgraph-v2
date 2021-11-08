import { Address } from "@graphprotocol/graph-ts"
import {
  Transfer,
  Approval,
} from "../../generated/XVader/XVader"
import {
  createOrUpdateXVaderPrice,
  createTransferEvent,
  createApprovalEvent,
  ZERO_ADDRESS,
} from "./common";

export function handleApprovalEvent(
  _event: Approval
): void {
  createApprovalEvent(
    _event.transaction.hash.toHexString(),
    _event.address.toHexString(),
    _event.params.owner.toHexString(),
    _event.params.spender.toHexString(),
    _event.params.value
  );
}

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

  let zeroAddress = Address.fromString(ZERO_ADDRESS);
  if (_event.params.from.equals(zeroAddress) ||
    _event.params.to.equals(zeroAddress)
  ) {
    createOrUpdateXVaderPrice()
  }
}
