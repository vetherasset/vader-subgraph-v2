import {
  PublicMintCapChanged,
  PublicMintFeeChanged,
  PartnerMintCapChanged,
  PartnerMintFeeChanged,
  DailyLimitsChanged,
  WhitelistPartner,
  InitializeCall,
  MintCall,
  BurnCall,
  PartnerMintCall,
  PartnerBurnCall,
  SetTransmuterAddressCall,
  SetLBTCall
} from "../../generated/vaderMinterUpgradeable/vaderMinterUpgradeable";
import {
  PublicMintCapChangedEvent,
  PublicMintFeeChangedEvent,
  PartnerMintCapChangedEvent,
  PartnerMintFeeChangedEvent,
  DailyLimitsChangedEvent,
  WhitelistPartnerEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  DAY,
  getOrCreateAccount,
  getOrCreateGlobal,
  getOrCreatePartnerLimit
} from "./common";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleInitialize(
  _call: InitializeCall
): void {
  createOrUpdateGlobal(
    "cycleTimestamp",
    _call.block.timestamp.toString()
  );
}

export function handleMint(
  _call: MintCall
): void {
  let timestamp = _call.block.timestamp;
  let cycleTimestamp = getOrCreateGlobal(
    "cycleTimestamp",
    _call.block.timestamp
  );
  let cycleMints = getOrCreateGlobal(
    "cycleMints",
    _call.block.timestamp
  );

  if (BigInt.fromString(cycleTimestamp.value).gt(timestamp)) {
    createOrUpdateGlobal(
      "cycleMints",
      '',
      timestamp,
      _call.outputs.uAmount
    );
  } else {
    createOrUpdateGlobal(
      "cycleTimestamp",
      timestamp.plus(DAY).toString(),
      timestamp,
      DAY,
      true
    );
    createOrUpdateGlobal(
      "cycleMints",
      _call.outputs.uAmount.toString(),
      timestamp,
      BigInt.fromString(cycleMints.value).neg(),
      true
    );
  }
}

export function handleBurn(
  _call: BurnCall
): void {
  let timestamp = _call.block.timestamp;
  let cycleTimestamp = getOrCreateGlobal(
    "cycleTimestamp",
    _call.block.timestamp
  );
  let cycleBurns = getOrCreateGlobal(
    "cycleBurns",
    _call.block.timestamp
  );

  if (BigInt.fromString(cycleTimestamp.value).gt(timestamp)) {
    createOrUpdateGlobal(
      "cycleBurns",
      '',
      timestamp,
      _call.inputs.uAmount
    );
  } else {
    createOrUpdateGlobal(
      "cycleTimestamp",
      timestamp.plus(DAY).toString(),
      timestamp,
      DAY,
      true
    );
    createOrUpdateGlobal(
      "cycleBurns",
      _call.inputs.uAmount.toString(),
      timestamp,
      BigInt.fromString(cycleBurns.value).neg(),
      true
    );
  }
}

export function handlePartnerMint(
  _call: PartnerMintCall
): void {
  let account = getOrCreateAccount(
    _call.from.toHexString(),
    _call.block.timestamp
  );
  let partnerLimit = getOrCreatePartnerLimit(account.id);
  partnerLimit.mintLimit = partnerLimit.mintLimit.minus(_call.outputs.uAmount);
  partnerLimit.save();
}

export function handlePartnerBurn(
  _call: PartnerBurnCall
): void {
  let account = getOrCreateAccount(
    _call.from.toHexString(),
    _call.block.timestamp
  );
  let partnerLimit = getOrCreatePartnerLimit(account.id);
  partnerLimit.burnLimit = partnerLimit.burnLimit.minus(_call.outputs.vAmount);
  partnerLimit.save();
}

export function handleSetTransmuterAddress(
  _call: SetTransmuterAddressCall
): void {
  createOrUpdateGlobal(
    "transmuter",
    _call.inputs._transmuter.toHexString()
  );
}

export function handleSetLBT(
  _call: SetLBTCall
): void {
  createOrUpdateGlobal(
    "lbt",
    _call.inputs._lbt.toHexString()
  );
}


export function handlePublicMintCapChangedEvent(
  _event: PublicMintCapChanged
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new PublicMintCapChangedEvent(eventId);
  event.previousPublicMintCap = _event.params.previousPublicMintCap;
  event.publicMintCap = _event.params.publicMintCap;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handlePublicMintFeeChangedEvent(
  _event: PublicMintFeeChanged
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new PublicMintFeeChangedEvent(eventId);
  event.previousPublicMintFee = _event.params.previousPublicMintFee;
  event.publicMintFee = _event.params.publicMintFee;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handlePartnerMintCapChangedEvent(
  _event: PartnerMintCapChanged
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new PartnerMintCapChangedEvent(eventId);
  event.previousPartnerMintCap = _event.params.previousPartnerMintCap;
  event.partnerMintCap = _event.params.partnerMintCap;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handlePartnerMintFeeChangedEvent(
  _event: PartnerMintFeeChanged
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new PartnerMintFeeChangedEvent(eventId);
  event.previousPartnercMintFee = _event.params.previousPartnercMintFee;
  event.partnerMintFee = _event.params.partnerMintFee;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleDailyLimitsChangedEvent(
  _event: DailyLimitsChanged
): void {
  createOrUpdateGlobal(
    "dailyLimits_fee",
    _event.params.previousLimits.fee.toString(),
    _event.block.timestamp,
    _event.params.nextLimits.fee.minus(
      _event.params.previousLimits.fee
    ),
    true
  );
  createOrUpdateGlobal(
    "dailyLimits_mintLimit",
    _event.params.previousLimits.mintLimit.toString(),
    _event.block.timestamp,
    _event.params.nextLimits.mintLimit.minus(
      _event.params.previousLimits.mintLimit
    ),
    true
  );
  createOrUpdateGlobal(
    "dailyLimits_burnLimit",
    _event.params.previousLimits.burnLimit.toString(),
    _event.block.timestamp,
    _event.params.nextLimits.burnLimit.minus(
      _event.params.previousLimits.burnLimit
    ),
    true
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new DailyLimitsChangedEvent(eventId);
  event.previousFee = _event.params.previousLimits.fee;
  event.previousMintLimit = _event.params.previousLimits.mintLimit;
  event.previousBurnLimit = _event.params.previousLimits.burnLimit;
  event.nextFee = _event.params.nextLimits.fee;
  event.nextMintLimit = _event.params.nextLimits.mintLimit;
  event.nextBurnLimit = _event.params.nextLimits.burnLimit;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleWhitelistPartnerEvent(
  _event: WhitelistPartner
): void {
  let account = getOrCreateAccount(
    _event.params.partner.toHexString(),
    _event.block.timestamp
  );

  let partnerLimit = getOrCreatePartnerLimit(account.id);
  partnerLimit.fee = _event.params.fee;
  partnerLimit.mintLimit = _event.params.mintLimit;
  partnerLimit.burnLimit = _event.params.burnLimit;
  partnerLimit.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new WhitelistPartnerEvent(eventId);
  event.partner = account.id;
  event.mintLimit = _event.params.mintLimit;
  event.burnLimit = _event.params.burnLimit;
  event.fee = _event.params.fee;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}
