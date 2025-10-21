# Pactum: A Decentralized Freelancer Escrow Service

Pactum is a decentralized escrow dApp on Ethereum that secures funds between clients and freelancers using smart contracts, complete with a built-in dispute resolution system.

---

## ✨ Core Features

* **Factory-Based Deployment**: Creates a unique `Escrow` contract for each agreement.
* **Secure State Machine**: Manages funds through a strict lifecycle (`AwaitingDeposit` -> `InProgress` -> `Complete`/`Cancelled`).
* **Role-Based Access**: Restricts actions to the Client, Freelancer, and Arbiter.
* **Web Dashboard**: A dApp to create and track all personal escrow agreements.

---

## 🛠️ Tech Stack

* **Blockchain**: Solidity, Foundry
* **Frontend**: Next.js, Wagmi, RainbowKit, TypeScript

---

## 🚀 Quick Start

1.  **Clone & Install**:
    ```bash
    git clone <your-repo-url>
    cd <repo-name>
    forge install && npm install
    ```
2.  **Run Local Blockchain** (Terminal 1):
    ```bash
    anvil
    ```
3.  **Deploy Contracts** (Terminal 2):
    ```bash
    forge script script/DeployEscrow.s.sol --rpc-url [http://127.0.0.1:8545](http://127.0.0.1:8545) --broadcast
    ```
4.  **Configure Frontend**: Update the deployed factory contract address and ABI in your frontend code.

5.  **Run Frontend** (Terminal 3):
    ```bash
    npm run dev
    ```

---

## 🧪 Testing

Run the full smart contract test suite with Foundry:
```bash
forge test