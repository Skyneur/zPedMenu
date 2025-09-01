local config <const> = {
    -- Command name that players can use to open the ped menu
    open_command = "open_ped_menu",

    -- Settings for opening the menu using a keybind
    open_key = {
        enabled = true,                   -- Enable/disable keybind
        key = "F9",                       -- Default key to open the ped menu
        description = "Open the ped menu" -- Description of the key action
    },

    -- UI theme to be used (can be extended with custom themes in themes folder)
    theme = "default",

    -- Function that determines whether the ped menu can be opened
    can_open = function()
        -- Always returns true by default (menu can always be opened)
        return true
    end,

    -- Function to reset the player's ped to their default skin
    reset_ped = function()
        -- Retrieve ESX shared object
        local ESX = exports["es_extended"]:getSharedObject()

        -- Request player skin from the server
        ESX.TriggerServerCallback('esx_skin:getPlayerSkin', function(skin, jobSkin)
            local isMale = skin.sex == 0 -- Determine if the skin is male

            -- Load the default model (male or female) and then apply saved skin
            TriggerEvent('skinchanger:loadDefaultModel', isMale, function()
                TriggerEvent('skinchanger:loadSkin', skin)
                TriggerEvent('esx:restoreLoadout') -- Restore weapons/loadout
            end)
        end)

        return true
    end
}

_ENV.CONFIG = config
