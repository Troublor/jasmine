import {Module} from "@nestjs/common";
import ManagerController from "./manager.controller";
import Erc20Service from "./erc20.service";
import Erc20Controller from "./erc20.controller";
import ManagerService from "./manager.service";
import EthereumController from "./ethereum.controller";
import EthereumService from "./ethereum.service";

@Module({
    controllers: [ManagerController, Erc20Controller, EthereumController],
    providers: [ManagerService, Erc20Service, EthereumService],
})
export default class EthereumModule {
}
