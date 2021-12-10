import {
  SetBondContract,
  Withdraw
} from "../../generated/Treasury/Treasury";
import {
  SetBondContractEvent,
  WithdrawEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount,
  getOrCreateToken
} from "./common";

export function handleSetBondContractEvent(
  _event: SetBondContract
): void {
  let bondContract = getOrCreateAccount(
    _event.params.bond.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new SetBondContractEvent(eventId);
  event.bond = bondContract.id;
  event.approved = _event.params.approved;
  event.save();
}

export function handleWithdrawEvent(
  _event: Withdraw
): void {
  let token = getOrCreateToken(
    _event.params.token.toHexString(),
  );
  let account = getOrCreateAccount(
    _event.params.destination.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new WithdrawEvent(eventId);
  event.token = token.id;
  event.destination = account.id;
  event.amount = _event.params.amount;
  event.save();
}
