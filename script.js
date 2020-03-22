//#region Variables

let grid = document.getElementById('grid');
let gridParent = grid.parentElement;
let rowsEl = document.getElementById('rows');
let coluEL = document.getElementById('columns');
let mineEL = document.getElementById('mines');
let rows = 0;
let cols = 0;
let mines = 0;
let mineCount = 0;

let themes = {
    default: {
        correct: '🟩',
        mine: '💥',
        seperator: '||',
    },
    virus: {
        correct: '⬜',
        mine: '🦠',
        seperator: '||',
    }
};

let theme = themes.default;
let correct = '🟩';
let mine = '💥';
let spoiler = '||'

//#endregion
generateGrid();
reloadThemes();

//#region helper functions

function animateButton(element, period, texts, func) {
    element.disabled = true;
    let original = element.value;
    let counter = 1;
    element.innerHTML = texts[0];
    texts.push(original);
    let array = texts.slice(1);
    setTimeout(function () {
        if (func != null) { func(); }
        element.disabled = false;
    }, period * array.length);
    array.forEach(name => {
        setTimeout(function () {
            element.innerHTML = name;
        }, period * counter++);
    });


}

function getCopy() {
    animateButton(document.getElementById("clipboardBtn"), 1500, ["👏Copied!👏"]);

    let strArray = [];
    strArray.push("***Det-Cord*** - *It's Minesweeper, for Discord!*\n\n")
    strArray.push(`Board Dimensions: ***${cols}x${rows}***, Bombs on board: ***${mineCount}***, Clear-Space Emoji: ${correct}`);
    strArray.push('\n\n');
    for (var x = 0; x < rows; x++) {
        for (var y = 0; y < cols; y++) {
            let cell = grid.rows[x].cells[y];
            strArray.push(spoiler);
            //check if tweetmoji or not
            let imgs = cell.getElementsByTagName('img');
            if(imgs.length > 0) {
                for(let i = 0; i < imgs.length; i++) {
                    strArray.push(imgs[i].alt);
                }
            } else {
                strArray.push(cell.innerHTML);
            }
            strArray.push(spoiler);
        }
        strArray.push('\n');
    }
    strArray.push('\n');
    strArray.push(`Generate your own at <${window.location.href}>!`);
    let result = strArray.join("");

    const el = document.createElement('textarea');
    el.value = result;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function cap(str) {
    return str.replace(/^\w/, function (chr) {
        return chr.toUpperCase();
    });
}

//#endregion

function setThemeToCustom() {
    let themeEL = document.getElementById('themes');
    themeEL.value = 'Custom';
}

function saveTheme() {
    animateButton(document.getElementById('saveBtn'), 750, ["Saving...", "Saved! 👌"]);
    let name = prompt('Please enter a name: ', 'Custom');
    if (name == null || name == '') {
        return;
    }
    let custom = {
        correct: document.getElementById('clearValue').value,
        mine: document.getElementById('mineValue').value,
        seperator: document.getElementById('seperatorValue').value,
    };

    themes[name] = custom;
    localStorage.setItem('themes', JSON.stringify(themes));
    reloadThemes();
    let themesEL = document.getElementById('themes');
    themesEL.value = name;
}

function reloadThemes() {
    let json = localStorage.getItem('themes');
    if (json != null && json != '') {
        themes = null;
        themes = JSON.parse(json);
    }

    let themesEL = document.getElementById('themes');
    themesEL.innerHTML = '';
    let names = Object.keys(themes);
    names.push('Custom');
    names.forEach(name => {
        let option = document.createElement('option');
        option.appendChild(document.createTextNode(cap(name)));
        option.value = name;
        themesEL.appendChild(option);
    })
}

function toggleReveal() {
    gridParent.classList.toggle('d-none');
}

function refreshVariables() {
    rows = Number.parseInt(rowsEl.value);
    cols = Number.parseInt(coluEL.value);
    mines = Number.parseInt(mineEL.value);
    correct = document.getElementById('clearValue').value;
    mine = document.getElementById('mineValue').value;
    spoiler = document.getElementById('seperatorValue').value;
}

function setTheme() {
    let themesEL = document.getElementById('themes');
    theme = themes[themesEL.value];
    if (theme == null) { return; }
    document.getElementById('clearValue').value = theme.correct;
    document.getElementById('mineValue').value = theme.mine;
    document.getElementById('seperatorValue').value = theme.seperator;
}

//#region Minesweeper funcs
function generateGrid() {
    animateButton(document.getElementById('generateBtn'), 500, ["Generating...", "Generated! 👌"], () => {
        refreshVariables();
        grid.innerHTML = "";

        for (var x = 0; x < rows; x++) {
            let row = grid.insertRow(x);
            for (var y = 0; y < cols; y++) {
                let cell = row.insertCell(y);
                var mine = document.createAttribute("data-mine");
                mine.value = false;
                cell.setAttributeNode(mine);
            }
        }
        addMines();
        calcAdjecent();
    });
}

function addMines() {
    mineCount = 0;
    refreshVariables();
    for (var i = 0; i < mines; i++) {
        var row = Math.floor(Math.random() * rows);
        var col = Math.floor(Math.random() * cols);
        var cell = grid.rows[row].cells[col];
        if (cell.getAttribute('data-mine') == 'false') {
            cell.setAttribute('data-mine', true);
            mineCount++;
        }
        cell.innerHTML = mine;
        cell.value = mine;
    }
}

function calcAdjecent() {
    for (var x = 0; x < rows; x++) {
        for (var y = 0; y < cols; y++) {
            let cell = grid.rows[x].cells[y];
            simulateClick(cell);
        }
    }
}

function simulateClick(cell) {
    //Check if the end-user clicked on a mine
    if (cell.getAttribute("data-mine") != "true") {
        cell.className = "clicked";
        //Count and display the number of adjacent mines
        var mineCount = 0;
        var cellRow = cell.parentNode.rowIndex;
        var cellCol = cell.cellIndex;
        //alert(cellRow + " " + cellCol);
        for (var i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, rows - 1); i++) {
            for (var j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, cols - 1); j++) {
                if (grid.rows[i].cells[j].getAttribute("data-mine") == "true") {
                    mineCount++;
                }
            }
        }
        let text = `${escape(mineCount)}\uFE0F\u20E3`
        if (mineCount == 0) {
            text = correct
        }
        cell.innerHTML = text;
        cell.value = text;
        if (mineCount == 0) {
            //Reveal all adjacent cells as they do not have a mine
            for (var i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, rows - 1); i++) {
                for (var j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, cols - 1); j++) {
                    //Recursive Call
                    if (grid.rows[i].cells[j].innerHTML == "") {
                        simulateClick(grid.rows[i].cells[j]);
                    }
                }
            }
        }
        parseEmojis();
    }
}
//#endregion

//#region twemoji
function parseEmojis() {
        twemoji.size = '72x72';
        twemoji.parse(grid);
}
//#endregion
//#region service-worker

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
    .then(function(registration) {
        console.log('Registration successful, scope is:', registration.scope);
    })
    .catch(function(err) {
        console.log('Service worker registration failed, error:', err);
    });
}

//#endregion