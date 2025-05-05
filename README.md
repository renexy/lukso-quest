# Lukso Quest

**Lukso Quest** is a decentralized mini dApp built on the LUKSO blockchain that enables users to create and participate in quests. Users can submit their work for quests in exchange for rewards, with the creator of the quest selecting the winner. This app leverages **LUKSO Universal Profiles (UP)** for seamless user authentication and ownership, and **LSP8 (Identifiable Digital Assets)** for reward management.

---

## Table of Contents

- [Features](#features)
- [Technical Details](#technical-details)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Future Plans](#future-plans)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Create and Participate in Quests**: Users can create quests (jobs) that other users can participate in by submitting their work.
- **Work Submission with Proof of Work (PoW)**: Participants submit their work with a PoW link to validate their efforts.
- **Quest Winner Selection**: Quest creators select the winner based on their criteria and reward them.
- **Mint Rewards as NFTs**: Rewards are minted as **LSP8 NFTs**, which can be claimed by the winners.
- **Universal Profile Integration**: Users authenticate through their **LSP0 (Universal Profile)**, ensuring a seamless experience and secure ownership of quests and rewards.
- **Smart Contract (LSP8)**: Rewards are tokenized as NFTs using the LSP8 standard.

---

## Technical Details

- **Frontend**: React-based frontend for easy navigation and interaction. Integrated with **Universal Profile** for secure authentication.
  - WebSocket technology ensures real-time updates for quest submissions.
  
- **Backend**: Smart contracts written in Solidity.
  - Uses **LSP8 (Identifiable Digital Asset)** for minting rewards as NFTs.
  - Metadata includes:
    - PoW submission links.
    - Creator and participant details.
    - Quest-related data.
  
- **LUKSO Standards Used**:
  - **LSP0**: Universal Profile for authentication and secure ownership.
  - **LSP8**: Minting NFTs as rewards for quest winners.
  - **LSP4**: Digital Asset Metadata for NFT metadata standards.

---

## Getting Started

To get started with **Lukso Quest**, follow these steps:

### Prerequisites

- **Node.js**: Version 14.x or higher.
- **Metamask** or another browser wallet supporting LUKSO's Universal Profiles.
- **LUKSO Testnet/Network**: You can use the LUKSO test network for testing purposes.

### Install Dependencies

```bash
git clone https://github.com/yourusername/lukso-quest.git
cd lukso-quest
npm install
