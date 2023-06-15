const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
var fetch = require("undici").request;
var { JSDOM } = require("jsdom");
var Store = require("./lib/store.js");

var store = new Store({
    configName: "hgp-cache",
    defaults: {
        announcements: [],
    },
});

if (!store.get("announcements")) {
    store.set("announcements", []);
}

if (require("electron-squirrel-startup")) {
    app.quit();
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
        frame: false,
        icon: path.join(__dirname, "assets", "icon.png"),
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));
};

var cache = [];

app.on("ready", () => {
    createWindow();
    var cache = store.get("announcements");
    cache = cache ? cache : [];
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on("close", (event, arg) => {
    app.quit();
});

ipcMain.on("minimize", (event, arg) => {
    BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on("maximize", (event, arg) => {
    var win = BrowserWindow.getFocusedWindow();
    if (win.isMaximized()) {
        win.unmaximize();
    } else {
        win.maximize();
    }
});

function multipleIncludes(arr1, ...arr2) {
    var inc = 0;
    for (var i = 0; i < arr1.length; i++) {
        if (arr2.includes(arr1[i])) {
            inc++;
        }
    }
    return inc == arr1.length;
}

function onlyIncludes(arr1, ...arr2) {
    var inc = 0;
    for (var i = 0; i < arr2.length; i++) {
        if (arr1.includes(arr2[i])) {
            inc++;
        }
    }
    return inc == arr1.length;
}

ipcMain.on("parsePls", async (event, arg) => {
    switch (arg.type) {
        case "ann":
            var grd;
            if (onlyIncludes(arg.grade, "Freshman")) {
                grd = 1;
            } else if (onlyIncludes(arg.grade, "Sophomore")) {
                grd = 2;
            } else if (onlyIncludes(arg.grade, "Junior")) {
                grd = 3;
            } else if (onlyIncludes(arg.grade, "Senior")) {
                grd = 4;
            } else if (onlyIncludes(arg.grade, "Freshman", "Sophomore")) {
                grd = 5;
            } else if (onlyIncludes(arg.grade, "Sophomore", "Junior")) {
                grd = 6;
            } else if (onlyIncludes(arg.grade, "Junior", "Senior")) {
                grd = 7;
            } else if (
                onlyIncludes(
                    arg.grade,
                    "Freshman",
                    "Sophomore",
                    "Junior",
                    "Senior"
                )
            ) {
                grd = 0;
            } else {
                grd = "Invalid";
            }
            var date;
            if (arg.date) {
                date = new Date(arg.date);
            } else {
                date = new Date();
            }
            date = date.toISOString().split("T")[0];
            var qs = "";
            if (
                !(
                    onlyIncludes(arg.grade, "Freshman") ||
                    onlyIncludes(arg.grade, "Sophomore") ||
                    onlyIncludes(arg.grade, "Junior") ||
                    onlyIncludes(arg.grade, "Senior") ||
                    onlyIncludes(arg.grade, "Freshman", "Sophomore") ||
                    onlyIncludes(arg.grade, "Sophomore", "Junior") ||
                    onlyIncludes(arg.grade, "Junior", "Senior") ||
                    onlyIncludes(
                        arg.grade,
                        "Freshman",
                        "Sophomore",
                        "Junior",
                        "Senior"
                    )
                ) ||
                grd == "Invalid"
            ) {
                return event.sender.send("reply", {
                    type: "ann",
                    status: "Invalid grade",
                });
            }
            if (date && grd) {
                qs = `?date=${date}&view=${grd}`;
            } else {
                if (!date) {
                    qs = `?view=${grd}`;
                } else if (!grd) {
                    qs = `?date=${date}`;
                }
            }
            if (cache.length > 0) {
                if (cache.find((x) => x.date == date && x.grade == grd)) {
                    return event.sender.send("reply", {
                        type: "ann",
                        now: "Cached",
                        status: cache.find(
                            (x) => x.date == date && x.grade == grd
                        ).data,
                    });
                }
            }
            var resp;
            if (!arg.term) {
                resp = await (
                    await fetch(
                        "https://ehgp.holyghostprep.org/announcements.php/" +
                            qs,
                        {
                            headers: {
                                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "accept-language": "en-US,en;q=0.9,ca;q=0.8",
                                "sec-ch-ua":
                                    '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": '"Windows"',
                                "sec-fetch-dest": "document",
                                "sec-fetch-mode": "navigate",
                                "sec-fetch-site": "same-origin",
                                "sec-fetch-user": "?1",
                                "upgrade-insecure-requests": "1",
                                cookie: "dark=true; theme=false; color=%23000000; drag=true;",
                                Referer:
                                    "https://ehgp.holyghostprep.org/index_2.php",
                                "Referrer-Policy":
                                    "strict-origin-when-cross-origin",
                            },
                            body: null,
                            method: "GET",
                        }
                    )
                ).body.text();
            } else {
                resp = await (
                    await fetch(
                        "https://ehgp.holyghostprep.org/textSearcher.php",
                        {
                            headers: {
                                "accept-language": "en-US,en;q=0.9,ca;q=0.8",
                                "content-type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "accept-language": "en-US,en;q=0.9,ca;q=0.8",
                                "sec-ch-ua":
                                    '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": '"Windows"',
                                "sec-fetch-dest": "document",
                                "sec-fetch-mode": "navigate",
                                "sec-fetch-site": "same-origin",
                                "sec-fetch-user": "?1",
                                "upgrade-insecure-requests": "1",
                                cookie: "dark=true; theme=false; color=%23000000; drag=true;",
                                Referer:
                                    "https://ehgp.holyghostprep.org/index_2.php",
                                "Referrer-Policy":
                                    "strict-origin-when-cross-origin",
                            },
                            body: `searchTerm=${arg.term}`,
                            method: "POST"
                        }
                    )
                ).body.text();
            }
            console.log(resp)
            var dom = new JSDOM(resp);

            var status = {};

            var dates = [
                ...dom.window.document.querySelectorAll(
                    "#navbarNavAltMarkup > ul > div > li:nth-child(2) > div > form > select > option"
                ),
            ].map((x) => x.value);
            status.dates = dates;
            var center = dom.window.document.querySelector(
                "#canv-container > h3:nth-child(8)"
            );
            if (!status.anns) status.anns = [];
            if (!center) {
                var announcements = [
                    ...dom.window.document.querySelectorAll(
                        "#canv-container > div.card-container > .card"
                    ),
                ];
                if (announcements.length == 0)
                    announcements = [
                        ...dom.window.document.querySelectorAll(
                            "div.card-container > .card"
                        ),
                    ];

                for (var i = 0; i < announcements.length; i++) {
                    try {
                        var from = announcements[i].querySelector(
                            ":scope h5.card-header"
                        ).textContent;
                        var to = announcements[i].querySelector(
                            ":scope div.card-body > h5.card-title"
                        ).textContent;
                        var content = announcements[i].querySelector(
                            ":scope div.card-body > p.card-text"
                        ).innerHTML;
                        status.anns.push({
                            from: from,
                            to: to,
                            content: content,
                        });
                        cache.push({
                            date: date,
                            grade: grd,
                            data: status,
                        });
                        status.now = "Announcement now";
                    } catch (e) {
                        status.now = "No announcements, enjoy your day!";
                    }
                }
            } else {
                if (center.textContent == "No Announcements Today") {
                    status.now = "No announcements, enjoy your day!";
                }
            }

            return event.sender.send("reply", {
                type: "ann",
                status: status,
            });
    }
});
