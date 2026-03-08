# Actor Model Explained

This note explains the actor model in clear, language-agnostic terms, with
references to how it is typically implemented in systems like Akka.

## What the Actor Model Is

The actor model is a concurrency model where "actors" are the fundamental units
of computation. Each actor:

- has its own private state,
- processes one message at a time,
- can send messages to other actors,
- can create new actors.

Actors do not share memory. They communicate only by sending messages.

## Core Concepts

### Actor

An actor is an independent entity that:

- holds state privately,
- defines how to react to messages,
- decides what to send next.

### Message

A message is an immutable piece of data sent to an actor. Messages are queued
in the actor's mailbox and processed in order.

### Mailbox

The mailbox is the actor's queue of incoming messages. Each actor processes
messages one at a time, which avoids the need for locks inside the actor.

### Actor Reference

An actor reference is the address you use to send messages. It is the only way
to interact with an actor.

### Supervision

Actors can watch and supervise child actors. If a child fails, the supervisor
can restart it, stop it, or escalate the failure.

## How It Works (High Level)

1. An actor receives a message from its mailbox.
2. It updates its state based on the message.
3. It may send messages to other actors.
4. It returns to waiting for the next message.

This loop makes each actor effectively single-threaded from its own perspective,
while the system can run many actors concurrently.

## Why Use the Actor Model

- **Safety**: no shared mutable state reduces data races.
- **Scalability**: actors are lightweight and easy to distribute.
- **Resilience**: supervisors can isolate and recover failures.
- **Simplicity**: sequential reasoning per actor.

## Common Tradeoffs

- Debugging can be harder because messages are asynchronous.
- Message ordering is per-sender, not necessarily global.
- System design requires careful protocol planning.

## Summary

The actor model treats concurrency as message passing between isolated units of
state and behavior. It trades shared memory for explicit communication, making
systems easier to scale and more resilient to failure.

