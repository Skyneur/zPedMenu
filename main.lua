local open_command = (CONFIG.open_command and #CONFIG.open_command > 0) and CONFIG.open_command or "open_zpedmenu"

local fun_handle_mouse_focused = function()
    while IsNuiFocused() do
        Wait(0)

        -- Vue caméra
        DisableControlAction(0, 1, true) -- Look Left/Right
        DisableControlAction(0, 2, true) -- Look Up/Down

        -- Clics & viseurs
        DisableControlAction(0, 24, true)  -- Attack
        DisableControlAction(0, 25, true)  -- Aim
        DisableControlAction(0, 68, true)  -- VehicleMouseControlOverride
        DisableControlAction(0, 69, true)  -- Vehicle Attack
        DisableControlAction(0, 70, true)  -- Vehicle Aim
        DisableControlAction(0, 106, true) -- Vehicle Attack 2 (clic droit)

        -- Shift (important)
        DisableControlAction(0, 21, true) -- Left Shift (Sprint)
        DisableControlAction(0, 36, true) -- Right Shift (Modifier)

        -- Molette & weapon wheel
        DisableControlAction(0, 14, true)  -- Scroll down
        DisableControlAction(0, 15, true)  -- Scroll up
        DisableControlAction(0, 37, true)  -- Weapon wheel TAB
        DisableControlAction(0, 91, true)  -- Vehicle Headlight (clic molette)
        DisableControlAction(0, 329, true) -- Toggle cursor (clic molette)
        DisableControlAction(0, 239, true) -- Mouse X axis
        DisableControlAction(0, 240, true) -- Mouse Y axis

        -- Menu pause
        SetPauseMenuActive(false)
    end
end

local function loadModel(model)
    local modelHash = type(model) == "string" and GetHashKey(model) or model

    if not IsModelInCdimage(modelHash) or not IsModelValid(modelHash) then
        return false
    end

    RequestModel(modelHash)
    local timeout = GetGameTimer() + 5000

    while not HasModelLoaded(modelHash) and GetGameTimer() < timeout do
        Wait(10)
    end

    return HasModelLoaded(modelHash)
end

RegisterCommand(open_command, function()
    if CONFIG.can_open() then
        SetNuiFocus(true, true)
        SetNuiFocusKeepInput(true)
        SendNUIMessage({
            action = "show_menu",
            data = {}
        })
        fun_handle_mouse_focused()
    end
end, false)

if CONFIG.open_key.enabled then
    RegisterKeyMapping(open_command, CONFIG.open_key.description, "keyboard", CONFIG.open_key.key)
end

RegisterNuiCallback("close_menu", function(data, cb)
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
    Citizen.CreateThread(function()
        local startTime = GetGameTimer()
        while GetGameTimer() - startTime < 500 do
            Citizen.Wait(0)
            SetPauseMenuActive(false)
        end
    end)
    cb("ok:)")
end)

RegisterNuiCallback("handle_input_focus", function(data, cb)
    if data.state then
        SetNuiFocus(true, true)
        SetNuiFocusKeepInput(false)
    else
        SetNuiFocus(true, true)
        SetNuiFocusKeepInput(true)
    end
    cb("ok:)")
end)

RegisterNuiCallback("reset_ped", function(data, cb)
    DoScreenFadeOut(500)
    while not IsScreenFadedOut() do Wait(10) end
    CONFIG.reset_ped()
    Wait(500)
    DoScreenFadeIn(500)
    cb("ok:)")
end)

RegisterNUICallback("select_ped", function(data, cb)
    local pedModel = data.model
    local modelHash = GetHashKey(pedModel)
    local playerPed = PlayerPedId()
    local currentModel = GetEntityModel(playerPed)
    if modelHash == currentModel then
        return
    end
    if loadModel(pedModel) then
        DoScreenFadeOut(500)
        while not IsScreenFadedOut() do Wait(10) end
        SetPlayerModel(PlayerId(), modelHash)
        SetModelAsNoLongerNeeded(modelHash)
        playerPed = PlayerPedId()
        SetPedDefaultComponentVariation(playerPed)
        Wait(500)
        DoScreenFadeIn(500)
    end
    cb("ok:)")
end)

-- Gestion des thèmes ------------------------------------------------------
local currentThemeName = (CONFIG and CONFIG.theme) or "default"

local function loadTheme(themeName)
    if not themeName or #themeName == 0 then return nil end
    local path = string.format("themes/%s.json", themeName)
    local raw = LoadResourceFile(GetCurrentResourceName(), path)
    if not raw or #raw == 0 then return nil end
    local ok, def = pcall(json.decode, raw)
    if not ok or type(def) ~= "table" then return nil end
    return def
end

RegisterNuiCallback("get_theme", function(data, cb)
    -- Permettre de demander un thème spécifique via data.name (sinon courant)
    local requested = (data and data.name) and data.name or currentThemeName
    local def = loadTheme(requested)
    if not def then
        -- Fallback sur default puis sur premier fichier existant
        if requested ~= "default" then
            def = loadTheme("default")
            currentThemeName = def and "default" or currentThemeName
        end
    else
        currentThemeName = requested
    end
    if not def then
        cb({ current = currentThemeName, themes = {} })
        return
    end
    cb({ current = currentThemeName, themes = { [currentThemeName] = def } })
end)

RegisterNuiCallback("set_theme", function(data, cb)
    local name = data and data.name
    if type(name) ~= "string" or #name == 0 then
        cb({ ok = false, error = "invalid_name" })
        return
    end
    local def = loadTheme(name)
    if not def then
        cb({ ok = false, error = "not_found" })
        return
    end
    currentThemeName = name
    cb({ ok = true, current = currentThemeName, themes = { [currentThemeName] = def } })
end)

RegisterNuiCallback("list_themes", function(data, cb)
    local resource = GetCurrentResourceName()
    local themes = {}
    local handle = StartFindKvp("zpm_theme_") -- placeholder (FiveM ne liste pas les fichiers via API standard côté client)
    EndFindKvp(handle)
    -- Comme limitation: on retourne juste ceux connus statiquement
    local known = { "default", "blue", "emerald", "violet", "amber", "crimson", "cyber" }
    for _, name in ipairs(known) do
        local def = loadTheme(name)
        if def then
            themes[name] = def
        end
    end
    cb({ current = currentThemeName, themes = themes })
end)
