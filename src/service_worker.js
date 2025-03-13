// コンテキストメニューの更新
const updateContextMenu = () => {
    chrome.storage.local.get(["siteList"], value => {
        const sites = value.siteList;

        if (!sites) return;

        chrome.contextMenus.removeAll(() => {
            for (let id in sites) {
                if (sites[id][1] && typeof sites[id][1] === "string" && sites[id][1].trim() !== "") {
                    chrome.contextMenus.create({
                        "id": id,
                        "title": `${sites[id][0]}で検索`,
                        "contexts": ["selection"]
                    })
                }
            }
        })
    })
};

// テキストで検索するためのリスナー
const handleContextMenuClick = (info, tab) => {
    const id = info.menuItemId;
    chrome.storage.local.get("siteList", value => {
        const sites = value.siteList;
        const url = `${sites[id][1]}${encodeURIComponent(info.selectionText)}`;
        chrome.tabs.create({url: url});
    })
}

// 初期化処理
const init = () => {
    updateContextMenu();
    // リスナーの設定
    chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
};

// 拡張機能の起動時に初期化
init();

// storageの変更時
chrome.storage.onChanged.addListener((changes, namespace) => {
    updateContextMenu();
});