---
id: order-lifecycle
store: domain
title: Order Lifecycle
description: "Order states, transitions, cancellation and refund conditions, fulfillment flow"
last_updated: 2026-04-17
---

# Order Lifecycle

An order represents a customer's purchase request, tracked from creation through fulfillment to completion or cancellation.

## Definition

An **Order** is created when a customer confirms their shopping cart for checkout. It progresses through payment, fulfillment, and delivery stages. Each order contains one or more **line items**, each referencing a product SKU and quantity.

## Workflow / States

```
Created → Confirmed → Paid → Shipped → Delivered → Closed
                 ↘                ↘
              Cancelled         Returned
```

| From | To | Trigger | Condition |
|---|---|---|---|
| Created | Confirmed | Customer submits checkout | All items in stock, shipping address valid |
| Confirmed | Paid | Payment gateway callback | Payment authorized and captured |
| Confirmed | Cancelled | Customer cancels / payment timeout | Within 30 minutes of confirmation |
| Paid | Shipped | Warehouse marks dispatched | All items packed, tracking number assigned |
| Shipped | Delivered | Carrier delivery confirmation | Delivered to shipping address |
| Shipped | Returned | Customer initiates return | Within 30 days of shipment date |
| Delivered | Closed | Auto-close after 14 days | No dispute raised |
| Delivered | Returned | Customer initiates return | Within 30 days of delivery date |

## Business Rules

**Stock reservation:**
- Stock is reserved (soft lock) when order moves to Confirmed
- Reserved stock is released if order is Cancelled
- Stock is permanently deducted when order moves to Shipped

**Payment:**
- Payment must be captured within 30 minutes of Confirmed, otherwise auto-cancel
- Partial payments are not supported — full amount or rejection
- Refunds go back to the original payment method

**Shipping:**
- Orders over $50 qualify for free standard shipping
- Express shipping available for additional $9.99
- Orders cannot be modified once in Shipped state

**Returns and refunds:**
- Return window: 30 days from delivery date
- Refund is processed within 5 business days of receiving returned items
- Restocking fee of 15% applies for non-defective returns
- Defective items: full refund, no restocking fee, return shipping covered

**Cancellation:**
- Customer can cancel freely while in Confirmed state
- Once Paid, cancellation triggers a full refund (processed within 3 business days)
- Cannot cancel once Shipped — must use return process

## Glossary

- **Line item** — a single product entry within an order, consisting of SKU, quantity, and unit price
- **SKU** (Stock Keeping Unit) — unique identifier for a specific product variant (e.g., "Blue T-Shirt, Size M")
- **Fulfillment** — the process of picking, packing, and shipping an order from the warehouse
- **Backorder** — an order accepted for an out-of-stock item, to be fulfilled when stock arrives
- **Chargeback** — a payment reversal initiated by the customer's bank (not the merchant)
- **Soft lock** — temporary stock reservation that expires if not confirmed within a time window
