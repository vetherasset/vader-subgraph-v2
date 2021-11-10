import {
  Approval,
  Emission,
  EmissionChanged,
  GrantClaimed,
  MaxSupplyChanged,
  ProtocolInitialized,
  Transfer
} from "../../generated/Vader/Vader";
import {
  EmissionEvent,
  EmissionChangedEvent,
  GrantClaimedEvent,
  MaxSupplyChangedEvent,
  ProtocolInitializedEvent
} from "../../generated/schema";
import {
  INITIAL_VADER_SUPPLY,
  INITIAL_EMISSION_CURVE,
  createApprovalEvent,
  createOrUpdateGlobal,
  createTransferEvent,
  getOrCreateAccount,
  getOrCreateGlobal,
  getOrCreateToken,
  initConstants,
  setUntaxed,
  createOrUpdateXVaderPrice,
  XVADER_ADDRESS,
} from "./common";
import { Address, log } from "@graphprotocol/graph-ts";

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
  let burnAddress = getOrCreateGlobal('BURN').value;
  if (burnAddress.length == 0) {
    initConstants();
    createOrUpdateGlobal('emissionCurve', INITIAL_EMISSION_CURVE.toString());
    createOrUpdateGlobal('lastEmission', _event.block.timestamp.toString());
    createOrUpdateGlobal('maxSupply', INITIAL_VADER_SUPPLY.toString());
  }

  createTransferEvent(
    _event.transaction.hash.toHexString(),
    _event.address.toHexString(),
    _event.params.from.toHexString(),
    _event.params.to.toHexString(),
    _event.params.value
  );
  
  let xvaderAddress = Address.fromString(XVADER_ADDRESS);
  if (_event.params.from.equals(xvaderAddress) ||
    _event.params.to.equals(xvaderAddress)
  ) {
    createOrUpdateXVaderPrice()
  }
}

export function handleEmissionEvent(
  _event: Emission
): void {
  createOrUpdateGlobal('lastEmission', _event.params.lastEmission.toString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new EmissionEvent(eventId);
  event.amount = _event.params.amount;
  event.lastEmission = _event.params.lastEmission;
  event.save();
}

export function handleEmissionChangedEvent(
  _event: EmissionChanged
): void {
  createOrUpdateGlobal('emissionCurve', _event.params.next.toString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new EmissionChangedEvent(eventId);
  event.previous = _event.params.previous;
  event.next = _event.params.next;
  event.save();
}

export function handleGrantClaimedEvent(
  _event: GrantClaimed
): void {
  let account = getOrCreateAccount(_event.params.beneficiary.toHexString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new GrantClaimedEvent(eventId);
  event.beneficiary = account.id;
  event.amount = _event.params.amount;
  event.save();
}

export function handleMaxSupplyChangedEvent(
  _event: MaxSupplyChanged
): void {
  createOrUpdateGlobal('maxSupply', _event.params.next.toString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new MaxSupplyChangedEvent(eventId);
  event.previous = _event.params.previous;
  event.next = _event.params.next;
  event.save();
}

export function handleProtocolInitializedEvent(
  _event: ProtocolInitialized
): void {
  let converter = _event.params.converter;
  let vest = getOrCreateToken(_event.params.vest.toHexString());
  let usdv = getOrCreateToken(_event.params.usdv.toHexString());
  let dao = _event.params.dao;

  createOrUpdateGlobal('converter', converter.toHexString());
  createOrUpdateGlobal('vest', vest.id);
  createOrUpdateGlobal('usdv', usdv.id);

  setUntaxed(converter.toHexString(), true);
  setUntaxed(vest.id, true);
  setUntaxed(usdv.id, true);

  let eventId = _event.transaction.hash.toHexString();
  let event = new ProtocolInitializedEvent(eventId);
  event.converter = converter;
  event.vest = vest.id;
  event.usdv = usdv.id;
  event.dao = dao;
  event.save();
}
