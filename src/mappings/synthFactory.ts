import {
  CreateSynthCall,
} from "../../generated/SynthFactory/SynthFactory"
import {
  getOrCreateToken,
} from "./common";

export function handleCreateSynth(_call: CreateSynthCall): void {
  let token = getOrCreateToken(_call.inputs.token.toHexString());
  token.isSynth = true;
  token.synth = _call.outputs.value0;
  token.save();
}
