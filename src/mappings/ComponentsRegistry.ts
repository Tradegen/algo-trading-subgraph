import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
 MarkedComponentInstanceAsDefault,
 UpdatedComponentInstancePrice,
 PurchasedComponentInstance,
 UpdatedComponentFee,
 CreatedIndicatorInstance,
 CreatedComparatorInstance,
 PublishedComponent } from "../types/ComponentsRegistry/ComponentsRegistry";
import {
  ComponentsRegistry,
  ComponentsRegistryDayData,
  Indicator,
  Comparator,
  IndicatorInstance,
  ComparatorInstance,
  PurchaseComponentInstance,
  User,
  ComponentInstancesLookup
} from "../types/schema";
import { ComponentInstances as ComponentInstancesTemplate } from "../types/templates";
import {
  COMPONENTS_REGISTRY_ADDRESS,
  ZERO_BI,
} from "./helpers";
import { updateComponentsRegistryDayData } from "./dayUpdates";

export function handleMarkedComponentInstanceAsDefault(event: MarkedComponentInstanceAsDefault): void {
  let componentsRegistry = ComponentsRegistry.load(COMPONENTS_REGISTRY_ADDRESS);
  componentsRegistry.txCount = componentsRegistry.txCount + 1;
  componentsRegistry.save();

  let ID = event.params.componentID.toString() + "-" + event.params.instanceID.toString();
  let indicatorInstance = IndicatorInstance.load(ID);
  if (indicatorInstance !== null) {
    indicatorInstance.isDefault = true;
    indicatorInstance.save();
  }

  let comparatorInstance = ComparatorInstance.load(ID);
  if (comparatorInstance !== null) {
    comparatorInstance.isDefault = true;
    comparatorInstance.save();
  }
}

export function handleUpdatedComponentInstancePrice(event: UpdatedComponentInstancePrice): void {
  let componentsRegistry = ComponentsRegistry.load(COMPONENTS_REGISTRY_ADDRESS);
  componentsRegistry.txCount = componentsRegistry.txCount + 1;
  componentsRegistry.save();

  let ID = event.params.componentID.toString() + "-" + event.params.instanceID.toString();
  let indicatorInstance = IndicatorInstance.load(ID);
  if (indicatorInstance !== null) {
    indicatorInstance.price = event.params.newPrice;
    indicatorInstance.save();
  }

  let comparatorInstance = ComparatorInstance.load(ID);
  if (comparatorInstance !== null) {
    comparatorInstance.price = event.params.newPrice;
    comparatorInstance.save();
  }
}

export function handlePurchasedComponentInstance(event: PurchasedComponentInstance): void {
  let componentsRegistry = ComponentsRegistry.load(COMPONENTS_REGISTRY_ADDRESS);
  componentsRegistry.txCount = componentsRegistry.txCount + 1;
  componentsRegistry.save();

  let ID = event.params.componentID.toString() + "-" + event.params.instanceID.toString();

  let purchaseComponentInstance = new PurchaseComponentInstance(event.transaction.hash.toHexString());
  purchaseComponentInstance.componentID = event.params.componentID;
  purchaseComponentInstance.instanceID = event.params.instanceID;
  purchaseComponentInstance.buyer = event.params.user.toHexString();
  purchaseComponentInstance.timestamp = event.block.timestamp;

  let componentsRegistryDayData = updateComponentsRegistryDayData(event);

  let user = User.load(event.params.user.toHexString());
  if (user === null) {
    user = new User(event.params.user.toHexString());
    user.totalCollectedFees = ZERO_BI;
    user.totalFeesPaid = ZERO_BI;
    user.purchasedComparatorInstances = [];
    user.purchasedIndicatorInstances = [];
  }

  let owner: string;
  let indicatorInstance = IndicatorInstance.load(ID);
  if (indicatorInstance !== null) {
    owner = indicatorInstance.instanceOwner;
    indicatorInstance.collectedFees = indicatorInstance.collectedFees.plus(indicatorInstance.price);
    indicatorInstance.save();

    componentsRegistry.numberOfIndicatorInstancePurchases = componentsRegistry.numberOfIndicatorInstancePurchases + 1;
    componentsRegistry.indicatorInstanceVolume = componentsRegistry.indicatorInstanceVolume.plus(indicatorInstance.price);
    componentsRegistry.save();

    let purchasedInstances = user.purchasedIndicatorInstances;
    purchasedInstances.push(ID);
    user.purchasedIndicatorInstances = purchasedInstances;
    user.save();

    purchaseComponentInstance.owner = owner;
    purchaseComponentInstance.price = indicatorInstance.price;
    purchaseComponentInstance.save();

    componentsRegistryDayData.dailyCombinedVolume = componentsRegistryDayData.dailyCombinedVolume.plus(indicatorInstance.price);
    componentsRegistryDayData.dailyIndicatorInstanceVolume = componentsRegistryDayData.dailyIndicatorInstanceVolume.plus(indicatorInstance.price);
    componentsRegistryDayData.dailyIndicatorInstancesCreated = componentsRegistryDayData.dailyIndicatorInstancesCreated + 1;
    componentsRegistryDayData.save();
  }

  let comparatorInstance = ComparatorInstance.load(ID);
  if (comparatorInstance !== null) {
    owner = comparatorInstance.instanceOwner;
    comparatorInstance.collectedFees = comparatorInstance.collectedFees.plus(comparatorInstance.price);
    comparatorInstance.save();

    componentsRegistry.numberOfComparatorInstancePurchases = componentsRegistry.numberOfComparatorInstancePurchases + 1;
    componentsRegistry.comparatorInstanceVolume = componentsRegistry.comparatorInstanceVolume.plus(comparatorInstance.price);
    componentsRegistry.save();

    let purchasedInstances = user.purchasedComparatorInstances;
    purchasedInstances.push(ID);
    user.purchasedComparatorInstances = purchasedInstances;
    user.save();

    purchaseComponentInstance.owner = owner;
    purchaseComponentInstance.price = comparatorInstance.price;
    purchaseComponentInstance.save();

    componentsRegistryDayData.dailyCombinedVolume = componentsRegistryDayData.dailyCombinedVolume.plus(comparatorInstance.price);
    componentsRegistryDayData.dailyComparatorInstanceVolume = componentsRegistryDayData.dailyComparatorInstanceVolume.plus(comparatorInstance.price);
    componentsRegistryDayData.dailyComparatorInstancesCreated = componentsRegistryDayData.dailyComparatorInstancesCreated + 1;
    componentsRegistryDayData.save();
  }
}

export function handleUpdatedComponentFee(event: UpdatedComponentFee): void {
  let componentsRegistry = ComponentsRegistry.load(COMPONENTS_REGISTRY_ADDRESS);
  componentsRegistry.txCount = componentsRegistry.txCount + 1;
  componentsRegistry.save();

  let indicator = Indicator.load(event.params.componentID.toString());
  if (indicator !== null) {
    indicator.fee = event.params.newFee;
    indicator.save();
  }

  let comparator = Comparator.load(event.params.componentID.toString());
  if (comparator !== null) {
    comparator.fee = event.params.newFee;
    comparator.save();
  }
}

export function handleCreatedIndicatorInstance(event: CreatedIndicatorInstance): void {
  let componentsRegistry = ComponentsRegistry.load(COMPONENTS_REGISTRY_ADDRESS);
  componentsRegistry.txCount = componentsRegistry.txCount + 1;
  componentsRegistry.indicatorInstanceCount = componentsRegistry.indicatorInstanceCount + 1;
  componentsRegistry.save();

  let indicator = Indicator.load(event.params.componentID.toString());
  indicator.collectedFees = indicator.collectedFees.plus(indicator.fee);
  indicator.save();

  let user = User.load(event.params.owner.toHexString());
  if (user === null) {
    user = new User(event.params.owner.toHexString());
    user.totalCollectedFees = ZERO_BI;
    user.totalFeesPaid = ZERO_BI;
    user.purchasedComparatorInstances = [];
    user.purchasedIndicatorInstances = [];
  }
  user.totalFeesPaid = user.totalFeesPaid.plus(indicator.fee);
  let purchasedInstances = user.purchasedIndicatorInstances;
  let ID = event.params.componentID.toString() + "-" + event.params.instanceID.toString();
  purchasedInstances.push(ID);
  user.purchasedIndicatorInstances = purchasedInstances;
  user.save();

  componentsRegistry.totalVolume = componentsRegistry.totalVolume.plus(indicator.fee);
  componentsRegistry.indicatorVolume = componentsRegistry.indicatorVolume.plus(indicator.fee);
  componentsRegistry.save();

  let indicatorInstance = new IndicatorInstance(ID);
  indicatorInstance.createdOn = event.block.timestamp;
  indicatorInstance.instanceID = event.params.instanceID;
  indicatorInstance.componentID = event.params.componentID;
  indicatorInstance.indicator = event.params.componentID.toString();
  indicatorInstance.price = event.params.price;
  indicatorInstance.isDefault = event.params.isDefault;
  indicatorInstance.instanceOwner = event.params.owner.toHexString();
  indicatorInstance.developer = event.params.owner.toHexString();
  indicatorInstance.asset = event.params.asset;
  indicatorInstance.assetTimeframe = event.params.assetTimeframe;
  indicatorInstance.indicatorTimeframe = event.params.indicatorTimeframe;
  indicatorInstance.params = event.params.params.toString();
  indicatorInstance.collectedFees = ZERO_BI;
  indicatorInstance.save();

  let componentsRegistryDayData = updateComponentsRegistryDayData(event);
  componentsRegistryDayData.dailyCombinedVolume = componentsRegistryDayData.dailyCombinedVolume.plus(indicator.fee);
  componentsRegistryDayData.dailyIndicatorVolume = componentsRegistryDayData.dailyIndicatorVolume.plus(indicator.fee);
  componentsRegistryDayData.dailyIndicatorInstancesCreated = componentsRegistryDayData.dailyIndicatorInstancesCreated + 1;
  componentsRegistryDayData.txCount = componentsRegistryDayData.txCount + 1;
  componentsRegistryDayData.save();
}

export function handleCreatedComparatorInstance(event: CreatedComparatorInstance): void {
  let componentsRegistry = ComponentsRegistry.load(COMPONENTS_REGISTRY_ADDRESS);
  componentsRegistry.txCount = componentsRegistry.txCount + 1;
  componentsRegistry.comparatorInstanceCount = componentsRegistry.comparatorInstanceCount + 1;
  componentsRegistry.save();

  let comparator = Comparator.load(event.params.componentID.toString());
  comparator.collectedFees = comparator.collectedFees.plus(comparator.fee);
  comparator.save();

  let user = User.load(event.params.owner.toHexString());
  if (user === null) {
    user = new User(event.params.owner.toHexString());
    user.totalCollectedFees = ZERO_BI;
    user.totalFeesPaid = ZERO_BI;
    user.purchasedComparatorInstances = [];
    user.purchasedIndicatorInstances = [];
  }
  user.totalFeesPaid = user.totalFeesPaid.plus(comparator.fee);
  let purchasedInstances = user.purchasedComparatorInstances;
  let ID = event.params.componentID.toString() + "-" + event.params.instanceID.toString();
  purchasedInstances.push(ID);
  user.purchasedComparatorInstances = purchasedInstances;
  user.save();

  componentsRegistry.totalVolume = componentsRegistry.totalVolume.plus(comparator.fee);
  componentsRegistry.comparatorVolume = componentsRegistry.comparatorVolume.plus(comparator.fee);
  componentsRegistry.save();

  let comparatorInstance = new ComparatorInstance(ID);
  comparatorInstance.createdOn = event.block.timestamp;
  comparatorInstance.instanceID = event.params.instanceID;
  comparatorInstance.componentID = event.params.componentID;
  comparatorInstance.comparator = event.params.componentID.toString();
  let ID1 = event.params.firstIndicatorID.toString() + "-" + event.params.firstIndicatorInstanceID.toString();
  let ID2 = event.params.secondIndicatorID.toString() + "-" + event.params.secondIndicatorInstanceID.toString();
  comparatorInstance.indicator1 = ID1;
  comparatorInstance.indicator2 = ID2;
  comparatorInstance.price = event.params.price;
  comparatorInstance.isDefault = event.params.isDefault;
  comparatorInstance.instanceOwner = event.params.owner.toHexString();
  comparatorInstance.developer = event.params.owner.toHexString();
  comparatorInstance.collectedFees = ZERO_BI;

  let indicatorInstance1 = IndicatorInstance.load(ID1);
  let indicatorInstance2 = IndicatorInstance.load(ID2);
  comparatorInstance.comparatorTimeframe = indicatorInstance1.indicatorTimeframe < indicatorInstance2.indicatorTimeframe ? indicatorInstance1.indicatorTimeframe : indicatorInstance2.indicatorTimeframe;
  comparatorInstance.save();

  let componentsRegistryDayData = updateComponentsRegistryDayData(event);
  componentsRegistryDayData.dailyCombinedVolume = componentsRegistryDayData.dailyCombinedVolume.plus(comparator.fee);
  componentsRegistryDayData.dailyComparatorVolume = componentsRegistryDayData.dailyIndicatorVolume.plus(comparator.fee);
  componentsRegistryDayData.dailyComparatorInstancesCreated = componentsRegistryDayData.dailyComparatorInstancesCreated + 1;
  componentsRegistryDayData.txCount = componentsRegistryDayData.txCount + 1;
  componentsRegistryDayData.save();
}

export function handlePublishedComponent(event: PublishedComponent): void {
  let componentsRegistry = ComponentsRegistry.load(COMPONENTS_REGISTRY_ADDRESS);
  if (componentsRegistry === null) {
    componentsRegistry = new ComponentsRegistry(COMPONENTS_REGISTRY_ADDRESS);
    componentsRegistry.txCount = 0;
    componentsRegistry.comparatorCount = 0;
    componentsRegistry.indicatorCount = 0;
    componentsRegistry.indicatorInstanceCount = 0;
    componentsRegistry.comparatorInstanceCount = 0;
    componentsRegistry.numberOfComparatorInstancePurchases = 0;
    componentsRegistry.numberOfIndicatorInstancePurchases = 0;
    componentsRegistry.totalVolume = ZERO_BI;
    componentsRegistry.indicatorVolume = ZERO_BI;
    componentsRegistry.comparatorVolume = ZERO_BI;
    componentsRegistry.indicatorInstanceVolume = ZERO_BI;
    componentsRegistry.comparatorInstanceVolume = ZERO_BI;
  }

  componentsRegistry.txCount = componentsRegistry.txCount + 1;

  if (event.params.isIndicator) {
    componentsRegistry.indicatorCount = componentsRegistry.indicatorCount + 1;
    componentsRegistry.save();

    let indicator = new Indicator(event.params.componentID.toString());
    indicator.publishedOn = event.block.timestamp;
    indicator.developer = event.params.componentOwner.toHexString();
    indicator.instancesAddress = event.params.instancesAddress.toHexString();
    indicator.contractAddress = event.params.contractAddress.toHexString();
    indicator.componentOwner = event.params.componentOwner.toHexString();
    indicator.fee = event.params.fee;
    indicator.collectedFees = ZERO_BI;
    indicator.save();
  }
  else {
    componentsRegistry.comparatorCount = componentsRegistry.comparatorCount + 1;
    componentsRegistry.save();

    let comparator = new Comparator(event.params.componentID.toString());
    comparator.publishedOn = event.block.timestamp;
    comparator.developer = event.params.componentOwner.toHexString();
    comparator.instancesAddress = event.params.instancesAddress.toHexString();
    comparator.contractAddress = event.params.contractAddress.toHexString();
    comparator.componentOwner = event.params.componentOwner.toHexString();
    comparator.fee = event.params.fee;
    comparator.collectedFees = ZERO_BI;
    comparator.save();
  }

  let user = User.load(event.params.componentOwner.toHexString());
  if (user === null) {
    user = new User(event.params.componentOwner.toHexString());
    user.totalCollectedFees = ZERO_BI;
    user.totalFeesPaid = ZERO_BI;
    user.purchasedComparatorInstances = [];
    user.purchasedIndicatorInstances = [];
    user.save();
  }

  let lookup = new ComponentInstancesLookup(event.params.instancesAddress.toHexString());
  lookup.componentID = event.params.componentID;
  lookup.save();

  // Create the tracked contract based on the template.
  ComponentInstancesTemplate.create(event.params.instancesAddress);
}