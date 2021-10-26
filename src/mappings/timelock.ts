import { Bytes } from "@graphprotocol/graph-ts";
import {
  CancelTransaction,
  ExecuteTransaction,
  NewAdmin,
  NewDelay,
  NewPendingAdmin,
  QueueTransaction,
} from "../../generated/Timelock/Timelock";
import {
  CancelTransactionEvent,
  ExecuteTransactionEvent,
  NewAdminEvent,
  NewDelayEvent,
  NewPendingAdminEvent,
  QueueTransactionEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount,
  getOrCreateProposal,
  getOrCreateQueuedTransaction,
  getOrCreateReceipt,
  getOrCreateVetoStatus,
  ZERO_ADDRESS
} from "./common";

export function handleNewAdminEvent(
  _event: NewAdmin
): void {
  let account = getOrCreateAccount(_event.params.newAdmin.toHexString());

  createOrUpdateGlobal('admin', account.id);
  createOrUpdateGlobal('pendingAdmin', ZERO_ADDRESS);

  let eventId = _event.transaction.hash.toHexString();
  let event = new NewAdminEvent(eventId);
  event.newAdmin = account.id;
  event.save();
}

export function handleNewPendingAdminEvent(
  _event: NewPendingAdmin
): void {
  let account = getOrCreateAccount(_event.params.newPendingAdmin.toHexString());

  createOrUpdateGlobal('pendingAdmin', account.id);

  let eventId = _event.transaction.hash.toHexString();
  let event = new NewPendingAdminEvent(eventId);
  event.newPendingAdmin = account.id;
  event.save();
}

export function handleNewDelayEvent(
  _event: NewDelay
): void {
  createOrUpdateGlobal('delay', _event.params.newDelay.toString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new NewDelayEvent(eventId);
  event.newDelay = _event.params.newDelay;
  event.save();
}

export function handleCancelTransactionEvent(
  _event: CancelTransaction
): void {
  let queuedTransaction = getOrCreateQueuedTransaction(
    _event.params.txHash.toHexString()
  );
  queuedTransaction.status = false;
  queuedTransaction.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new CancelTransactionEvent(eventId);
  event.txHash = queuedTransaction.id;
  event.target = _event.params.target;
  event.value = _event.params.value;
  event.signature = _event.params.signature;
  event.data = _event.params.data;
  event.eta = _event.params.eta;
  event.save();
}

export function handleExecuteTransactionEvent(
  _event: ExecuteTransaction
): void {
  let queuedTransaction = getOrCreateQueuedTransaction(
    _event.params.txHash.toHexString()
  );
  queuedTransaction.status = false;
  queuedTransaction.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new ExecuteTransactionEvent(eventId);
  event.txHash = queuedTransaction.id;
  event.target = _event.params.target;
  event.value = _event.params.value;
  event.signature = _event.params.signature;
  event.data = _event.params.data;
  event.eta = _event.params.eta;
  event.save();
}


export function handleQueueTransactionEvent(
  _event: QueueTransaction
): void {
  let queuedTransaction = getOrCreateQueuedTransaction(
    _event.params.txHash.toHexString()
  );
  queuedTransaction.status = true;
  queuedTransaction.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new QueueTransactionEvent(eventId);
  event.txHash = queuedTransaction.id;
  event.target = _event.params.target;
  event.value = _event.params.value;
  event.signature = _event.params.signature;
  event.data = _event.params.data;
  event.eta = _event.params.eta;
  event.save();
}

