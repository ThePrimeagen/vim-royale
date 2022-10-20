
function create_window()
    -- controlling movement???
    local id = vim.api.nvim_create_buf(false, true);
    vim.bo[id].modifiable = false
    vim.bo[id].readonly = true
    vim.bo[id].bufhidden = true;

    vim.api.nvim_open_win(id, true, {relative="win", row = 3, col = 3, width = 10, height = 10})
end

create_window()

