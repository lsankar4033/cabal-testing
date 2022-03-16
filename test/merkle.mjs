import circom_tester from 'circom_tester';

import path from 'path';

// NOTE: necessary for __dirname hack in es module
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { buildTree } from '../src/merkle.mjs';

const wasm_tester = circom_tester.wasm;

describe("merkle tree equivalence", function() {
  let circuit1;

  this.timeout(10000000);

  it("works for 1-depth merkle tree", async () => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    circuit1 = await wasm_tester(path.join(__dirname, "circuits", "merkle_1.circom"));

    let leaves = [1, 2];
    let { root, leafToPathElements, leafToPathIndices } = await buildTree(leaves);

    for (const leaf of leaves) {
      let witness = await circuit1.calculateWitness(
        {
          leaf: leaf,
          root: root,
          pathElements: leafToPathElements[leaf],
          pathIndices: leafToPathIndices[leaf]
        },
        true
      );

      await circuit1.checkConstraints(witness);
    }
  });

});
