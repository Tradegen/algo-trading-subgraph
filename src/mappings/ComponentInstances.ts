import {
    TransferSingle } from "../types/templates/ComponentInstances/ComponentInstances";
import {
    ComponentsRegistry,
    ComponentsRegistryDayData,
    Indicator,
    Comparator,
    IndicatorInstance,
    ComparatorInstance,
    ComponentInstancesLookup,
    User
} from "../types/schema";
import {
    COMPONENTS_REGISTRY_ADDRESS,
    ZERO_BI,
} from "./helpers";

export function handleTransferSingle(event: TransferSingle): void {
    let lookup = ComponentInstancesLookup.load(event.address.toHexString());
    let ID = lookup.componentID.toString() + "-" + event.params.id.toString();

    let user = User.load(event.params.to.toHexString());
    if (user === null) {
        user = new User(event.params.to.toHexString());
        user.totalCollectedFees = ZERO_BI;
        user.totalFeesPaid = ZERO_BI;
        user.purchasedComparatorInstances = [];
        user.purchasedIndicatorInstances = [];
    }

    let indicatorInstance = IndicatorInstance.load(ID);
    if (indicatorInstance !== null) {
        indicatorInstance.instanceOwner = event.params.to.toHexString();
        indicatorInstance.save();

        let purchasedInstances = user.purchasedIndicatorInstances;
        purchasedInstances.push(ID);
        user.purchasedIndicatorInstances = purchasedInstances;
        user.save();
    }

    let comparatorInstance = ComparatorInstance.load(ID);
    if (comparatorInstance !== null) {
        comparatorInstance.instanceOwner = event.params.to.toHexString();
        comparatorInstance.save();

        let purchasedInstances = user.purchasedComparatorInstances;
        purchasedInstances.push(ID);
        user.purchasedComparatorInstances = purchasedInstances;
        user.save();
    }
}