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
  InitializeBondCall,
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
  getOrCreateBondInfo,
  getOrCreateGlobal,
  getOrCreateTerms,
  ZERO
} from "./common";
import { Treasury } from "../../generated/Treasury/Treasury";

export function handleInitializeBond(
  _call: InitializeBondCall
): void {
  let account = getOrCreateAccount(
    _call.to.toHexString(),
    _call.block.timestamp
  );
  let vaderBondContract = VaderBond.bind(
    Address.fromString(account.id)
  );

  createOrUpdateGlobal(
    account.id + "_treasury",
    vaderBondContract.treasury().toHexString()
  );
  createOrUpdateGlobal(
    account.id + "_payoutToken",
    vaderBondContract.payoutToken().toHexString()
  );
  createOrUpdateGlobal(
    account.id + "_principalToken",
    vaderBondContract.principalToken().toHexString()
  );
  createOrUpdateGlobal(
    account.id + "totalDebt",
    _call.inputs._initialDebt.toString(),
    _call.block.timestamp,
    _call.inputs._initialDebt,
    true
  );
  createOrUpdateGlobal(
    account.id + "lastDecay",
    _call.block.number.toString()
  );

  let terms = getOrCreateTerms(account.id);
  terms.controlVariable = _call.inputs._controlVariable;
  terms.vestingTerm = _call.inputs._vestingTerm;
  terms.minPrice = _call.inputs._minPrice;
  terms.maxPayout = _call.inputs._maxPayout;
  terms.maxDebt = _call.inputs._maxDebt;
  terms.save();
}

export function handleDeposit(
  _call: DepositCall
): void {
  let account = getOrCreateAccount(_call.to.toHexString());
  let vaderBondContract = VaderBond.bind(
    Address.fromString(account.id)
  );
  let treasuryContract = Treasury.bind(
    vaderBondContract.treasury()
  );
  let value = treasuryContract.valueOfToken(
    vaderBondContract.principalToken(), _call.inputs._amount
  );

  createOrUpdateGlobal(
    account.id + "_totalDebt",
    value.toString(),
    _call.block.timestamp,
    value,
  );
  createOrUpdateGlobal(
    account.id + "_lastDecay",
    _call.block.number.toString()
  );

  let depositor = getOrCreateAccount(
    _call.inputs._depositor.toHexString(),
    _call.block.timestamp
  );

  let terms = getOrCreateTerms(account.id);
  let bondInfo = getOrCreateBondInfo(account.id, depositor.id);
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
  let account = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new BondCreatedEvent(eventId);
  event.bond = account.id;
  event.deposit = _event.params.deposit;
  event.payout = _event.params.payout;
  event.expires = _event.params.expires;
  event.save();
}

export function handleBondRedeemedEvent(
  _event: BondRedeemed
): void {
  let account = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let depositor = getOrCreateAccount(
    _event.params.recipient.toHexString(),
    _event.block.timestamp
  );

  let bondInfo = getOrCreateBondInfo(account.id, depositor.id);
  bondInfo.payout = _event.params.remaining;
  bondInfo.vesting = bondInfo.vesting.minus(
    _event.block.number.minus(bondInfo.lastBlock)
  );
  bondInfo.lastBlock = _event.block.number;
  bondInfo.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new BondRedeemedEvent(eventId);
  event.bond = account.id;
  event.recipient = depositor.id;
  event.payout = _event.params.payout;
  event.remaining = _event.params.remaining;
  event.save();
}

export function handleBondPriceChangedEvent(
  _event: BondPriceChanged
): void {
  let account = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let price = getOrCreateGlobal(
    account.id + "_bondPrice",
    _event.block.timestamp
  );
  createOrUpdateGlobal(
    account.id + "_bondPrice",
    _event.params.internalPrice.toString(),
    _event.block.timestamp,
    _event.params.internalPrice.minus(BigInt.fromString(price.value)),
    true
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new BondPriceChangedEvent(eventId);
  event.bond = account.id;
  event.internalPrice = _event.params.internalPrice;
  event.debtRatio = _event.params.debtRatio;
  event.save();
}

export function handleControlVariableAdjustmentEvent(
  _event: ControlVariableAdjustment
): void {
  let account = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let terms = getOrCreateTerms(account.id);
  terms.controlVariable = _event.params.newBCV;
  terms.save();

  let adjust = getOrCreateAdjust(account.id);
  adjust.rate = _event.params.adjustment;
  adjust.lastBlock = _event.block.number;
  adjust.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new ControlVariableAdjustmentEvent(eventId);
  event.bond = account.id;
  event.initialBCV = _event.params.initialBCV;
  event.newBCV = _event.params.newBCV;
  event.adjustment = _event.params.adjustment;
  event.addition = _event.params.addition;
  event.save();
}

export function handleSetBondTermsEvent(
  _event: SetBondTerms
): void {
  let account = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );
  let bondType = getBondTypeFromIndex(_event.params.param);
  let input = _event.params.input;
  let terms = getOrCreateTerms(account.id);

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
  event.bond = account.id;
  event.param = bondType;
  event.input = input;
  event.save();
}

export function handleSetAdjustmentEvent(
  _event: SetAdjustment
): void {
  let account = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let adjust = getOrCreateAdjust(account.id);
  adjust.add = _event.params.add;
  adjust.rate = _event.params.rate;
  adjust.target = _event.params.target;
  adjust.buffer = _event.params.buffer;
  adjust.lastBlock = _event.block.number;
  adjust.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new SetAdjustmentEvent(eventId);
  event.bond = account.id;
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
    _event.address.toHexString(),
    _event.block.timestamp
  );
  let treasury = getOrCreateAccount(
    _event.params.treasury.toHexString(),
    _event.block.timestamp
  );

  createOrUpdateGlobal(
    _event.address.toHexString() + "_treasury",
    treasury.id
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new TreasuryChangedEvent(eventId);
  event.bond = account.id;
  event.treasury = treasury.id;
  event.save();
}
