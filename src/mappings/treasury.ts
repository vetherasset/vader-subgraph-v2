import {
  SetBondContract,
  SetMaxPayout,
  ResetPayout,
  Withdraw
} from "../../generated/Treasury/Treasury";
import {
  ResetPayoutEvent,
  SetBondContractEvent,
  SetMaxPayoutEvent,
  WithdrawEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount,
  getOrCreateToken
} from "./common";
import { DepositCall } from "../../generated/Treasury/Treasury";

export function handleDeposit(
  _call: DepositCall
): void {
  createOrUpdateGlobal(
    _call.to.toHexString() + "_" + _call.from.toHexString() + "_payouts",
    '',
    _call.block.timestamp,
    _call.inputs._payoutAmount
  );
}

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

  createOrUpdateGlobal(
    "TVB_" + treasury.id + "_" + token.id,
    '',
    _event.block.timestamp,
    _event.params.amount.neg()
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

export function handleSetMaxPayoutEvent(
  _event: SetMaxPayout
): void {
  let treasury = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );
  let bondContract = getOrCreateAccount(
    _event.params.bond.toHexString(),
    _event.block.timestamp
  );

  createOrUpdateGlobal(
    treasury.id + "_maxPayouts",
    _event.params.max.toString()
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new SetMaxPayoutEvent(eventId);
  event.treasury = treasury.id;
  event.bond = bondContract.id;
  event.max = _event.params.max;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleResetPayoutEvent(
  _event: ResetPayout
): void {
  let treasury = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );
  let bondContract = getOrCreateAccount(
    _event.params.bond.toHexString(),
    _event.block.timestamp
  );

  createOrUpdateGlobal(
    treasury.id + "_" + bondContract.id + "_payouts",
    '',
    _event.block.timestamp,
    _event.params.sold.neg()
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new ResetPayoutEvent(eventId);
  event.treasury = treasury.id;
  event.bond = bondContract.id;
  event.sold = _event.params.sold;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}
