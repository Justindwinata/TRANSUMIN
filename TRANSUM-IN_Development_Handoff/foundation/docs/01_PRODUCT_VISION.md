# TRANSUM-IN — Product Vision

## 1. Why TRANSUM-IN exists

Public transport in Jabodetabek is not a single network that users experience as a single network.

A practical trip may involve:

`walking → KRL → walking → TransJakarta → walking → destination`

The underlying services can each be understandable on their own, yet the combined journey can be difficult for a user to reason about.

TRANSUM-IN exists to reduce that cognitive burden.

The product should make a public-transport journey understandable **before** the user starts moving.

## 2. Product philosophy

### “Jangan paksa pengguna memahami jaringan. Jelaskan perjalanannya.”

The application should not primarily behave like a route directory.

It should behave like a journey explainer.

The user should be able to answer, in order:

1. Dari mana saya berangkat?
2. Ke mana saya pergi?
3. Kendaraan apa yang harus saya naik?
4. Di halte/stasiun mana saya naik?
5. Di mana saya turun?
6. Apakah saya harus transit?
7. Di mana saya harus berpindah moda?
8. Berapa banyak saya harus berjalan?
9. Berapa lama perjalanannya?
10. Apa yang harus saya lakukan sekarang?

## 3. Product promise

For a valid origin/destination pair, TRANSUM-IN should attempt to provide multiple understandable alternatives, such as:

- fastest;
- least walking;
- fewest transfers;
- simplest;
- cheapest when fare data is available.

The ranking must not hide the actual journey steps.

## 4. Target users

### Primary user: Jakarta/Jabodetabek commuter with low-to-medium transit-network familiarity

Characteristics:

- uses public transport occasionally or daily;
- may know a few stations/halts but not the entire network;
- is comfortable with mobile apps;
- is often under time pressure;
- wants confidence more than raw transit data;
- may know the destination but not the correct station/stop or direction.

### Secondary user: daily commuter optimizing routine

Needs:

- saved home/work/campus;
- repeated journeys;
- fast route comparison;
- notifications about disruptions;
- active-trip guidance.

### Tertiary user: occasional/new public transport user

Needs:

- simple language;
- route explanation;
- strong transfer guidance;
- manual location selection if GPS is unavailable;
- protection from route-network complexity.

## 5. Non-goals for MVP

TRANSUM-IN is not initially:

- a ticket marketplace;
- a payment wallet;
- a social network;
- a transit operator control system;
- a full citywide MaaS platform;
- a guaranteed real-time vehicle tracker;
- a replacement for operator incident feeds.

## 6. Success criteria

A first-time user should be able to:

1. open the app;
2. enter origin and destination;
3. understand at least one viable journey;
4. understand every transfer;
5. start the trip;
6. follow the current step;
7. reach the destination with low ambiguity.

The product succeeds when a user can confidently answer:

> “Saya harus naik apa, turun di mana, dan transit di mana?”

## 7. Design principles

- clarity over density;
- action over metadata;
- explain transfers;
- always show walking segments;
- never depend on color alone;
- provide manual location fallback;
- distinguish estimated data from live data;
- never invent transit facts;
- degrade gracefully when data is unavailable.
