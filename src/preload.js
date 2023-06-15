var electron = require("electron");
var ipc = electron.ipcRenderer;
var remote = electron.remote;

window.addEventListener("DOMContentLoaded", function () {
    ipc.send("parsePls", {
        type: "ann",
        grade: [...document.querySelectorAll(".grades-bubble.enabled")].map(
            (e) => e.innerText
        ),
    });
    ipc.once("reply", function (event, arg) {
        if (arg.type == "ann") {
            if (arg.status.now == "No announcements, enjoy your day!") {
                var box = document.getElementById("ann-box");
                box.children[0].innerHTML = `
                <img style="width: 50%;" src="assets/peace.png">
                <h1 style="font-size: 2.5em;">No announcements, enjoy your day!</h1>
                `;
            }
        }
    });

    document.getElementById("close").addEventListener("click", function (e) {
        ipc.send("close");
    });

    document.getElementById("min").addEventListener("click", function (e) {
        ipc.send("minimize");
    });

    document.getElementById("anncment").addEventListener("click", function (e) {
        var cbox = document.getElementById("anncment").parentElement;
        var ann = document.getElementById("ann-wrapper");

        cbox.style =
            "transform: translate(-50%, -53%) scale(0.5); opacity: 0; z-index: -999;";
        ann.style =
            "transform: translate(-50%, -53%) scale(1); opacity: 1; z-index: 1;";
    });

    document.getElementById("ann-back").addEventListener("click", function (e) {
        var cbox = document.getElementById("anncment").parentElement;
        var ann = document.getElementById("ann-wrapper");

        cbox.style =
            "transform: translate(-50%, -53%) scale(1); opacity: 1; z-index: 1;";
        ann.style =
            "transform: translate(-50%, -53%) scale(0.5); opacity: 0; z-index: -999;";
    });

    document
        .getElementById("ann-filter-launcher")
        .addEventListener("click", function (e) {
            var sorter = document.querySelector(".sorter");
            if (sorter.classList.contains("visible"))
                sorter.classList.remove("visible");
            else sorter.classList.add("visible");
        });

    document
        .getElementById("sorter-back")
        .addEventListener("click", function (e) {
            var sorter = document.querySelector(".sorter");
            sorter.classList.remove("visible");
        });

    [...document.querySelectorAll(".grades-bubble")].forEach(function (e) {
        e.addEventListener("click", function (e) {
            if (e.target.classList.contains("enabled"))
                e.target.classList.remove("enabled");
            else e.target.classList.add("enabled");
        });
    });

    document
        .getElementById("sorter-apply")
        .addEventListener("click", function (e) {
            document.querySelector(".sorter").classList.remove("visible");
            ipc.send("parsePls", {
                type: "ann",
                grade: [
                    ...document.querySelectorAll(".grades-bubble.enabled"),
                ].map((e) => e.innerText),
            });
            ipc.once("reply", function (event, arg) {
                if (arg.type == "ann") {
                    if (arg.status.now == "No announcements, enjoy your day!") {
                        var box = document.getElementById("ann-box");
                        box.children[0].innerHTML = `
                    <img style="width: 50%;" src="assets/peace.png">
                    <h1 style="font-size: 2.5em;">No announcements, enjoy your day!</h1>
                    `;
                    }
                }
            });
        });
});
