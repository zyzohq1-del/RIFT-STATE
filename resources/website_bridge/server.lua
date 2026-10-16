local QBCore = exports['qb-core']:GetCoreObject()

local activeSessions = {}

local function identifier(src, kind)
    for _, value in ipairs(GetPlayerIdentifiers(src)) do
        if value:sub(1, #kind + 1) == kind .. ':' then
            return value:sub(#kind + 2)
        end
    end
    return nil
end

local function playerPayload(src)
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then
        return nil
    end

    local job = Player.PlayerData.job or {}
    local grade = job.grade
    local gradeLevel = 0

    if type(grade) == 'table' then
        gradeLevel = tonumber(grade.level or grade.grade or 0) or 0
    else
        gradeLevel = tonumber(grade or 0) or 0
    end

    return {
        name = GetPlayerName(src) or ('Player ' .. tostring(src)),
        citizenid = Player.PlayerData.citizenid,
        license = identifier(src, 'license'),
        discord = identifier(src, 'discord'),
        steam = identifier(src, 'steam'),
        fivem = identifier(src, 'fivem'),
        jobName = job.name,
        jobLabel = job.label,
        jobGrade = gradeLevel
    }
end

local function post(path, data, callback)
    local url = Config.ApiUrl:gsub('/$', '') .. path

    PerformHttpRequest(
        url,
        function(status, body, headers, errorData)
            if status < 200 or status >= 300 then
                print(
                    ('[website_bridge] API %s failed: HTTP %s %s')
                    :format(
                        path,
                        tostring(status),
                        tostring(body or errorData or '')
                    )
                )
                if callback then
                    callback(false, status, body)
                end
                return
            end

            if callback then
                callback(true, status, body)
            end
        end,
        'POST',
        json.encode(data or {}),
        {
            ['Content-Type'] = 'application/json',
            ['X-Bridge-Secret'] = Config.BridgeSecret
        }
    )
end

local function startPlayerSession(src)
    local payload = playerPayload(src)
    if not payload then
        return
    end

    post(
        '/bridge/session/start',
        payload,
        function(ok, status, body)
            if not ok then
                return
            end

            local decoded = json.decode(body or '{}')
            if not decoded or not decoded.success or not decoded.sessionToken then
                print('[website_bridge] API returned an invalid session response.')
                return
            end

            activeSessions[src] = {
                token = decoded.sessionToken,
                lastPayload = payload
            }
        end
    )
end

local function stopPlayerSession(src, reason)
    local session = activeSessions[src]
    if not session then
        return
    end

    post(
        '/bridge/session/stop',
        {
            sessionToken = session.token,
            reason = reason or 'playerDropped'
        }
    )

    activeSessions[src] = nil
end

local function syncPlayer(src)
    local payload = playerPayload(src)
    if not payload then
        return
    end

    post(
        '/bridge/player/sync',
        payload
    )

    if activeSessions[src] then
        activeSessions[src].lastPayload = payload
    end
end

local function sendHeartbeat()
    local players = GetPlayers()

    post(
        '/bridge/heartbeat',
        {
            onlinePlayers = #players,
            maxPlayers = Config.MaxPlayers
        }
    )

    for _, value in ipairs(players) do
        local src = tonumber(value)
        local session = activeSessions[src]

        if session then
            post(
                '/bridge/session/heartbeat',
                {
                    sessionToken = session.token,
                    player = playerPayload(src)
                }
            )
        else
            startPlayerSession(src)
        end
    end
end

AddEventHandler('QBCore:Server:PlayerLoaded', function(Player)
    local src = Player.PlayerData.source
    if Config.SyncOnPlayerLoaded then
        syncPlayer(src)
    end
    startPlayerSession(src)
end)

AddEventHandler('playerDropped', function(reason)
    stopPlayerSession(source, reason or 'playerDropped')
end)

CreateThread(function()
    Wait(5000)

    for _, value in ipairs(GetPlayers()) do
        local src = tonumber(value)
        if QBCore.Functions.GetPlayer(src) then
            syncPlayer(src)
            startPlayerSession(src)
        end
    end

    while true do
        Wait(Config.HeartbeatSeconds * 1000)
        sendHeartbeat()
    end
end)

RegisterNetEvent('QBCore:Server:OnJobUpdate', function(src, job)
    src = tonumber(src)
    if not src or not activeSessions[src] then
        return
    end

    local payload = playerPayload(src)
    if payload then
        activeSessions[src].lastPayload = payload
        post('/bridge/player/sync', payload)
    end
end)


-- Link a logged-in website account to the player's real QBCore character.
-- Player enters the short-lived code generated on the website: /linkwebsite RF-1234
RegisterCommand('linkwebsite', function(src, args)
    if src == 0 then return end
    local code = tostring(args[1] or ''):upper()
    if code == '' then
        TriggerClientEvent('chat:addMessage', src, { args = { '^3Rift State', 'استخدم: /linkwebsite RF-1234' } })
        return
    end

    local Player = QBCore.Functions.GetPlayer(src)
    if not Player or not Player.PlayerData then
        TriggerClientEvent('chat:addMessage', src, { args = { '^1Rift State', 'تعذر قراءة شخصية QBCore. أعد المحاولة بعد تحميل الشخصية.' } })
        return
    end

    local identifiers = {
        license = identifier(src, 'license'),
        steam = identifier(src, 'steam'),
        discord = identifier(src, 'discord'),
        citizenid = Player.PlayerData.citizenid,
        characterName = ((Player.PlayerData.charinfo or {}).firstname or '') .. ' ' .. ((Player.PlayerData.charinfo or {}).lastname or '')
    }

    post('/internal/fivem/link-account', {
        code = code,
        license = identifiers.license,
        steam = identifiers.steam,
        discord = identifiers.discord,
        citizenid = identifiers.citizenid,
        characterName = identifiers.characterName
    }, function(ok)
        local msg = ok and 'تم ربط حساب الموقع بشخصيتك بنجاح.' or 'تعذر الربط. تأكد من الرمز وصلاحيته ثم حاول مرة أخرى.'
        TriggerClientEvent('chat:addMessage', src, { args = { '^3Rift State', msg } })
    end)
end, false)

print('[website_bridge] Started.')
