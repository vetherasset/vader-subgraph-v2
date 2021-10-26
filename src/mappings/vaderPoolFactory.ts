import { PoolCreated } from "../../generated/VaderPoolFactory/VaderPoolFactory";
import { PoolCreatedEvent } from "../../generated/schema";
import { VaderPool } from "../../generated/templates";
import {
  getOrCreatePool,
  getOrCreateToken
} from "./common";

export function handlePoolCreatedEvent(
  _event: PoolCreated
): void {
  let token0 = getOrCreateToken(_event.params.token0.toHexString());
  let token1 = getOrCreateToken(_event.params.token1.toHexString());

  VaderPool.create(_event.params.pool);

  getOrCreatePool(
    _event.params.pool.toHexString(),
    token0.id,
    token1.id
  );

  let eventId = _event.transaction.hash.toHexString();
  let event = new PoolCreatedEvent(eventId);
  event.token0 = token0.id;
  event.token1 = token1.id;
  event.pool = _event.params.pool;
  event.totalPools = _event.params.totalPools;
  event.save();
}
