/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import BN from "bn.js";
import { EventData, PastEventOptions } from "web3-eth-contract";

export interface TfcManagerContract
  extends Truffle.Contract<TfcManagerInstance> {
  "new"(meta?: Truffle.TransactionDetails): Promise<TfcManagerInstance>;
}

export interface ClaimTFC {
  name: "ClaimTFC";
  args: {
    recipient: string;
    amount: BN;
    nonce: BN;
    sig: string;
    0: string;
    1: BN;
    2: BN;
    3: string;
  };
}

type AllEvents = ClaimTFC;

export interface TfcManagerInstance extends Truffle.ContractInstance {
  claimTFC: {
    (
      amount: number | BN | string,
      nonce: number | BN | string,
      sig: string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<Truffle.TransactionResponse<AllEvents>>;
    call(
      amount: number | BN | string,
      nonce: number | BN | string,
      sig: string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<void>;
    sendTransaction(
      amount: number | BN | string,
      nonce: number | BN | string,
      sig: string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<string>;
    estimateGas(
      amount: number | BN | string,
      nonce: number | BN | string,
      sig: string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<number>;
  };

  signer(txDetails?: Truffle.TransactionDetails): Promise<string>;

  tfcToken(txDetails?: Truffle.TransactionDetails): Promise<string>;

  usedNonces(
    arg0: number | BN | string,
    txDetails?: Truffle.TransactionDetails
  ): Promise<boolean>;

  methods: {
    claimTFC: {
      (
        amount: number | BN | string,
        nonce: number | BN | string,
        sig: string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<Truffle.TransactionResponse<AllEvents>>;
      call(
        amount: number | BN | string,
        nonce: number | BN | string,
        sig: string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<void>;
      sendTransaction(
        amount: number | BN | string,
        nonce: number | BN | string,
        sig: string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<string>;
      estimateGas(
        amount: number | BN | string,
        nonce: number | BN | string,
        sig: string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<number>;
    };

    signer(txDetails?: Truffle.TransactionDetails): Promise<string>;

    tfcToken(txDetails?: Truffle.TransactionDetails): Promise<string>;

    usedNonces(
      arg0: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<boolean>;
  };

  getPastEvents(event: string): Promise<EventData[]>;
  getPastEvents(
    event: string,
    options: PastEventOptions,
    callback: (error: Error, event: EventData) => void
  ): Promise<EventData[]>;
  getPastEvents(event: string, options: PastEventOptions): Promise<EventData[]>;
  getPastEvents(
    event: string,
    callback: (error: Error, event: EventData) => void
  ): Promise<EventData[]>;
}
