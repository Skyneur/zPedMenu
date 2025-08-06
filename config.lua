local config <const> = {
    open_command = "open_ped_menu",
    open_key = {
        enabled = true,
        key = "F9",
        description = "Ouvrir le menu ped"
    },
    can_open = function()
        return true
    end,
    reset_ped = function()
        local ESX = exports["es_extended"]:getSharedObject()
        ESX.TriggerServerCallback('esx_skin:getPlayerSkin', function(skin, jobSkin)
            local isMale = skin.sex == 0
            TriggerEvent('skinchanger:loadDefaultModel', isMale, function()
                TriggerEvent('skinchanger:loadSkin', skin)
                TriggerEvent('esx:restoreLoadout')
            end)
        end)
        return true
    end
}

_ENV.CONFIG = config
