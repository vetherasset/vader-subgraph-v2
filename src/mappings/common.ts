import {
  Address,
  BigInt,
  Bytes,
} from "@graphprotocol/graph-ts";
import {
  Global,
  Account,
  Token,
  PairInfo,
  Position,
  Proposal,
  Receipt,
  QueuedTransaction,
  Allowance,
  Balance,
  NFTAllowance,
  NFTItem,
  ApprovalEvent,
  TransferEvent,
  Vest,
  VetoStatus,
  Term,
  BondInfo,
  Adjust,
} from "../../generated/schema";

export let ZERO = BigInt.fromI32(0);
export let ONE = BigInt.fromI32(1);
export let MONE = BigInt.fromI32(-1);
export let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export let GWEI = BigInt.fromI32(1_000_000_000);
export let ETHER = GWEI.times(GWEI);
export let INITIAL_VADER_SUPPLY = BigInt.fromI32(250_000_000).times(BigInt.fromI32(10)).times(ETHER);
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
export let UINT32_MAX = BigInt.fromI32(2).pow(32);
export let UINT112_MAX = BigInt.fromI32(2).pow(112);
export let VADER_ADDRESS = '0x1fd03e4ea209497910face52e5ca39124ef2e8be';
export let CONVERTER = '0x0000000000000000000000000000000000000000';
export let LINEAR_VESTING = '0x0000000000000000000000000000000000000000';
export let XVADER_ADDRESS = '0x0aa1056ee563c14484fcc530625ca74575c97512';
export let SEED_LIQUIDITY = '0x0000000000000000000000000000000000000000';
export let VADER_BOND_ADDRESS = '0x66bcc1c537509ba441ccc9df39e18cc142c59775';
export let TREASURY_ADDRESS = '0x15d89713ea5c46de381c51a34fe4c743677576b4';

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
  createOrUpdateGlobal('treasury', TREASURY_ADDRESS);
}

export function getBaseTimestamp(
  _timestamp: BigInt,
  _type: string
): i32 {
  let timestamp = _timestamp.toI32();
  if (_type == 'All') {
    timestamp = 0;
  } else if (_type == 'Day') {
    timestamp = timestamp / 86400 * 86400;
  } else if (_type == 'Hour') {
    timestamp = timestamp / 3600 * 3600;
  }

  return timestamp as i32;
}

export function getOrCreateGlobal(
  _name: string,
  _timestamp: BigInt = null,
  _type: string = null
): Global {
  let globalId = _name;
  let baseTime = 0;
  if (_type) {
    globalId = globalId + '_' + _type;
    if (_timestamp) {
      baseTime = getBaseTimestamp(_timestamp, _type);
      globalId = globalId + '_' + baseTime.toString();
    }
  }

  let global = Global.load(globalId);

  if (!global) {
    global = new Global(globalId);
    global.name = _name;
    global.value = '';
    if (_timestamp) {
      global.value = '0';
    }
    global.type = _type;
    global.timestamp = baseTime;
    global.save();
  }

  return global as Global;
}

export function createOrUpdateGlobal(
  _name: string,
  _value: string,
  _timestamp: BigInt = null,
  _numValue: BigInt = ZERO,
  _isExact: boolean = false
): void {
  let global = getOrCreateGlobal(_name, _timestamp, null);
  if (!_timestamp) {
    global.value = _value;
  } else {
    if (_isExact) {
      global.value = _value;
    } else {
      global.value = BigInt.fromString(global.value).plus(_numValue).toString();
    }
  }
  global.save();

  if (_timestamp) {
    let globalDay = getOrCreateGlobal(_name, _timestamp, "Day");
    globalDay.value = global.value;
    globalDay.save();

    let globalHour = getOrCreateGlobal(_name, _timestamp, "Hour");
    globalHour.value = global.value;
    globalHour.save();

    let globalNewDay = getOrCreateGlobal("New" + _name, _timestamp, "Day");
    globalNewDay.value = BigInt.fromString(globalNewDay.value).plus(_numValue).toString();
    globalNewDay.save();

    let globalNewHour = getOrCreateGlobal("New" + _name, _timestamp, "Hour");
    globalNewHour.value = BigInt.fromString(globalNewHour.value).plus(_numValue).toString();
    globalNewHour.save();
  }
}

export function getOrCreateAccount(
  _address: string,
  _timestamp: BigInt = null
): Account {
  let accountId = _address;
  let account = Account.load(accountId);

  if (!account) {
    let global = getOrCreateGlobal("Accounts", ZERO, null);

    account = new Account(accountId);
    account.index = BigInt.fromString(global.value).toI32();
    account.address = Address.fromString(_address);
    account.isUntaxed = false;
    account.isBondContract = false;
    account.save();

    global.value = BigInt.fromString(global.value).plus(ONE).toString();
    global.save();
  }

  if (_timestamp) {
    account.updatedAt = _timestamp.toI32();
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
    token.isSupported = false;
    token.isSynth = false;
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

export function getOrCreatePairInfo(
  _address: string
): PairInfo {
  let pairInfo = PairInfo.load(_address);
  let token = getOrCreateToken(_address);

  if (!pairInfo) {
    pairInfo = new PairInfo(_address);
    pairInfo.foreignAsset = token.id;
    pairInfo.totalSupply = ZERO;
    pairInfo.reserveNative = ZERO;
    pairInfo.reserveForeign = ZERO;
    pairInfo.blockTimestampLast = ZERO;
    pairInfo.nativeLast = ZERO;
    pairInfo.foreignLast = ZERO;
    pairInfo.save();
  }

  return pairInfo as PairInfo;
}

export function getOrCreatePosition(
  _address: string,
  _id: BigInt
): Position {
  let nftItem = getOrCreateNFTItem(_address, _id);
  let positionId = _id.toString();
  let position = Position.load(positionId);

  if (!position) {
    let token = getOrCreateToken(ZERO_ADDRESS);
    position = new Position(positionId);
    position.foreignAsset = token.id;
    position.creation = ZERO;
    position.liquidity = ZERO;
    position.originalNative = ZERO;
    position.originalForeign = ZERO;
    position.nftItem = nftItem.id;
    position.isDeleted = false;
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
    vest.account = accountId;
    vest.amount = ZERO;
    vest.lastClaim = ZERO;
    vest.start = ZERO;
    vest.end = ZERO;
    vest.save();
  }

  return vest as Vest;
}

export function createOrUpdateAllowance(
  _address: string,
  _owner: string,
  _spender: string,
  _value: BigInt,
  _isNFT: boolean
): void {
  if (_isNFT) {
    let allowanceId = _address + '_' + _owner + '_' + _spender + '_' + _value.toString();
    let allowance = NFTAllowance.load(allowanceId);

    if (!allowance) {
      allowance = new NFTAllowance(allowanceId);
      let token = getOrCreateToken(_address);
      let ownerAccount = getOrCreateAccount(_owner);
      let spenderAccount = getOrCreateAccount(_spender);
      allowance.token = token.id;
      allowance.owner = ownerAccount.id;
      allowance.spender = spenderAccount.id;
      allowance.tokenId = _value;
    }

    allowance.save();
  } else {
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
  }
}

export function createApprovalEvent(
  _hash: string,
  _address: string,
  _owner: string,
  _spender: string,
  _value: BigInt,
  _timestamp: BigInt,
  _isNFT: boolean = false
): ApprovalEvent {
  createOrUpdateAllowance(
    _address,
    _owner,
    _spender,
    _value,
    _isNFT
  );

  let approvalId = _hash;
  let approval = new ApprovalEvent(approvalId);
  let ownerAccount = getOrCreateAccount(_owner, _timestamp);
  let spenderAccount = getOrCreateAccount(_spender, _timestamp);
  let token = getOrCreateToken(_address);

  approval.token = token.id;
  approval.owner = ownerAccount.id;
  approval.spender = spenderAccount.id;
  approval.amount = _value;
  approval.timestamp = _timestamp.toI32();
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
  _balance: BigInt,
  _timestamp: BigInt
): void {
  let balance = getOrCreateBalance(_account, _token);
  if (balance.balance.gt(ZERO) && _balance.isZero()) {
    createOrUpdateGlobal("UniqueWallet_" + _token, '', _timestamp, MONE);
  } else if (balance.balance.isZero() && _balance.gt(ZERO)) {
    createOrUpdateGlobal("UniqueWallet_" + _token, '', _timestamp, ONE);
  }
  balance.balance = _balance;
  balance.save();
}

export function getOrCreateNFTItem(
  _token: string,
  _tokenId: BigInt
): NFTItem {
  let token = getOrCreateToken(_token);

  let itemId = _token + '_' + _tokenId.toString();
  let item = NFTItem.load(itemId);

  if (!item) {
    item = new NFTItem(itemId);
    item.owner = ZERO_ADDRESS;
    item.token = token.id;
    item.tokenId = _tokenId;
    item.save();
  }

  return item as NFTItem;
}

export function createOrUpdateNFTItem(
  _account: string,
  _token: string,
  _tokenId: BigInt
): void {
  let account = getOrCreateAccount(_account);

  let item = getOrCreateNFTItem(_token, _tokenId);
  item.owner = account.id;
  item.save();
}

export function createTransferEvent(
  _hash: string,
  _address: string,
  _from: string,
  _to: string,
  _value: BigInt,
  _timestamp: BigInt,
  _isNFT: boolean = false
): void {
  let token = getOrCreateToken(_address);
  let fromAccount = getOrCreateAccount(_from, _timestamp);
  let toAccount = getOrCreateAccount(_to, _timestamp);

  if (_isNFT) {
    createOrUpdateNFTItem(
      _to,
      _address,
      _value
    );
  } else {
    if (_from != ZERO_ADDRESS) {
      createOrUpdateBalance(
        _from,
        _address,
        getOrCreateBalance(
          _from,
          _address
        ).balance.minus(_isNFT ? ONE : _value),
        _timestamp
      );
      fromAccount.save();
    } else {
      token.totalSupply = token.totalSupply.plus(_isNFT ? ONE : _value);
      token.save();
    }

    if (_to != ZERO_ADDRESS) {
      createOrUpdateBalance(
        _to,
        _address,
        getOrCreateBalance(
          _to,
          _address
        ).balance.plus(_isNFT ? ONE : _value),
        _timestamp
      );
      toAccount.save();
    } else {
      token.totalSupply = token.totalSupply.minus(_isNFT ? ONE : _value);
      token.save();
    }
  }

  let transferEvent = new TransferEvent(_hash);
  transferEvent.token = token.id;
  transferEvent.from = _from;
  transferEvent.to = _to;
  transferEvent.value = _value;
  transferEvent.timestamp = _timestamp.toI32();
  transferEvent.save();
}

export function setUntaxed(
  _address: string,
  _value: boolean,
  _timestamp: BigInt
): void {
  let account = getOrCreateAccount(_address, _timestamp);
  account.isUntaxed = _value;
  account.save();
}

export function createOrUpdateXVaderPrice(
  _timestamp: BigInt
): void {
  let xvaderToken = getOrCreateToken(XVADER_ADDRESS)
  let xvaderTotalSupply = xvaderToken.totalSupply
  let vaderTotalLocked = getOrCreateBalance(XVADER_ADDRESS, VADER_ADDRESS).balance;
  let price = ETHER.toString();
  if (xvaderTotalSupply.gt(BigInt.fromI32(0))) {
    price = vaderTotalLocked.times(ETHER).div(xvaderTotalSupply).toString()
  }
  let xvaderPrice = getOrCreateGlobal('XVADER_PRICE', _timestamp);
  createOrUpdateGlobal(
    'XVADER_PRICE',
    price,
    _timestamp,
    BigInt.fromString(xvaderPrice.value).minus(BigInt.fromString(price)),
    true
  );
}

export function getBondTypeFromIndex(
  _param: i32
): string {
  if (_param == 0) {
    return "VESTING";
  } else if (_param == 1) {
    return "PAYOUT";
  } else if (_param == 2) {
    return "DEBT";
  }
  return "";
}

export function getOrCreateTerm(
  _address: string
): Term {
  let term = Term.load(_address);

  if (!term) {
    term = new Term(_address);
    term.bond = _address;
    term.controlVariable = ZERO;
    term.vestingTerm = ZERO;
    term.minPrice = ZERO;
    term.maxPayout = ZERO;
    term.maxDebt = ZERO;
    term.save();
  }

  return term as Term;
}

export function getOrCreateBondInfo(
  _address: string,
  _depositor: string
): BondInfo {
  let bondInfo = BondInfo.load(_address + "_" + _depositor);

  if (!bondInfo) {
    bondInfo = new BondInfo(_address);
    bondInfo.bond = _address;
    bondInfo.depositor = _depositor;
    bondInfo.payout = ZERO;
    bondInfo.vesting = ZERO;
    bondInfo.lastBlock = ZERO;
    bondInfo.save();
  }

  return bondInfo as BondInfo;
}

export function getOrCreateAdjust(
  _address: string
): Adjust {
  let adjust = Adjust.load(_address);

  if (!adjust) {
    adjust = new Adjust(_address);
    adjust.bond = _address;
    adjust.add = false;
    adjust.rate = ZERO;
    adjust.target = ZERO;
    adjust.buffer = ZERO;
    adjust.lastBlock = ZERO;
    adjust.save();
  }

  return adjust as Adjust;
}
