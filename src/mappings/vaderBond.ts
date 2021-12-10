import {
  Address,
  BigInt
} from "@graphprotocol/graph-ts";
import {
  BondCreated,
  BondRedeemed,
  BondPriceChanged,
  ControlVariableAdjustment,
  SetBondTerms,
  SetAdjustment,
  TreasuryChanged,
  VaderBond,
  DepositCall,
} from "../../generated/VaderBond/VaderBond";
import {
  BondCreatedEvent,
  BondRedeemedEvent,
  BondPriceChangedEvent,
  ControlVariableAdjustmentEvent,
  SetBondTermsEvent,
  SetAdjustmentEvent,
  TreasuryChangedEvent,
  Token
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getBondTypeFromIndex,
  getOrCreateAccount,
  getOrCreateAdjust,
  getOrCreateBond,
  getOrCreateGlobal,
  getOrCreateTerms,
  TREASURY_ADDRESS,
  VADER_BOND_ADDRESS,
  ZERO
} from "./common";
import { Treasury } from "../../generated/Treasury/Treasury";

export function handleDeposit(
  _call: DepositCall
): void {
  let vaderBondContract = VaderBond.bind(
    Address.fromString(VADER_BOND_ADDRESS)
  );
  let treasuryContract = Treasury.bind(
    Address.fromString(getOrCreateGlobal("treasury").value)
  );
  let value = treasuryContract.valueOfToken(
    vaderBondContract.principalToken(), _call.inputs._amount
  );

  createOrUpdateGlobal(
    "totalDebt",
    value.toString(),
    _call.block.timestamp,
    value,
  );

  let depositor = getOrCreateAccount(
    _call.inputs._depositor.toHexString(),
    _call.block.timestamp
  );

  let terms = getOrCreateTerms();
  let bondInfo = getOrCreateBond(depositor.id);
  bondInfo.payout = bondInfo.payout.plus(_call.outputs.value0);
  bondInfo.vesting = terms.vestingTerm;
  bondInfo.lastBlock = _call.block.number;
  bondInfo.save();

  let price = vaderBondContract.bondPrice();
  if (price.gt(terms.minPrice) && terms.minPrice.gt(ZERO)) {
    terms.minPrice = ZERO;
    terms.save();
  }
}

export function handleBondCreatedEvent(
  _event: BondCreated
): void {
  let eventId = _event.transaction.hash.toHexString();
  let event = new BondCreatedEvent(eventId);
  event.deposit = _event.params.deposit;
  event.payout = _event.params.payout;
  event.expires = _event.params.expires;
  event.save();
}

export function handleBondRedeemedEvent(
  _event: BondRedeemed
): void {
  let account = getOrCreateAccount(
    _event.params.recipient.toHexString(),
    _event.block.timestamp
  );

  let bondInfo = getOrCreateBond(account.id);
  bondInfo.payout = _event.params.remaining;
  bondInfo.vesting = bondInfo.vesting.minus(
    _event.block.number.minus(bondInfo.lastBlock)
  );
  bondInfo.lastBlock = _event.block.number;
  bondInfo.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new BondRedeemedEvent(eventId);
  event.recipient = account.id;
  event.payout = _event.params.payout;
  event.remaining = _event.params.remaining;
  event.save();
}

export function handleBondPriceChangedEvent(
  _event: BondPriceChanged
): void {
  let price = getOrCreateGlobal(
    "bondPrice",
    _event.block.timestamp
  );
  createOrUpdateGlobal(
    "bondPrice",
    _event.params.internalPrice.toString(),
    _event.block.timestamp,
    _event.params.internalPrice.minus(BigInt.fromString(price.value)),
    true
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new BondPriceChangedEvent(eventId);
  event.internalPrice = _event.params.internalPrice;
  event.debtRatio = _event.params.debtRatio;
  event.save();
}

export function handleControlVariableAdjustmentEvent(
  _event: ControlVariableAdjustment
): void {
  let terms = getOrCreateTerms();
  terms.controlVariable = _event.params.newBCV;
  terms.save();

  let adjust = getOrCreateAdjust();
  adjust.rate = _event.params.adjustment;
  adjust.lastBlock = _event.block.number;
  adjust.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new ControlVariableAdjustmentEvent(eventId);
  event.initialBCV = _event.params.initialBCV;
  event.newBCV = _event.params.newBCV;
  event.adjustment = _event.params.adjustment;
  event.addition = _event.params.addition;
  event.save();
}

export function handleSetBondTermsEvent(
  _event: SetBondTerms
): void {
  let bondType = getBondTypeFromIndex(_event.params.param);
  let input = _event.params.input;
  let terms = getOrCreateTerms();

  if (bondType == "VESTING") {
    terms.vestingTerm = input;
  } else if (bondType == "PAYOUT") {
    terms.maxPayout = input;
  } else if (bondType == "DEBT") {
    terms.maxDebt = input;
  }
  terms.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new SetBondTermsEvent(eventId);
  event.param = bondType;
  event.input = input;
  event.save();
}

export function handleSetAdjustmentEvent(
  _event: SetAdjustment
): void {
  let adjust = getOrCreateAdjust();
  adjust.add = _event.params.add;
  adjust.rate = _event.params.rate;
  adjust.target = _event.params.target;
  adjust.buffer = _event.params.buffer;
  adjust.lastBlock = _event.block.number;
  adjust.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new SetAdjustmentEvent(eventId);
  event.add = _event.params.add;
  event.rate = _event.params.rate;
  event.target = _event.params.target;
  event.buffer = _event.params.buffer;
  event.save();
}

export function handleTreasuryChangedEvent(
  _event: TreasuryChanged
): void {
  let account = getOrCreateAccount(
    _event.params.treasury.toHexString(),
    _event.block.timestamp
  );

  createOrUpdateGlobal("treasury", account.id);

  let eventId = _event.transaction.hash.toHexString();
  let event = new TreasuryChangedEvent(eventId);
  event.treasury = account.id;
  event.save();
}
