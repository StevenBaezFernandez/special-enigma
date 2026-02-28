# accounting-contracts (Contracts)

## 🎯 Purpose
This library defines the **Shared Contracts**, **DTOs**, and **Interfaces** that are used across boundaries, particularly for communication between the **Accounting** domain and other domains or clients.

## 🏗 Content
- **DTOs:** Request/Response shapes.
- **Events:** Domain integration events (e.g., `OrderCreatedEvent`).
- **Interfaces:** Shared types.

## 🚫 Constraints
- **No business logic.**
- **No private domain entities.**
- **Stable API:** Changes here must be backward compatible or versioned.
