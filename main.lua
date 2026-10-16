local QBCore = nil
if Config.UseQBCore then
    local success, core = pcall(function()
        return exports['qb-core']:GetCoreObject()
    end)
    if success and core then
        QBCore = core
        print('^2[website_bridge] QBCore successfully detected and loaded.^0')
    end
end

-- Table to hold active sessions by source ID
local activeSessions = {}

-- Helper to extract identifiers (license, discord, steam, fivem)
local function GetIdentifier(player, identifierType)
    for _, identifier in ipairs(GetPlayerIdentifiers(player)) do
        if identifier:sub(1, #identifierType + 1) == identifierType .. ":" then
            return identifier
        end
    end
    return nil
end

-- Helper to send HTTP requests to the website API
local function SendToWebsite(endpoint, data, cb)
    PerformHttpRequest(Config.ApiUrl .. endpoint, function(statusCode, responseText, headers)
        if Config.Debug then
            print(('[website_bridge] [%s] Response (%s): %s'):format(endpoint, tostring(statusCode), responseText or 'nil'))
        end
        if cb then cb(statusCode, responseText) end
    end, 'POST', json.encode(data), {
        ['Content-Type'] = 'application/json',
        ['x-bridge-token'] = Config.ApiKey
    })
end

-- -------------------------------------------------------------
-- Event: playerJoining
-- -------------------------------------------------------------
AddEventHandler('playerJoining', function()
    local src = source

    local license = GetIdentifier(src, 'license')
    local discord = GetIdentifier(src, 'discord')
    local steam = GetIdentifier(src, 'steam')
    local fivem = GetIdentifier(src, 'fivem')
    local name = GetPlayerName(src)

    local playerId = license or steam or discord or ('src:' .. tostring(src))

    activeSessions[src] = {
        startTime = os.time(),
        playerId = playerId,
        name = name,
        license = license,
        discord = discord,
        steam = steam
    }

    local payload = {
        player_id = playerId,
        name = name,
        license = license,
        discord = discord,
        steam = steam,
        fivem = fivem,
        joined_at = os.time()
    }

    SendToWebsite('/join', payload)
end)

-- -------------------------------------------------------------
-- Event: playerDropped
-- -------------------------------------------------------------
AddEventHandler('playerDropped', function(reason)
    local src = source
    local session = activeSessions[src]

    if session then
        local duration = os.time() - session.startTime

        -- Check QBCore data if available for enriched player stats
        local citizenid = nil
        local jobName = nil
        local gangName = nil
        if QBCore then
            local Player = QBCore.Functions.GetPlayer(src)
            if Player and Player.PlayerData then
                citizenid = Player.PlayerData.citizenid
                if Player.PlayerData.job then
                    jobName = Player.PlayerData.job.label or Player.PlayerData.job.name
                end
                if Player.PlayerData.gang then
                    gangName = Player.PlayerData.gang.label or Player.PlayerData.gang.name
                end
            end
        end

        local payload = {
            player_id = session.playerId,
            name = session.name,
            discord = session.discord,
            steam = session.steam,
            citizenid = citizenid,
            job = jobName,
            gang = gangName,
            duration_seconds = duration,
            session_end = os.time(),
            reason = reason or 'Disconnected'
        }

        SendToWebsite('/drop', payload)
        activeSessions[src] = nil
    end
end)

-- -------------------------------------------------------------
-- Heartbeat Thread: Sync current online player count & server status
-- -------------------------------------------------------------
CreateThread(function()
    while true do
        Wait(Config.HeartbeatInterval or 25000)

        local players = GetPlayers()
        local count = #players

        SendToWebsite('/heartbeat', {
            online_count = count,
            max_players = Config.MaxPlayers or 48,
            server_uptime = GetGameTimer()
        })
    end
end)

print('^2[website_bridge] Loaded successfully. Bridge API URL: ' .. Config.ApiUrl .. '^0')
