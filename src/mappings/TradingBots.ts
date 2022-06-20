import {
    UpdatedOwner } from "../types/TradingBots/TradingBots";
import {
    TradingBotRegistry,
    TradingBotRegistryDayData,
    TradingBot,
    User
} from "../types/schema";
import {
    TRADING_BOT_REGISTRY_ADDRESS,
    ZERO_BI,
} from "./helpers";

export function handleUpdatedOwner(event: UpdatedOwner): void {
    let tradingBot = TradingBot.load(event.params.tradingBotID.toString());
    tradingBot.owner = event.params.newOwner.toHexString();
    tradingBot.save();

    let user = User.load(event.params.newOwner.toHexString());
    if (user === null) {
        user = new User(event.params.newOwner.toHexString());
        user.totalCollectedFees = ZERO_BI;
        user.totalFeesPaid = ZERO_BI;
        user.save();
    }
}