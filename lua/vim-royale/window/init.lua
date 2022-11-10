local container_win_id = -1

--- Should i do something better than this?
local main_win_id = -1
local main_bufnr = -1

local status_win_id = -1
local status_bufnr = -1

local hidden_win_id = -1
local hidden_bufnr = -1

local MAIN_WIDTH = 80
local MAIN_HEIGHT = 24

local STATUS_WIDTH = 80
local STATUS_HEIGHT = 1

-- plus 2 for border
local TOTAL_REQUIRED_WIDTH = 80 + 2

-- plus 4 for 2 borders
local TOTAL_REQUIRED_HEIGHT = MAIN_HEIGHT + STATUS_HEIGHT + 4

local function get_nvim_size()
    local uis = vim.api.nvim_list_uis()
    local width = 0
    local height = 0
    for i = 1, #uis do
        width = width + uis[i].width
        height = height + uis[i].height
    end

    return width, height + vim.o.ch + 1
end

local function royale_open()
    return vim.api.nvim_win_is_valid(main_win_id)
end

local function close(win_id, bufnr)
    if vim.api.nvim_win_is_valid(win_id) then
        vim.api.nvim_win_close(win_id, true)
    end

    if vim.api.nvim_buf_is_valid(bufnr) then
        vim.api.nvim_buf_delete(bufnr, {force = true})
    end
end

local function close_all()
    close(main_win_id, main_bufnr)
    close(status_win_id, status_bufnr)
    main_win_id = -1
    status_win_id = -1
    main_bufnr = -1
    status_bufnr = -1
    container_win_id = -1
end

local function create_bufnr()
    -- controlling movement???
    local bufnr = vim.api.nvim_create_buf(false, true);

    vim.bo[bufnr].modifiable = false
    vim.bo[bufnr].readonly = true
    vim.bo[bufnr].bufhidden = true;

    return bufnr
end

local function get_window_config()
    local width, height = get_nvim_size()
    if TOTAL_REQUIRED_HEIGHT > height then
        error("unable to create the vim royal config, your window is too small, please zoom out")
    end

    if TOTAL_REQUIRED_WIDTH > width then
        error("unable to create the vim royal config, your window is too small, please zoom out")
    end

    local offset_row = math.ceil((height - MAIN_HEIGHT) / 2)
    local offset_col = math.floor((width - MAIN_WIDTH) / 2)

    local main = {
        relative="win",
        win = container_win_id,
        row = offset_row,
        col = offset_col,
        width = MAIN_WIDTH,
        height = MAIN_HEIGHT,
        border = "single",
    }
    local status = {
        relative="win",
        win = container_win_id,
        row = offset_row - 4,
        col = offset_col,
        width = STATUS_WIDTH,
        height = STATUS_HEIGHT,
        border = "single",
    }

    local hidden = {
        relative="win",
        win = container_win_id,
        row = height * 10,
        col = width * 10,
        width = 1,
        height = 1,
    }

    return main, status, hidden
end

local function create_window(bufnr, enter, config)
    local win_id = vim.api.nvim_open_win(bufnr, enter, config)
    vim.wo[win_id].rnu = false
    vim.wo[win_id].nu = false
    vim.wo[win_id].fillchars = 'eob: '

    return win_id
end

local function royale_windows()
    local main, status, hidden = get_window_config()

    if royale_open() then
        vim.api.nvim_win_set_config(main_win_id, main)
        vim.api.nvim_win_set_config(status_win_id, status)
        vim.api.nvim_win_set_config(hidden_win_id, hidden)
    else
        container_win_id = vim.api.nvim_get_current_win()

        main_bufnr = create_bufnr()
        main_win_id = create_window(main_bufnr, false, main)

        status_bufnr = create_bufnr()
        status_win_id = create_window(status_bufnr, false, status)

        hidden_bufnr = create_bufnr()
        hidden_win_id = create_window(hidden_bufnr, true, hidden)
    end
end

local function display_update(strings)
end

local function status_update(life, stamina, player_count)
end

local function setup_autocmds()
    local augroup = vim.api.nvim_create_augroup
    local autocmd = vim.api.nvim_create_autocmd
    local ThePrimeagenVimRoyale = augroup('ThePrimeagenVimRoyale', {})

    autocmd({"WinEnter"}, {
        group = ThePrimeagenVimRoyale,
        pattern = "*",
        callback = function()
            if royale_open() then
                local win_id = vim.api.nvim_get_current_win()
                if win_id ~= hidden_win_id then
                    vim.api.nvim_set_current_win(hidden_win_id)
                end
            end
        end
    })

    autocmd({"WinClosed"}, {
        group = ThePrimeagenVimRoyale,
        pattern = "*",
        callback = function()
            if hidden_win_id ~= -1 then
                close_all()
            end
        end
    })

    autocmd({"VimResized"}, {
        group = ThePrimeagenVimRoyale,
        pattern = "*",
        callback = function()
            vim.schedule(function()
                if royale_open() then
                    royale_windows()
                end
            end)
        end
    })

end

royale_windows()
setup_autocmds()

return {
    setup_autocmds = setup_autocmds,
    royale_windows = royale_windows,
    royale_open = royale_open
}
