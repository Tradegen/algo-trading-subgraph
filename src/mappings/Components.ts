import {
    TransferSingle } from "../types/Components/Components";
import {
    ComponentsRegistry,
    ComponentsRegistryDayData,
    Indicator,
    Comparator,
    User
} from "../types/schema";
import {
    COMPONENTS_REGISTRY_ADDRESS,
    ZERO_BI,
} from "./helpers";

export function handleTransferSingle(event: TransferSingle): void {
    let indicator = Indicator.load(event.params.id.toString());
    if (indicator !== null) {
        indicator.componentOwner = event.params.to.toHexString();
        indicator.save();
    }

    let comparator = Comparator.load(event.params.id.toString());
    if (comparator !== null) {
        comparator.componentOwner = event.params.to.toHexString();
        comparator.save();
    }

    let user = User.load(event.params.to.toHexString());
    if (user === null) {
        user = new User(event.params.to.toHexString());
        user.totalCollectedFees = ZERO_BI;
        user.totalFeesPaid = ZERO_BI;
        user.purchasedComparatorInstances = [];
        user.purchasedIndicatorInstances = [];
        user.save();
    }
}