1. Setup Project & Boilerplate
Prompt:

Create a Next.js app with Tailwind CSS and Zustand. Include Solana Wallet Adapter and basic layout with a header and main content area. The header should have a "Connect Wallet" button.

2. Integrate Solana Wallet Adapter
Prompt:

Implement Solana Wallet Adapter using @solana/wallet-adapter-react and @solana/wallet-adapter-wallets. Add support for Phantom, Backpack, and Solflare. Show connected wallet address in the UI.

3. Set Up Drift SDK
Prompt:

Install Drift SDK and initialize DriftClient on wallet connect using devnet RPC from Helius. Use https://api.devnet.helius.xyz/?api-key=YOUR_API_KEY as endpoint. Store DriftClient in Zustand for global access.

4. Fetch Subaccounts for Connected Wallet
Prompt:

Add a function using DriftClient.getUserAccountsForAuthority() to fetch subaccounts (User accounts) for the connected wallet. Display them in a list with basic info (e.g., userIndex).

5. View Subaccount Details
Prompt:

For each subaccount, fetch and display balances, perp positions, and open orders using the User object from Drift SDK. Format them in tabs or cards under each subaccount.

6. View Any Wallet’s Subaccounts
Prompt:

Add an input field to enter any wallet address. When submitted, fetch and show that wallet’s subaccounts and their details using getUserAccountsForAuthority(authorityPublicKey).

7. Deposit/Withdraw Functionality
Prompt:

Implement forms to deposit and withdraw SOL/USDC using Drift SDK's deposit() and withdraw() methods. Add dropdown to select subaccount and token.

8. Perp Order Functionality
Prompt:

Add a form to place market and limit perp orders using Drift SDK’s placePerpOrder() method. Include fields for market, size, price, order type, and subaccount.

9. Stretch: Take Profit / Stop Loss
Prompt:

Extend the order form to allow setting optional Take Profit and Stop Loss prices. Use placePerpOrder() with postOnly and reduceOnly flags if needed.

10. Stretch: Scaled Orders
Prompt:

Implement a form for Scaled Orders: input total size, number of orders, min/max price range. Generate multiple orders across the range and place them using Drift SDK in a loop.

11. Polish the UI
Prompt:

Improve the UI with Tailwind: tabs, modals, cards, and tables. Add loading states, error handling, and mobile responsiveness. Use Zustand to manage loading, connected wallet, and subaccount state.

Bonus Tips
Use DriftClient.subscribe() to keep subaccount info updated in real time.

Use the Vaults UI Template as reference for styling/layout patterns.

Add keyboard shortcuts (like Cmd + K) for power user vibes.