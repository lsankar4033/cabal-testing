import circom_tester from 'circom_tester';

import path from 'path';

// NOTE: necessary for __dirname hack in es module
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { buildTree } from '../src/merkle.mjs';

const wasm_tester = circom_tester.wasm;

async function testLeaves(circuit, leaves) {
  let { root, leafToPathElements, leafToPathIndices } = await buildTree(leaves);
  for (const leaf of leaves) {
    let witness = await circuit.calculateWitness(
      {
        leaf: leaf,
        root: root,
        pathElements: leafToPathElements[leaf],
        pathIndices: leafToPathIndices[leaf]
      },
      true
    );

    await circuit.checkConstraints(witness);
  }
}

describe("merkle tree equivalence", function() {
  this.timeout(10000000);

  it("works for 1-depth merkle tree", async () => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    let circuit = await wasm_tester(path.join(__dirname, "circuits", "merkle_1.circom"));

    let leaves = [32914021943021, 31593205932];

    await testLeaves(circuit, leaves);
  });

  describe("works for 2-depth merkle tree", () => {

    it("no null elements", async () => {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      let circuit = await wasm_tester(path.join(__dirname, "circuits", "merkle_2.circom"));

      let leaves = [58832943290, 9432001023, 9530201010231, 488100101];
      await testLeaves(circuit, leaves);
    });

    it.only("single null element (at end)", async () => {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      let circuit = await wasm_tester(path.join(__dirname, "circuits", "merkle_2.circom"));

      let leaves = [58832943290, 9432001023, 9530201010231];
      await testLeaves(circuit, leaves);
    });
  });

  //it("works for 10-depth merkle tree using devcon poap values", async () => {

  //});
});
