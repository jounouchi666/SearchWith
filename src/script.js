/* <ul id="items">
    <li id="0" class="item">
        <div class="site-toprow">
            <span class="sitename editable">Amazon</span>
            <div class="arrows">
                <span class="arrow-up material-symbols-outlined">keyboard_arrow_up</span>
                <span class="arrow-down material-symbols-outlined">keyboard_arrow_down</span>
            </div>
        </div>
        <div class="site-bottomrow">
            <input type="text" class="siteurl" name="siteurl">
            <span class="delete btn material-symbols-outlined">delete</span>
        </div>
    </li>
</ul> */

// const sites = {
//     0: ["Amazon", "https://www.amazon.co.jp/s?k="],
//     1: ["楽天", "https://search.rakuten.co.jp/search/mall/"]
// } 

// chrome.storage.sync.clear();
// chrome.storage.local.clear();

// sitesの初期化
let sites = {};

// chrome.storageから取得
const expansion_from_storage = () => {
    chrome.storage.local.get(["siteList"], value => {
        // 初期化
        document.getElementById("items").innerHTML = "";
        sites = {};
        // 展開
        if (value.siteList) {
            Object.assign(sites, value.siteList);
            for (let id in sites) {
                createItemEl(id, sites[id][0], sites[id][1]);
            }
        }
    });
};
expansion_from_storage();

// itemを生成する
const createItemEl = (itemId, siteName = "New Site", url = "") => {
    // tag = タグ
    // class = 追加するクラスの配列
    // attributes = 追加する属性のオブジェクト
    // innerText = テキスト
    const createAnyElement = (tag, classes, attributes, innerText) => {
        const el = document.createElement(tag);
        if (classes) {
            el.classList.add(...classes);
        }
        if (attributes) {
            for (let atrKey in attributes) {
                el.setAttribute(atrKey, attributes[atrKey]);
            }
        }
        if (innerText) {
            el.innerText = innerText;
        }
        return el
    }

    const itemEl = createAnyElement("li", ["item"], {"id": itemId});
    const siteTopRowEl = createAnyElement("div", ["site-toprow"]);
    const siteNameEl = createAnyElement("span", ["sitename", "editable"], undefined, siteName);
    const arrowsEl = createAnyElement("div", ["arrows"]);
    const arrowUpEl = createAnyElement("span", ["arrow-up", "material-symbols-outlined"], undefined, "keyboard_arrow_up");
    const arrowDownEl = createAnyElement("span", ["arrow-down", "material-symbols-outlined"], undefined, "keyboard_arrow_down");
    const siteBottomRowEl = createAnyElement("div", ["site-bottomrow"]);
    const siteUrlEl = createAnyElement("input", ["siteurl"], {"type": "text", "name": "siteurl"});
    siteUrlEl.value = url;
    const deleteEl = createAnyElement("span", ["delete", "btn", "material-symbols-outlined"], undefined, "delete");

    siteBottomRowEl.append(siteUrlEl);
    siteBottomRowEl.append(deleteEl);

    arrowsEl.append(arrowUpEl);
    arrowsEl.append(arrowDownEl);

    siteTopRowEl.append(siteNameEl);
    siteTopRowEl.append(arrowsEl);

    itemEl.append(siteTopRowEl);
    itemEl.append(siteBottomRowEl);

    const itemsEl = document.getElementById("items");
    itemsEl.append(itemEl);
}

// idを入れ替える
const exchangeId = (targetItem, exchangeTargetItem) => {
    [targetItem.id, exchangeTargetItem.id] = [exchangeTargetItem.id, targetItem.id];
    // sitesオブジェクトに反映
    sites[targetItem.id] = [
        targetItem.querySelector(".sitename").innerText,
        targetItem.querySelector(".siteurl").value
    ]
    sites[exchangeTargetItem.id] = [
    exchangeTargetItem.querySelector(".sitename").innerText,
    exchangeTargetItem.querySelector(".siteurl").value
    ]
}

// ADDボタン
document.getElementById("add").addEventListener("click", () => {
    const newId = (Object.keys(sites).length > 0) ? Math.max(...Object.keys(sites).map(Number)) + 1 : 0;
    sites[newId] = ["New Site", ""];
    // sitesをchrome.storageに保存
    chrome.storage.local.set({"siteList": sites});
    // 画面に展開
    createItemEl(newId);
});

// clear-allボタン
document.getElementById("clear-all").addEventListener("click", () => {
    let result = confirm("Are you sure you want to clear all?")
    if (result) {
        chrome.storage.local.remove("siteList", () => {
            expansion_from_storage()
        });
    }
});

// itemsのデリゲート
// changeイベント
const items = document.getElementById("items");
items.addEventListener("change", e => {
    if (e.target.classList.contains("siteurl")) {
        const inputItem = e.target.closest(".item");
        if (!inputItem) return;

        const itemId = Number(inputItem.id);
        const updateUrl = e.target.value;
        if (sites[itemId]) {
            sites[itemId][1] = updateUrl;
        }

        // sitesをchrome.storageに保存
        chrome.storage.local.set({"siteList": sites});
    }
})

// clickイベント
items.addEventListener("click", e => {
    const tgtClass0 = e.target.classList[0];
    switch (tgtClass0) {
        // サイト名
        case "sitename":
            if (e.target.classList.contains("editable")) {
                // span要素をinput要素に変更
                const span = e.target;
                const inputItem = span.closest(".item");
                const input = document.createElement("input");
                input.type = "text";
                input.classList.add("sitename");
                input.value = e.target.textContent;

                span.replaceWith(input);
                input.select();

                // フォーカスが外れたら保存してspanに戻す
                input.addEventListener("blur", () => {
                    if (input.value == "") {
                        return
                    }
                    
                    const itemId = Number(inputItem.id);
                    if (sites[itemId]) {
                        sites[itemId][0] = input.value;
                    }

                    // sitesをchrome.storageに保存
                    chrome.storage.local.set({"siteList": sites});

                    span.textContent = input.value;
                    input.replaceWith(span);
                })

                // Enterで確定
                input.addEventListener("keydown", e => {
                    if (e.key === "Enter") {
                        input.blur();
                    }
                })
            }
            break;

        // 削除ボタン
        case "delete":
            let result = confirm("Are you sure you want to delete?");
            if (result) {
                const deleteItem = e.target.closest(".item");

                const itemId = Number(deleteItem.id); 
                if (sites[itemId]) {
                    delete sites[itemId];
                    deleteItem.remove();
                    chrome.storage.local.set({"siteList": sites});
                }
            }
            break;

        // 上矢印
        case "arrow-up":
            const upItem = e.target.closest(".item");
            const beforeUpItem = upItem.previousElementSibling;

            const firstItem = document.getElementById("items").firstElementChild;
            if (upItem == firstItem) {
                break;
            }
            
            exchangeId(upItem, beforeUpItem);
            
            // 要素の並び替え
            upItem.after(beforeUpItem);
            // sitesをchrome.storageに保存
            chrome.storage.local.set({"siteList": sites});

            break;

        // 下矢印
        case "arrow-down":
            const downItem = e.target.closest(".item");
            const afterDownItem = downItem.nextElementSibling;
            
            const lastItem = document.getElementById("items").lastElementChild;
            if (downItem == lastItem) {
                break;
            }
            exchangeId(downItem, afterDownItem);
            
            // 要素の並び替え
            downItem.before(afterDownItem);
            // sitesをchrome.storageに保存
            chrome.storage.local.set({"siteList": sites});

            break;

        default:
            break;

    }
})


// カラーテーマ
const colorThemes = {
    light: {
        "--bg-color": "#f5f5f5",
        "--container-bg-color": "white",
        "--container-shadow-color": "#999",
        "--item-border-color": "#bbb",
        "--font-color": "black",
        "--input-border-color": "#ddd",
        "--input-outline-focus-color": "#aaa",
        "--input-font-color": "#333",
        "--btn-color": "#666",
        "--btn-active-color": "#999",
        "--btn-font-color": "white"
    },
    dark: {
        "--bg-color": "#f5f5f5",
        "--container-bg-color": "white",
        "--container-shadow-color": "#999",
        "--item-border-color": "#bbb",
        "--font-color": "black",
        "--input-border-color": "#ddd",
        "--input-outline-focus-color": "#aaa",
        "--input-font-color": "#333",
        "--btn-color": "#666",
        "--btn-active-color": "#999",
        "--btn-font-color": "white"
    }
}