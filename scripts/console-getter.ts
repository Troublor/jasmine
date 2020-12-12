import SDK, {Manager, TFC, Account, Address} from "jasmine-eth-ts";
import prompts from "prompts";
import BN from "bn.js";

export default class ConsoleGetter {
    static async sdk(): Promise<SDK> {
        while (true) {
            let response0 = await prompts({
                type: 'text',
                name: 'endpoint',
                message: 'Tell me your Ethereum endpoint?',
                initial: "http://localhost:8545"
            });
            try {
                const sdk = new SDK(response0.endpoint);
                await sdk.web3.eth.getBlockNumber();
                return sdk;
            } catch (e) {
                console.error(`Something wrong with endpoint: ${e.toString()}`);
            }
        }
    }

    static async manager(sdk: SDK): Promise<Manager> {
        while (true) {
            let response1 = await prompts({
                type: 'text',
                name: 'managerAddress',
                message: 'What is the address of Manager contract?',
                validate: input => (sdk as SDK).web3.utils.isAddress(input),
            });
            try {
                const manager = sdk.getManager(response1.managerAddress);
                await manager.tfcAddress();
                return manager;
            } catch (e) {
                console.error(`Manager contract not found at address ${response1.managerAddress}: ${e.toString()}`);
            }
        }
    }

    static async tfc(sdk: SDK): Promise<TFC> {
        while (true) {
            let response1 = await prompts({
                type: 'text',
                name: 'tfcAddress',
                message: 'What is the address of TFCToken (ERC20) contract?',
                validate: input => (sdk as SDK).web3.utils.isAddress(input),
            });
            try {
                const tfc = sdk.getTFC(response1.tfcAddress);
                await tfc.symbol();
                return tfc;
            } catch (e) {
                console.error(`TFCToken (ERC20) contract not found at address ${response1.tfcAddress}: ${e.toString()}`);
            }
        }
    }

    static async account(sdk: SDK, accountName?: string, mustHaveBalance: boolean = false): Promise<Account> {
        while (true) {
            let response2 = await prompts({
                type: "text",
                name: "privateKey",
                message: `What is the private key of your ${accountName ? accountName + " " : ""}account?`,
                validate: prev => {
                    try {
                        sdk.retrieveAccount(prev);
                        return true;
                    } catch (e) {
                        return `Something wrong with your private key: ${e.toString()}`;
                    }
                }
            });

            const account = sdk.retrieveAccount(response2.privateKey);
            if (mustHaveBalance) {
                try {
                    const balance = await sdk.balanceOf((account as Account).address);
                    if (balance.eq(new BN(0))) {
                        console.error(`Your account has no ETH balance. Cannot deploy contract with this account.`);
                    }
                    return account;
                } catch (e) {
                    console.error(`Fail to get balance of this account: ${e.toString()}`);
                }
            } else {
                return account;
            }
        }
    }

    static async address(sdk?: SDK, addressName?: string): Promise<Address> {
        let response3 = await prompts({
            type: 'text',
            name: 'recipient',
            message: `What is the address${addressName ? " " + addressName : ""}?`,
            validate: input => (sdk as SDK).web3.utils.isAddress(input),
        });
        return response3.recipient;
    }

    static async BN(msg: string): Promise<BN> {
        let response4 = await prompts({
            type: 'text',
            name: 'amount',
            message: msg,
            min: 0
        });
        return new BN(response4.amount);
    }
}
