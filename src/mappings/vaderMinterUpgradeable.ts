import {
  PublicMintCapChanged,
  PublicMintFeeChanged,
  PartnerMintCapChanged,
  PartnerMintFeeChanged,
  DailyLimitsChanged,
  WhitelistPartner
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
  getOrCreateAccount
} from "./common";

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

  let eventId = _event.transaction.hash.toHexString();
  let event = new WhitelistPartnerEvent(eventId);
  event.partner = account.id;
  event.mintLimit = _event.params.mintLimit;
  event.burnLimit = _event.params.burnLimit;
  event.fee = _event.params.fee;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}
