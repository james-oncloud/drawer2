# CafeX Billing Exercise (Scala 2)

## Overview

This project implements the CafeX coding exercise in Scala 2.x, following the PDF requirements:

- Calculate a standard bill total from purchased menu items.
- Add service charge rules based on order contents.

The solution is built with `sbt`, uses Scala `2.13.14`, and includes unit tests with ScalaTest.

## Menu

- Cola (cold drink): `£0.50`
- Coffee (hot drink): `£1.00`
- Cheese Sandwich (cold food): `£2.00`
- Steak Sandwich (hot food): `£4.50`

## Billing Rules

### Step 1: Standard Bill

Sum item prices.

Example:

- `["Cola", "Coffee", "Cheese Sandwich"]` => `£3.50`

### Step 2: Service Charge

- If all items are drinks: no service charge.
- If any food is present: `10%` service charge.
- If any hot food is present: `20%` service charge.
- Hot food service charge is capped at `£20`.
- Final totals are rounded to 2 decimal places.

## Project Design

### Core Components

- `cafex.BillCalculator`
  - `standardBill(purchasedItems: List[String]): BigDecimal`
  - `totalBill(purchasedItems: List[String]): BigDecimal`
  - Internal menu model and service-charge logic.
- `cafex.App`
  - Minimal runnable entry point showing a sample order and total.
- `BillCalculatorSpec`
  - Unit tests for all required rules and edge cases.

### Design Notes

- Uses `BigDecimal` for money calculations (avoids floating-point precision issues).
- Menu is represented as immutable data (`Map[String, MenuItem]`).
- Unknown items fail fast with a clear `IllegalArgumentException`.
- Service charge logic is isolated in a dedicated private method for readability and testability.

## Project Structure

```text
CafeX/
  build.sbt
  project/
    build.properties
  src/
    main/
      scala/
        cafex/
          App.scala
          BillCalculator.scala
    test/
      scala/
        cafex/
          BillCalculatorSpec.scala
```

## Prerequisites

- JDK 11+ (project validated with Java 11)
- `sbt` (launcher `1.10.2` configured in `project/build.properties`)

## Compile

From project root:

```bash
sbt compile
```

## Run

Run the sample app:

```bash
sbt run
```

Expected output shape:

```text
Order: Cola, Coffee, Cheese Sandwich
Total: £3.85
```

## Test

Run all tests:

```bash
sbt test
```

Current suite covers:

- Standard billing total
- Drinks-only order (no service charge)
- Cold-food service charge (`10%`)
- Hot-food service charge (`20%`)
- Hot-food service charge cap (`£20`)
- Rounding behavior to 2 decimals
- Unknown menu item handling

## Assumptions

- Input item names must exactly match menu keys.
- Empty orders return `£0.00`.
- Totals are returned as `BigDecimal` rounded to two decimal places.

## Future Improvements

- Add a command-line interface accepting dynamic item lists.
- Support case-insensitive item matching and aliases.
- Externalize menu configuration (e.g., JSON/YAML).
- Introduce property-based tests for broader coverage.
