import {
  Address,
  BigInt,
  Bytes
} from "@graphprotocol/graph-ts";
import {
  Global,
  Account,
  Token,
  Pool,
  Position,
  Proposal,
  Receipt,
  QueuedTransaction,
  Allowance,
  Balance,
  ApprovalEvent,
  TransferEvent,
  Vest,
  VetoStatus,
} from "../../generated/schema";

export let ZERO = BigInt.fromI32(0);
export let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export let GWEI = BigInt.fromI32(1_000_000_000);
export let ETHER = GWEI.times(GWEI);
export let INITIAL_VADER_SUPPLY = BigInt.fromI32(2_500_000_000).times(ETHER);
export let VETH_ALLOCATION = GWEI.times(ETHER);
export let VADER_VETHER_CONVERSION_RATE = BigInt.fromI32(1000);
export let TEAM_ALLOCATION = BigInt.fromI32(250_000_000).times(ETHER);
export let ECOSYSTEM_GROWTH = BigInt.fromI32(250_000_000).times(ETHER);
export let MINUTE = BigInt.fromI32(60);
export let HOUR = BigInt.fromI32(60).times(MINUTE);
export let DAY = BigInt.fromI32(24).times(HOUR);
export let EMISSION_ERA = BigInt.fromI32(24).times(HOUR);
export let ONE_YEAR = BigInt.fromI32(365).times(DAY);
export let INITIAL_EMISSION_CURVE = BigInt.fromI32(5);
export let VESTING_DURATION = BigInt.fromI32(2).times(ONE_YEAR);
export let MAX_BASIS_POINTS = BigInt.fromI32(100_00);
export let MAX_FEE_BASIS_POINTS = BigInt.fromI32(1_00);
export let BURN = "0xdeaDDeADDEaDdeaDdEAddEADDEAdDeadDEADDEaD";

export function initConstants(): void {
  createOrUpdateGlobal('INITIAL_VADER_SUPPLY', INITIAL_VADER_SUPPLY.toString());
  createOrUpdateGlobal('VETH_ALLOCATION', VETH_ALLOCATION.toString());
  createOrUpdateGlobal('VADER_VETHER_CONVERSION_RATE', VADER_VETHER_CONVERSION_RATE.toString());
  createOrUpdateGlobal('TEAM_ALLOCATION', TEAM_ALLOCATION.toString());
  createOrUpdateGlobal('ECOSYSTEM_GROWTH', ECOSYSTEM_GROWTH.toString());
  createOrUpdateGlobal('EMISSION_ERA', EMISSION_ERA.toString());
  createOrUpdateGlobal('ONE_YEAR', ONE_YEAR.toString());
  createOrUpdateGlobal('INITIAL_EMISSION_CURVE', INITIAL_EMISSION_CURVE.toString());
  createOrUpdateGlobal('VESTING_DURATION', VESTING_DURATION.toString());
  createOrUpdateGlobal('MAX_BASIS_POINTS', MAX_BASIS_POINTS.toString());
  createOrUpdateGlobal('MAX_FEE_BASIS_POINTS', MAX_FEE_BASIS_POINTS.toString());
  createOrUpdateGlobal('BURN', BURN);
}

export function getOrCreateGlobal(
  _name: string
): Global {
  let global = Global.load(_name);

  if (!global) {
    global = new Global(_name);
    global.name = _name;
    global.value = '';
    global.save();
  }

  return global as Global;
}

export function createOrUpdateGlobal(
  _name: string,
  _value: string,
): void {
  let global = getOrCreateGlobal(_name);
  global.value = _value;
  global.save();
}

export function getOrCreateAccount(
  _address: string
): Account {
  let accountId = _address;
  let account = Account.load(accountId);

  if (!account) {
    account = new Account(accountId);
    account.address = Address.fromString(_address);
    account.isUntaxed = false;
    account.save();
  }

  return account as Account;
}

export function getOrCreateToken(
  _address: string
): Token {
  let token = Token.load(_address);

  if (!token) {
    token = new Token(_address);
    token.address = Address.fromString(_address);
    token.totalSupply = ZERO;
    token.save();
  }

  return token as Token;
}

export function getOrCreateProposal(
  _id: BigInt,
): Proposal {
  let proposalId = _id.toString();
  let proposal = Proposal.load(proposalId);

  if (!proposal) {
    proposal = new Proposal(proposalId);
    proposal.canceled = false;
    proposal.executed = false;
    proposal.proposer = '';
    proposal.eta = ZERO;
    proposal.targets = [];
    proposal.values = [];
    proposal.signatures = [];
    proposal.calldatas = [];
    proposal.startBlock = ZERO;
    proposal.endBlock = ZERO;
    proposal.forVotes = ZERO;
    proposal.againstVotes = ZERO;
    proposal.vetoStatus = null;
    proposal.save();
  }

  return proposal as Proposal;
}

export function getOrCreateVetoStatus(
  _id: BigInt
): VetoStatus {
  let vetoStatusId = _id.toString();
  let vetoStatus = VetoStatus.load(vetoStatusId);

  if (!vetoStatus) {
    vetoStatus = new VetoStatus(vetoStatusId);
    vetoStatus.hasBeenVetoed = false;
    vetoStatus.support = false;
    vetoStatus.save();
  }

  return vetoStatus as VetoStatus;
}

export function getOrCreateReceipt(
  _id: BigInt,
  _voter: string
): Receipt {
  let proposal = getOrCreateProposal(_id);
  let receiptId = _id.toString() + '_' + _voter;
  let receipt = Receipt.load(receiptId);

  if (!receipt) {
    receipt = new Receipt(receiptId);
    receipt.proposal = proposal.id;
    receipt.voter = _voter;
    receipt.hasVoted = false;
    receipt.support = false;
    receipt.votes = ZERO;
    receipt.save();
  }

  return receipt as Receipt;
}

export function getOrCreateQueuedTransaction(
  _txHash: string,
): QueuedTransaction {
  let queuedTransaction = QueuedTransaction.load(_txHash);

  if (!queuedTransaction) {
    queuedTransaction = new QueuedTransaction(_txHash);
    queuedTransaction.status = false;
    queuedTransaction.save();
  }

  return queuedTransaction as QueuedTransaction;
}

export function getOrCreatePool(
  _address: string,
  _token0: string = '',
  _token1: string = ''
): Pool {
  let poolId = _address;
  let pool = Pool.load(poolId);

  if (!pool) {
    pool = new Pool(poolId);
    pool.address = Address.fromString(_address);
    pool.nativeAsset = _token0;
    pool.foreignAsset = _token1;
    pool.blockTimestampLast = ZERO;
    pool.queueActive = false;
    pool.save();
  }

  return pool as Pool;
}

export function getOrCreatePosition(
  _pool: string,
  _id: BigInt
): Position {
  let positionId = _pool + '_' + _id.toString();
  let position = Position.load(positionId);

  if (!position) {
    position = new Position(positionId);
    position.pool = _pool;
    position.index = _id;
    position.creation = ZERO;
    position.liquidity = ZERO;
    position.originalNative = ZERO;
    position.originalForeign = ZERO;
    position.save();
  }

  return position as Position;
}

export function getOrCreateVest(
  _address: string
): Vest {
  let accountId = _address;
  let vest = Vest.load(accountId);

  if (!vest) {
    vest = new Vest(accountId);
    vest.amount = ZERO;
    vest.lastClaim = ZERO;
    vest.save();
  }

  return vest as Vest;
}

export function createOrUpdateAllowance(
  _address: string,
  _owner: string,
  _spender: string,
  _value: BigInt
): Allowance {
  let allowanceId = _address + '_' + _owner + '_' + _spender;
  let allowance = Allowance.load(allowanceId);

  if (!allowance) {
    allowance = new Allowance(allowanceId);
    let token = getOrCreateToken(_address);
    let ownerAccount = getOrCreateAccount(_owner);
    let spenderAccount = getOrCreateAccount(_spender);
    allowance.token = token.id;
    allowance.owner = ownerAccount.id;
    allowance.spender = spenderAccount.id;
  }

  allowance.amount = _value;
  allowance.save();

  return allowance as Allowance;
}

export function createApprovalEvent(
  _hash: string,
  _address: string,
  _owner: string,
  _spender: string,
  _value: BigInt
): ApprovalEvent {
  createOrUpdateAllowance(
    _address,
    _owner,
    _spender,
    _value
  );

  let approvalId = _hash;
  let approval = new ApprovalEvent(approvalId);
  let ownerAccount = getOrCreateAccount(_owner);
  let spenderAccount = getOrCreateAccount(_spender);
  let token = getOrCreateToken(_address);

  approval.token = token.id;
  approval.owner = ownerAccount.id;
  approval.spender = spenderAccount.id;
  approval.amount = _value;
  approval.save();

  return approval as ApprovalEvent;
}

export function getOrCreateBalance(
  _account: string,
  _token: string
): Balance {
  let account = getOrCreateAccount(_account);
  let token = getOrCreateToken(_token);

  let balanceId = _account + '_' + _token;
  let balance = Balance.load(balanceId);

  if (!balance) {
    balance = new Balance(balanceId);
    balance.account = account.id;
    balance.token = token.id;
    balance.balance = ZERO;
    balance.save();
  }

  return balance as Balance;
}

export function createOrUpdateBalance(
  _account: string,
  _token: string,
  _balance: BigInt
): void {
  let balance = getOrCreateBalance(_account, _token);
  balance.balance = _balance;
  balance.save();
}

export function createTransferEvent(
  _hash: string,
  _address: string,
  _from: string,
  _to: string,
  _value: BigInt
): void {
  let token = getOrCreateToken(_address);
  let fromAccount = getOrCreateAccount(_from);
  let toAccount = getOrCreateAccount(_to);

  if (_from != ZERO_ADDRESS) {
    createOrUpdateBalance(
      _from,
      _address,
      getOrCreateBalance(
        _from,
        _address
      ).balance.minus(_value)
    );
    fromAccount.save();
  } else {
    token.totalSupply = token.totalSupply.plus(_value);
    token.save();
  }

  if (_to != ZERO_ADDRESS) {
    createOrUpdateBalance(
      _to,
      _address,
      getOrCreateBalance(
        _to,
        _address
      ).balance.plus(_value)
    );
    toAccount.save();
  } else {
    token.totalSupply = token.totalSupply.minus(_value);
    token.save();
  }

  let transferEvent = new TransferEvent(_hash);
  transferEvent.token = token.id;
  transferEvent.from = _from;
  transferEvent.to = _to;
  transferEvent.value = _value;
  transferEvent.save();
}

export function setUntaxed(
  _address: string,
  _value: boolean
): void {
  let account = getOrCreateAccount(_address);
  account.isUntaxed = _value;
  account.save();
}