import {
    MintedTradingBot,
    PublishedTradingBot,
    SetRulesForTradingBot,
    CreatedTradingBot,
    IntializedTradingBot,
    StagedTradingBot } from "../types/TradingBotRegistry/TradingBotRegistry";
import {
    TradingBotRegistry,
    TradingBotRegistryDayData,
    TradingBot,
    User,
    ComparatorInstance
} from "../types/schema";
import {
    TRADING_BOT_REGISTRY_ADDRESS,
    ADDRESS_ZERO,
    ZERO_BI,
} from "./helpers";
import { updateTradingBotRegistryDayData } from "./dayUpdates";

export function handleMintedTradingBot(event: MintedTradingBot): void {
    let tradingBotRegistry = new TradingBotRegistry(TRADING_BOT_REGISTRY_ADDRESS);
    tradingBotRegistry.numberOfTradingBotNFTs = tradingBotRegistry.numberOfTradingBotNFTs + 1;
    tradingBotRegistry.collectedFees = tradingBotRegistry.collectedFees.plus(event.params.mintFeePaid);
    tradingBotRegistry.save();

    // Don't check if tradingBot is null because the bot entity would have been
    // created in a handleStagedTradingBot event before this event.
    let tradingBot = TradingBot.load(event.params.index.toString());
    tradingBot.status = 5;
    tradingBot.save();

    let tradingBotRegistryDayData = updateTradingBotRegistryDayData(event);
    tradingBotRegistryDayData.dailyCollectedFees = tradingBotRegistryDayData.dailyCollectedFees.plus(event.params.mintFeePaid);
    tradingBotRegistryDayData.dailyMintedTradingBotNFTs = tradingBotRegistryDayData.dailyMintedTradingBotNFTs + 1;
    tradingBotRegistryDayData.save();

    let user = User.load(tradingBot.owner);
    user.totalFeesPaid = user.totalFeesPaid.plus(event.params.mintFeePaid);
    user.save();
}

export function handlePublishedTradingBot(event: PublishedTradingBot): void {
    // Don't check if tradingBot is null because the bot entity would have been
    // created in a handleStagedTradingBot event before this event.
    let tradingBot = TradingBot.load(event.params.index.toString());
    tradingBot.status = 6;
    tradingBot.dataFeed = event.params.dataFeed.toHexString();
    tradingBot.save();

    let tradingBotRegistry = new TradingBotRegistry(TRADING_BOT_REGISTRY_ADDRESS);
    tradingBotRegistry.numberOfPublishedTradingBots = tradingBotRegistry.numberOfPublishedTradingBots + 1;
    tradingBotRegistry.save();

    let tradingBotRegistryDayData = updateTradingBotRegistryDayData(event);
    tradingBotRegistryDayData.dailyPublishedTradingBots = tradingBotRegistryDayData.dailyPublishedTradingBots + 1;
    tradingBotRegistryDayData.save();
}

export function handleSetRulesForTradingBot(event: SetRulesForTradingBot): void {
    // Don't check if tradingBot is null because the bot entity would have been
    // created in a handleStagedTradingBot event before this event.
    let tradingBot = TradingBot.load(event.params.index.toString());
    tradingBot.status = 4;
    tradingBot.save();

    let entryRuleComponents = event.params.entryRuleComponents;
    let entryRuleInstances = event.params.entryRuleInstances;
    let exitRuleComponents = event.params.exitRuleComponents;
    let exitRuleInstances = event.params.exitRuleInstances;
    let entryRules: ComparatorInstance[] = [];
    let exitRules: ComparatorInstance[] = [];

    for (var i = 0; i < entryRuleComponents.length; i++) {
        let IDString: string = entryRuleComponents[i].toI32().toString() + "-" + entryRuleInstances[i].toI32().toString();
        let comparatorInstance = ComparatorInstance.load(IDString);
        if (comparatorInstance !== null) {
            entryRules.push(comparatorInstance);
        }
    }

    for (var i = 0; i < exitRuleComponents.length; i++) {
        let IDString: string = exitRuleComponents[i].toI32().toString() + "-" + exitRuleInstances[i].toI32().toString();
        let comparatorInstance = ComparatorInstance.load(IDString);
        if (comparatorInstance !== null) {
            exitRules.push(comparatorInstance);
        }
    }

    tradingBot.entryRules = entryRules;
    tradingBot.exitRules = exitRules;
    tradingBot.save();
}

export function handleCreatedTradingBot(event: CreatedTradingBot): void {
    // Don't check if tradingBot is null because the bot entity would have been
    // created in a handleStagedTradingBot event before this event.
    let tradingBot = TradingBot.load(event.params.index.toString());
    tradingBot.status = 2;
    tradingBot.contractAddress = event.params.tradingBotAddress.toHexString();
    tradingBot.save();
}

export function handleInitializedTradingBot(event: IntializedTradingBot): void {
    // Don't check if tradingBot is null because the bot entity would have been
    // created in a handleStagedTradingBot event before this event.
    let tradingBot = TradingBot.load(event.params.index.toString());
    tradingBot.status = 3;
    tradingBot.save();
}

export function handleStagedTradingBot(event: StagedTradingBot): void {
    // Load TradingBotRegistry (create if first trading bot).
    let tradingBotRegistry = TradingBotRegistry.load(TRADING_BOT_REGISTRY_ADDRESS);
    if (tradingBotRegistry === null) {
        tradingBotRegistry = new TradingBotRegistry(TRADING_BOT_REGISTRY_ADDRESS);
        tradingBotRegistry.numberOfPublishedTradingBots = 0;
        tradingBotRegistry.numberOfTradingBotNFTs = 0;
        tradingBotRegistry.collectedFees = ZERO_BI;
    }

    tradingBotRegistry.save();

    let tradingBot = new TradingBot(event.params.index.toString());
    tradingBot.status = 1;
    tradingBot.contractAddress = ADDRESS_ZERO; // Placeholder.
    tradingBot.createdOn = event.block.timestamp;
    tradingBot.owner = event.params.owner.toHexString();
    tradingBot.developer = event.params.owner.toHexString();
    tradingBot.operator = event.params.owner.toHexString();
    tradingBot.keeper = ADDRESS_ZERO; // Placeholder.
    tradingBot.dataFeed = ADDRESS_ZERO; // Placeholder.
    tradingBot.name = event.params.name;
    tradingBot.symbol = event.params.symbol;
    tradingBot.tradingBotTimeframe = event.params.timeframe;
    tradingBot.maxTradeDuration = event.params.maxTradeDuration;
    tradingBot.profitTarget = event.params.profitTarget;
    tradingBot.stopLoss = event.params.stopLoss;
    tradingBot.tradedAsset = event.params.tradedAsset;
    tradingBot.assetTimeframe = event.params.assetTimeframe;
    tradingBot.usageFee = event.params.usageFee;
    tradingBot.entryRules = []; // Placeholder.
    tradingBot.exitRules = []; // Placeholder.
    tradingBot.save();

    let user = User.load(event.params.owner.toHexString());
    if (user === null) {
        user = new User(event.params.owner.toHexString());
        user.totalCollectedFees = ZERO_BI;
        user.totalFeesPaid = ZERO_BI;
        user.save();
    }
}