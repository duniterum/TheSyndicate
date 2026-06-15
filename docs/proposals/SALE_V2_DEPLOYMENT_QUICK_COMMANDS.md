# Sale V2 — Deployment Quick Commands (copy/paste)

> Short companion to `SALE_V2_MAINNET_EXECUTION_PACKAGE.md`. Same constants, no prose.
> Nothing here has been executed. Founder signs deploy / fund / buy. Re-confirm
> before each broadcast. Do **not** pass `--evm-version` (paris default must match verify).

## 0. Exports

```bash
export PATH="/nix/store/y859lxadky9li4hr27dx3cvvrc5kc5i2-foundry-1.1.0/bin:$PATH"
cd contracts
export RPC=https://api.avax.network/ext/bc/C/rpc

export OWNER=0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F
export USDC=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
export SYN=0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170
export VAULT=0x205DdC8921A4C60106930eE35e1F395c8D13f464
export LIQ=0xa9b072db8DcDbb470235204B69D37275d74a2e25
export OPS=0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80
export FUNDER=0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8   # recovered wallet (holds ~349.99M SYN)
# DEPLOYED 2026-06-15 (tx 0x5f8929…e743f7):
export SALE=0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48
export DEPLOY_BLOCK=88095827
# export BUYER=0x<fresh non-V1 wallet>
```

## 1. Deploy

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $RPC --broadcast --ledger --sender $OWNER \
  --verify --verifier custom \
  --verifier-url 'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan' \
  --etherscan-api-key "verifyContract"
# -> SyndicateSaleV2 deployed at: 0x...   (also broadcast/Deploy.s.sol/43114/run-latest.json)
```

## 2. Verify (read-only)

```bash
cd tools && SALE_V2=$SALE RPC_URL=$RPC node verify-deploy.mjs && cd ..   # expect 28/28
cast call $SALE 'owner()(address)'               --rpc-url $RPC   # $OWNER
cast call $SALE 'memberCount()(uint256)'         --rpc-url $RPC   # 2
cast call $SALE 'activeEra()(uint16)'           --rpc-url $RPC   # 1
cast call $SALE 'nextSeatNumber()(uint256)'      --rpc-url $RPC   # 3
cast call $SALE 'currentReserveFloor()(uint256)' --rpc-url $RPC   # 4099000000000000000000000
cast call $SALE 'commissionRouter()(address)'    --rpc-url $RPC   # 0x0000...0000
cast call $SALE 'paused()(bool)'                 --rpc-url $RPC   # false
```

## 3. Fund 5,000,000 SYN

```bash
cast send $SYN 'transfer(address,uint256)' $SALE 5000000000000000000000000 \
  --rpc-url $RPC --ledger --from $FUNDER
cast call $SYN  'balanceOf(address)(uint256)' $SALE --rpc-url $RPC   # 5000000000000000000000000
cast call $SALE 'sellableSynForNextSeat()(uint256)' --rpc-url $RPC   # 901500000000000000000000 (>0)
```

## 4. Approve $5 USDC

```bash
cast send $USDC 'approve(address,uint256)' $SALE 5000000 --rpc-url $RPC --ledger --from $BUYER
```

## 5. Buy ($5)

```bash
cast call $SALE 'quote(uint256)(uint256,uint16,uint64,uint256,uint256,uint256)' 5000000 --rpc-url $RPC
# expect synOut=500000000000000000000 era=1 synPerUsdc=100 seatIfFirst=3

cast send $SALE 'buy(uint256,address,uint256,bytes32[])' \
  5000000 0x0000000000000000000000000000000000000000 500000000000000000000 '[]' \
  --rpc-url $RPC --ledger --from $BUYER
```

## 6. Post-buy checks

```bash
cast call $SALE 'memberCount()(uint256)'                   --rpc-url $RPC   # 3
cast call $SALE 'memberNumberOf(address)(uint256)' $BUYER  --rpc-url $RPC   # 3
cast call $SALE 'knownMember(address)(bool)' $BUYER        --rpc-url $RPC   # true
cast call $SALE 'activeEra()(uint16)'                     --rpc-url $RPC   # 1
cast call $SYN  'balanceOf(address)(uint256)' $BUYER       --rpc-url $RPC   # 500000000000000000000
cast call $SYN  'balanceOf(address)(uint256)' $SALE        --rpc-url $RPC   # 4999500000000000000000000
cast call $USDC 'balanceOf(address)(uint256)' $VAULT       --rpc-url $RPC   # +3500000 delta
cast call $USDC 'balanceOf(address)(uint256)' $LIQ         --rpc-url $RPC   # +1000000 delta
cast call $USDC 'balanceOf(address)(uint256)' $OPS         --rpc-url $RPC   # +500000  delta
```
