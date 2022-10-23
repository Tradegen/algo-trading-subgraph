# Algo Trading Subgraph

This subgraph dynamically tracks indicators, comparators, trading bots, indicator instances, and comparator instances in the [Tradegen algo trading protocol](https://github.com/Tradegen/algo-trading).

- aggregated data across indicators, comparators, and indicator/comparator instances,
- aggregated data across trading bots,
- data on individual indicators, comparators, and instances,
- data on individual trading bots,
- data on each user's indicators/comparators owned/developed, trading bots owned/developed, component instances owned/developed, and fees paid/collected,
- historical data on indicator/comparator/instance volume and creations/purchases
- historical data on trading bot fees, minted bots, and published bots

## Running Locally

Make sure to update package.json settings to point to your own graph account.

## Key Entity Overviews

#### ComponentsRegistry

Contains aggregated data across all indicators, comparators, and indicator/comparator instances. This entity tracks creations, purchases, and volume by type. 

#### TradingBotRegistry

Contains aggregated data across all trading bots. This entity tracks the number of trading bot NFTs minted, the number of trading bots published to the platform, and the total fees collected.

#### Indicator

Represents an [Indicator](https://github.com/Tradegen/algo-trading/blob/main/contracts/interfaces/IIndicator.sol) contract. Tracks the contract address, NFT owner, contract developer, instance fee, and associated instances.

#### Comparator

Represents an [Comparator](https://github.com/Tradegen/algo-trading/blob/main/contracts/interfaces/IComparator.sol) contract. Tracks the contract address, NFT owner, contract developer, instance fee, and associated instances.

#### IndicatorInstance

Represents an instance in an indicator's [ComponentInstances contract](https://github.com/Tradegen/algo-trading/blob/main/contracts/ComponentInstances.sol). Tracks an instance's parameters, developer, NFT owner, and price.

#### ComparatorInstance

Represents an instance in a comparator's [ComponentInstances contract](https://github.com/Tradegen/algo-trading/blob/main/contracts/ComponentInstances.sol). Tracks an instance's parameters, developer, NFT owner, and price.

#### User

Contains data on a specific user. This entity tracks a user's total fees collected/paid and comparators/indicators/instances/bots developed/owned.

## Example Queries

### Querying Aggregated Data

This query fetches aggredated data from all indicators and comparators.

```graphql
{
  componentsRegistries(first: 1) {
    comparatorCount
    indicatorCount
    comparatorInstanceCount
    indicatorInstanceCount
    indicatorVolume
    comparatorVolume
  }
}
```
