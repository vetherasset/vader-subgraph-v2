import { Bytes } from "@graphprotocol/graph-ts";
import {
  CouncilChanged,
  FeeAmountChanged,
  FeeReceiverChanged,
  ProposalCanceled,
  ProposalCreated,
  ProposalExecuted,
  ProposalQueued,
  ProposalVetoed,
  VoteCast
} from "../../generated/GovernorAlpha/GovernorAlpha";
import {
  CouncilChangedEvent,
  FeeAmountChangedEvent,
  FeeReceiverChangedEvent,
  ProposalCanceledEvent,
  ProposalCreatedEvent,
  ProposalExecutedEvent,
  ProposalQueuedEvent,
  ProposalVetoedEvent,
  VoteCastEvent
} from "../../generated/schema";
import {
  createOrUpdateGlobal,
  getOrCreateAccount,
  getOrCreateProposal,
  getOrCreateReceipt,
  getOrCreateVetoStatus
} from "./common";

export function handleCouncilChangedEvent(
  _event: CouncilChanged
): void {
  let oldCouncil = getOrCreateAccount(
    _event.params.newCouncil.toHexString(),
    _event.block.timestamp
  );
  let newCouncil = getOrCreateAccount(
    _event.params.newCouncil.toHexString(),
    _event.block.timestamp
  );

  createOrUpdateGlobal('feeReceiver', newCouncil.id);

  let eventId = _event.transaction.hash.toHexString();
  let event = new CouncilChangedEvent(eventId);
  event.oldCouncil = oldCouncil.id;
  event.newCouncil = newCouncil.id;
  event.save();
}

export function handleFeeReceiverChangedEvent(
  _event: FeeReceiverChanged
): void {
  let oldFeeReceiver = getOrCreateAccount(
    _event.params.newFeeReceiver.toHexString(),
    _event.block.timestamp
  );
  let newFeeReceiver = getOrCreateAccount(
    _event.params.newFeeReceiver.toHexString(),
    _event.block.timestamp
  );

  createOrUpdateGlobal('feeReceiver', newFeeReceiver.id);

  let eventId = _event.transaction.hash.toHexString();
  let event = new FeeReceiverChangedEvent(eventId);
  event.oldFeeReceiver = oldFeeReceiver.id;
  event.newFeeReceiver = newFeeReceiver.id;
  event.save();
}

export function handleFeeAmountChangedEvent(
  _event: FeeAmountChanged
): void {
  createOrUpdateGlobal('feeAmount', _event.params.newFeeAmount.toString());

  let eventId = _event.transaction.hash.toHexString();
  let event = new FeeAmountChangedEvent(eventId);
  event.oldFeeAmount = _event.params.oldFeeAmount;
  event.newFeeAmount = _event.params.newFeeAmount;
  event.save();
}

export function handleProposalCreatedEvent(
  _event: ProposalCreated
): void {
  let account = getOrCreateAccount(
    _event.params.proposer.toHexString(),
    _event.block.timestamp
  );

  let proposal = getOrCreateProposal(_event.params.id);
  proposal.proposer = account.id;
  proposal.targets = _event.params.targets as Bytes[];
  proposal.values = _event.params.values;
  proposal.signatures = _event.params.signatures;
  proposal.calldatas = _event.params.calldatas;
  proposal.startBlock = _event.params.startBlock;
  proposal.endBlock = _event.params.endBlock;
  proposal.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new ProposalCreatedEvent(eventId);
  event.index = _event.params.id;
  event.proposer = account.id;
  proposal.targets = _event.params.targets as Bytes[];
  event.values = _event.params.values;
  event.signatures = _event.params.signatures;
  event.calldatas = _event.params.calldatas;
  event.startBlock = _event.params.startBlock;
  event.endBlock = _event.params.endBlock;
  event.description = _event.params.description;
  event.save();
}

export function handleProposalCanceledEvent(
  _event: ProposalCanceled
): void {
  let proposal = getOrCreateProposal(_event.params.id);
  proposal.canceled = true;
  proposal.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new ProposalCanceledEvent(eventId);
  event.proposalId = _event.params.id;
  event.save();
}

export function handleProposalQueuedEvent(
  _event: ProposalQueued
): void {
  let proposal = getOrCreateProposal(_event.params.id);
  proposal.eta = _event.params.eta;
  proposal.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new ProposalQueuedEvent(eventId);
  event.proposalId = _event.params.id;
  event.eta = _event.params.eta;
  event.save();
}

export function handleProposalExecutedEvent(
  _event: ProposalExecuted
): void {
  let proposal = getOrCreateProposal(_event.params.id);
  proposal.executed = true;
  proposal.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new ProposalExecutedEvent(eventId);
  event.proposalId = _event.params.id;
  event.save();
}

export function handleProposalVetoedEvent(
  _event: ProposalVetoed
): void {
  let vetoStatus = getOrCreateVetoStatus(_event.params.proposalId);
  vetoStatus.hasBeenVetoed = true;
  vetoStatus.support = _event.params.support;
  vetoStatus.save();

  let proposal = getOrCreateProposal(_event.params.proposalId);
  proposal.vetoStatus = vetoStatus.id;
  proposal.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new ProposalVetoedEvent(eventId);
  event.proposalId = _event.params.proposalId;
  event.support = _event.params.support;
  event.save();
}

export function handleVoteCastEvent(
  _event: VoteCast
): void {
  let account = getOrCreateAccount(
    _event.params.voter.toHexString(),
    _event.block.timestamp
  );

  let receipt = getOrCreateReceipt(_event.params.proposalId, account.id);
  receipt.hasVoted = true;
  receipt.support = _event.params.support;
  receipt.votes = _event.params.votes;
  receipt.save();

  let eventId = _event.transaction.hash.toHexString();
  let event = new VoteCastEvent(eventId);
  event.voter = account.id;
  event.proposalId = _event.params.proposalId;
  event.support = _event.params.support;
  event.votes = _event.params.votes;
  event.save();
}
