import { BigInt } from "@graphprotocol/graph-ts";
import {
  Approval,
  LockCreated,
  LockClaimed,
  Transfer,
  ClaimCall,
  ClaimAllCall
} from "../../generated/USDV/USDV";
import {
  LockCreatedEvent,
  LockClaimedEvent
} from "../../generated/schema";
import {
  createApprovalEvent,
  createOrUpdateGlobal,
  createTransferEvent,
  getOrCreateAccount,
  getOrCreateGlobal,
  getOrCreateLock,
  MONE,
  ONE,
} from "./common";

export function handleClaim(
  _call: ClaimCall
): void {
  let account = getOrCreateAccount(
    _call.from.toHexString(),
    _call.block.timestamp
  );

  let lockCount = getOrCreateGlobal(
    'LOCK_COUNT_' + account.id,
    _call.block.timestamp
  );

  let lock = getOrCreateLock(account.id, _call.inputs.i.toI32());
  let lastLock = getOrCreateLock(
    account.id,
    Number.parseInt(lockCount.value)
  );

  lock.token = lastLock.token;
  lock.amount = lastLock.amount;
  lock.release = lastLock.release;
  lock.save();

  lastLock.isRemoved = true;
  lastLock.save();

  createOrUpdateGlobal(
    'LOCK_COUNT_' + account.id,
    '',
    _call.block.timestamp,
    MONE
  );
}

export function handleClaimAll(
  _call: ClaimAllCall
): void {
  let account = getOrCreateAccount(
    _call.from.toHexString(),
    _call.block.timestamp
  );

  let lockCount = getOrCreateGlobal(
    'LOCK_COUNT_' + account.id,
    _call.block.timestamp
  );

  for (let i = 0; i < Number.parseInt(lockCount.value); i++) {
    let lock = getOrCreateLock(account.id, i);
    lock.isRemoved = true;
    lock.save();
  }

  createOrUpdateGlobal(
    'LOCK_COUNT_' + account.id,
    '',
    _call.block.timestamp,
    BigInt.fromString(lockCount.value).neg()
  );
}

export function handleApprovalEvent(
  _event: Approval
): void {
  createApprovalEvent(
    _event.transaction.hash.toHexString(),
    _event.address.toHexString(),
    _event.params.owner.toHexString(),
    _event.params.spender.toHexString(),
    _event.params.value,
    _event.block.timestamp
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
    _event.params.value,
    _event.block.timestamp
  );
}

export function handleLockCreatedEvent(
  _event: LockCreated
): void {
  let account = getOrCreateAccount(
    _event.params.user.toHexString(),
    _event.block.timestamp
  );

  let lockCount = getOrCreateGlobal(
    'LOCK_COUNT_' + account.id,
    _event.block.timestamp
  );
  let lock = getOrCreateLock(
    account.id,
    Number.parseInt(lockCount.value)
  );
  lock.token = _event.params.lockType == 0 ? 'USDV' : 'VADER';
  lock.amount = _event.params.lockAmount;
  lock.release = _event.params.lockRelease;
  lock.isRemoved = false;
  lock.save();

  createOrUpdateGlobal(
    'LOCK_COUNT_' + account.id,
    '',
    _event.block.timestamp,
    ONE
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new LockCreatedEvent(eventId);
  event.user = account.id;
  event.lockType = _event.params.lockType == 0 ? 'USDV' : 'VADER';
  event.lockAmount = _event.params.lockAmount;
  event.lockRelease = _event.params.lockRelease;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleLockClaimedEvent(
  _event: LockClaimed
): void {
  let account = getOrCreateAccount(
    _event.params.user.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new LockClaimedEvent(eventId);
  event.user = account.id;
  event.lockType = _event.params.lockType == 0 ? 'USDV' : 'VADER';
  event.lockAmount = _event.params.lockAmount;
  event.lockRelease = _event.params.lockRelease;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}
