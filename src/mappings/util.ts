import { BigInt } from "@graphprotocol/graph-ts";

function charToI32(ch: string): i32 {
  if (ch == '0') {
    return 0;
  } else if (ch == '1') {
    return 1;
  } else if (ch == '2') {
    return 2;
  } else if (ch == '3') {
    return 3;
  } else if (ch == '4') {
    return 4;
  } else if (ch == '5') {
    return 5;
  } else if (ch == '6') {
    return 6;
  } else if (ch == '7') {
    return 7;
  } else if (ch == '8') {
    return 8;
  } else if (ch == '9') {
    return 9;
  } else {
    return 0;
  }
}

export function convertStringToBigInt(str: string): BigInt {
  let decimal = BigInt.fromI32(1);
  let value = BigInt.fromI32(0);
  for (let i = str.length - 1; i >= 0; i--) {
    value = value.plus(BigInt.fromI32(charToI32(str[i])).times(decimal));
    decimal = decimal.times(BigInt.fromI32(10));
  }

  return value;
}
