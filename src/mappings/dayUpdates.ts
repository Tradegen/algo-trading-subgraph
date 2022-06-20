import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  ComponentsRegistry,
  ComponentsRegistryDayData,
  TradingBotRegistry,
  TradingBotRegistryDayData,
} from "../types/schema";
import {
  COMPONENTS_REGISTRY_ADDRESS,
  TRADING_BOT_REGISTRY_ADDRESS,
  ZERO_BI } from "./helpers";

export function updateComponentsRegistryDayData(event: ethereum.Event): ComponentsRegistryDayData {
  let componentsRegistry = ComponentsRegistry.load(COMPONENTS_REGISTRY_ADDRESS);
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let componentsRegistryDayData = ComponentsRegistryDayData.load(dayID.toString());
  if (componentsRegistryDayData === null)
  {
    componentsRegistryDayData = new ComponentsRegistryDayData(dayID.toString());
    componentsRegistryDayData.date = dayStartTimestamp;
    componentsRegistryDayData.dailyCombinedVolume = ZERO_BI;
    componentsRegistryDayData.dailyIndicatorVolume = ZERO_BI;
    componentsRegistryDayData.dailyComparatorVolume = ZERO_BI;
    componentsRegistryDayData.dailyIndicatorInstanceVolume = ZERO_BI;
    componentsRegistryDayData.dailyComparatorInstanceVolume = ZERO_BI;
    componentsRegistryDayData.totalCombinedVolume = ZERO_BI;
    componentsRegistryDayData.totalIndicatorVolume = ZERO_BI;
    componentsRegistryDayData.totalComparatorVolume = ZERO_BI;
    componentsRegistryDayData.totalIndicatorInstanceVolume = ZERO_BI;
    componentsRegistryDayData.totalComparatorInstanceVolume = ZERO_BI;
    componentsRegistryDayData.dailyIndicatorInstancesCreated = 0;
    componentsRegistryDayData.dailyComparatorInstancesCreated = 0;
    componentsRegistryDayData.dailyIndicatorInstancesPurchased = 0;
    componentsRegistryDayData.dailyComparatorInstancesPurchased = 0;
    componentsRegistryDayData.txCount = 0;
  }

  componentsRegistryDayData.totalCombinedVolume = componentsRegistry.totalVolume;
  componentsRegistryDayData.totalIndicatorVolume = componentsRegistry.indicatorVolume;
  componentsRegistryDayData.totalComparatorVolume = componentsRegistry.comparatorVolume;
  componentsRegistryDayData.totalIndicatorInstanceVolume = componentsRegistry.indicatorInstanceVolume;
  componentsRegistryDayData.totalComparatorInstanceVolume = componentsRegistry.comparatorInstanceVolume;
  componentsRegistryDayData.txCount = componentsRegistry.txCount;
  componentsRegistryDayData.save();

  return componentsRegistryDayData as ComponentsRegistryDayData;
}

export function updateTradingBotRegistryDayData(event: ethereum.Event): TradingBotRegistryDayData {
    let tradingBotRegistry = TradingBotRegistry.load(TRADING_BOT_REGISTRY_ADDRESS);
    let timestamp = event.block.timestamp.toI32();
    let dayID = timestamp / 86400;
    let dayStartTimestamp = dayID * 86400;
    let tradingBotRegistryDayData = TradingBotRegistryDayData.load(dayID.toString());
    if (tradingBotRegistryDayData === null)
    {
      tradingBotRegistryDayData = new TradingBotRegistryDayData(dayID.toString());
      tradingBotRegistryDayData.date = dayStartTimestamp;
      tradingBotRegistryDayData.dailyCollectedFees = ZERO_BI;
      tradingBotRegistryDayData.totalCollectedFees = ZERO_BI;
      tradingBotRegistryDayData.dailyMintedTradingBotNFTs = 0;
      tradingBotRegistryDayData.dailyPublishedTradingBots = 0;
    }
  
    tradingBotRegistryDayData.totalCollectedFees = tradingBotRegistry.collectedFees;
    tradingBotRegistryDayData.save();
  
    return tradingBotRegistryDayData as TradingBotRegistryDayData;
  }