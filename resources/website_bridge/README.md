# website_bridge - FiveM to Website Bridge Resource

This resource links your FiveM QBCore server directly with the Hunters Life Community (HLCRP) website API without requiring direct external access to your MySQL database.

## Architecture
```
FiveM Server (QBCore)
     ↓
website_bridge
     ↓ (HTTP / REST with x-bridge-token)
Website API (/api/bridge/*)
     ↓
Website Database & Analytics
     ↓
Website (Live Players, Leaderboard, Hours, Owner Panel)
```

## Features
- **Accurate Player Hours Tracker**: Captures `playerJoining` and `playerDropped` events, calculating precise session duration.
- **Identifiers Storage**: Captures `license`, `discord`, `steam`, and `fivem` identifiers.
- **QBCore Integration**: Automatically pulls `citizenid`, `job`, and `gang` from QBCore.
- **Live Server Status**: Sends regular heartbeat with current online player count (`GetPlayers()`).

## Installation
1. Put the `website_bridge` folder into your FiveM server's `resources/[hlc]/` directory.
2. Open `config.lua` and set your `Config.ApiUrl` and `Config.ApiKey`.
3. Add `ensure website_bridge` to your `server.cfg` after `qb-core`.
4. Restart your FiveM server or run `refresh` and `start website_bridge`.


## Rift State account linking
1. Sign in to the website with Discord and Steam.
2. Generate a one-time link code in the account page.
3. Join the FiveM server with the intended QBCore character and run `/linkwebsite RF-1234`.
4. The resource sends the server-authenticated `citizenid` to the website API. Codes expire after 10 minutes.

Keep `Config.BridgeSecret` identical to `FIVEM_API_SECRET` in the website environment. Do not expose this secret in client-side files or public repositories. Start this resource after `qb-core`.
