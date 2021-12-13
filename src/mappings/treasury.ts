import {
  SetBondContract,
  Withdraw
} from "../../generated/Treasury/Treasury";
import {
  SetBondContractEvent,
  WithdrawEvent
} from "../../generated/schema";
import {
  getOrCreateAccount,
  getOrCreateToken
} from "./common";

export function handleSetBondContractEvent(
  _event: SetBondContract
): void {
  let treasury = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );
  let bondContract = getOrCreateAccount(
    _event.params.bond.toHexString(),
    _event.block.timestamp
  );
  bondContract.isBondContract = _event.params.approved;
  bondContract.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new SetBondContractEvent(eventId);
  event.treasury = treasury.id;
  event.bond = bondContract.id;
  event.approved = _event.params.approved;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleWithdrawEvent(
  _event: Withdraw
): void {
  let treasury = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );
  let token = getOrCreateToken(
    _event.params.token.toHexString(),
  );
  let account = getOrCreateAccount(
    _event.params.destination.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new WithdrawEvent(eventId);
  event.treasury = treasury.id;
  event.token = token.id;
  event.destination = account.id;
  event.amount = _event.params.amount;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}
