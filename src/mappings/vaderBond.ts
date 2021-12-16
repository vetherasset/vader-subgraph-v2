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
  TreasuryChangedEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getBondTypeFromIndex,
  getOrCreateAccount,
  getOrCreateAdjust,
  getOrCreateBondInfo,
  getOrCreateGlobal,
  getOrCreateTerm,
  ZERO
} from "./common";
import { Treasury } from "../../generated/Treasury/Treasury";

function updateBondGlobalVariables(
  _address: string,
  _timestamp: BigInt
): void {
  let vaderBondContract = VaderBond.bind(
    Address.fromString(_address)
  );

  let bondPrice = vaderBondContract.bondPrice();
  let totalDebt = vaderBondContract.totalDebt();

  let price = getOrCreateGlobal(
    _address + "_bondPrice",
    _timestamp
  );
  let debt = getOrCreateGlobal(
    _address + "_totalDebt",
    _timestamp
  );

  createOrUpdateGlobal(
    _address + "_bondPrice",
    bondPrice.toString(),
    _timestamp,
    bondPrice.minus(BigInt.fromString(price.value)),
    true
  );
  createOrUpdateGlobal(
    _address + "_totalDebt",
    totalDebt.toString(),
    _timestamp,
    totalDebt.minus(BigInt.fromString(debt.value)),
    true
  );
}

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
    account.id + "_totalDebt",
    _call.inputs._initialDebt.toString(),
    _call.block.timestamp,
    _call.inputs._initialDebt,
    true
  );
  createOrUpdateGlobal(
    account.id + "_lastDecay",
    _call.block.number.toString()
  );

  updateBondGlobalVariables(
    _call.to.toHexString(),
    _call.block.timestamp
  );

  let term = getOrCreateTerm(account.id);
  term.controlVariable = _call.inputs._controlVariable;
  term.vestingTerm = _call.inputs._vestingTerm;
  term.minPrice = _call.inputs._minPrice;
  term.maxPayout = _call.inputs._maxPayout;
  term.maxDebt = _call.inputs._maxDebt;
  term.save();
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

  let term = getOrCreateTerm(account.id);
  let bondInfo = getOrCreateBondInfo(account.id, depositor.id);
  bondInfo.payout = bondInfo.payout.plus(_call.outputs.value0);
  bondInfo.vesting = term.vestingTerm;
  bondInfo.lastBlock = _call.block.number;
  bondInfo.save();

  let price = vaderBondContract.bondPrice();
  if (price.gt(term.minPrice) && term.minPrice.gt(ZERO)) {
    term.minPrice = ZERO;
    term.save();
  }

  updateBondGlobalVariables(
    _call.to.toHexString(),
    _call.block.timestamp
  );
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
  event.timestamp = _event.block.timestamp.toI32();
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

  updateBondGlobalVariables(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new BondRedeemedEvent(eventId);
  event.bond = account.id;
  event.recipient = depositor.id;
  event.payout = _event.params.payout;
  event.remaining = _event.params.remaining;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleBondPriceChangedEvent(
  _event: BondPriceChanged
): void {
  let account = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  updateBondGlobalVariables(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new BondPriceChangedEvent(eventId);
  event.bond = account.id;
  event.internalPrice = _event.params.internalPrice;
  event.debtRatio = _event.params.debtRatio;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}

export function handleControlVariableAdjustmentEvent(
  _event: ControlVariableAdjustment
): void {
  let account = getOrCreateAccount(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let term = getOrCreateTerm(account.id);
  term.controlVariable = _event.params.newBCV;
  term.save();

  let adjust = getOrCreateAdjust(account.id);
  adjust.rate = _event.params.adjustment;
  adjust.lastBlock = _event.block.number;
  adjust.save();

  updateBondGlobalVariables(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new ControlVariableAdjustmentEvent(eventId);
  event.bond = account.id;
  event.initialBCV = _event.params.initialBCV;
  event.newBCV = _event.params.newBCV;
  event.adjustment = _event.params.adjustment;
  event.addition = _event.params.addition;
  event.timestamp = _event.block.timestamp.toI32();
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
  let term = getOrCreateTerm(account.id);

  if (bondType == "VESTING") {
    term.vestingTerm = input;
  } else if (bondType == "PAYOUT") {
    term.maxPayout = input;
  } else if (bondType == "DEBT") {
    term.maxDebt = input;
  }
  term.save();

  updateBondGlobalVariables(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new SetBondTermsEvent(eventId);
  event.bond = account.id;
  event.param = bondType;
  event.input = input;
  event.timestamp = _event.block.timestamp.toI32();
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

  updateBondGlobalVariables(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new SetAdjustmentEvent(eventId);
  event.bond = account.id;
  event.add = _event.params.add;
  event.rate = _event.params.rate;
  event.target = _event.params.target;
  event.buffer = _event.params.buffer;
  event.timestamp = _event.block.timestamp.toI32();
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

  updateBondGlobalVariables(
    _event.address.toHexString(),
    _event.block.timestamp
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new TreasuryChangedEvent(eventId);
  event.bond = account.id;
  event.treasury = treasury.id;
  event.timestamp = _event.block.timestamp.toI32();
  event.save();
}
