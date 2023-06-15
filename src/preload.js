var electron = require("electron");
var shell = require('electron').shell;
var ipc = electron.ipcRenderer;
var remote = electron.remote;

window.addEventListener("DOMContentLoaded", function () {
    [...document.querySelectorAll('a[href^="http"]')].forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            shell.openExternal(this.href);
            $(el).trigger('blur');
            $(el).trigger('focusout');
        });
    });

    ipc.send("parsePls", {
        type: "ann",
        grade: [...document.querySelectorAll(".grades-bubble.enabled")].map(
            (e) => e.innerText
        ),
    });
    var dx = new Date().toISOString().split("T")[0];
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
        var dates = arg.status.dates.slice(1);
        dates = dates.map(x => new Date(x.replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1")).toISOString().split("T")[0]);
        var start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        start.setMonth(7);
        start.setDate(19);
        var end = new Date();
        end.setMonth(5);
        end.setDate(3);

        var between = [];
        var current = new Date(start);
        while (current <= end) {
            if (!dates.some(x => new Date(x).getTime() === current.getTime())) {
                between.push((new Date(current)).toISOString().split("T")[0]);
            }
            current.setDate(current.getDate() + 1);
        }

        $('#datepicker').datepicker({
            dateFormat: 'yy-mm-dd',
            beforeShowDay: function (date) {
                var string = jQuery.datepicker.formatDate("yy-mm-dd", date);
                if (dates.includes(string)) {
                    return [true, "highlight", "Highlight"];
                } else {
                    return [false, "", ""];
                }
            },
            onSelect: function (dateText, inst) {
                dx = $('#datepicker').datepicker("getDate").toISOString().split("T")[0];
            }
        });

        $('#datepicker').datepicker("setDate", new Date());

        $('#datepicker').datepicker("hide");
    });

    $('#datepicker').on('show', function (e) {
        $('#ui-datepicker-div').toggleClass('show');
    });

    document.getElementById("close").addEventListener("click", function (e) {
        ipc.send("close");
    });

    document.getElementById("min").addEventListener("click", function (e) {
        ipc.send("minimize");
    });

    document.getElementById("max").addEventListener("click", function (e) {
        ipc.send("maximize");
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
            var ann = document.getElementById("ann-wrapper");
            if (
                [...document.querySelectorAll(".grades-bubble.enabled")]
                    .length == 0
            ) {
                document.querySelector(".sorter").classList.remove("visible");
                for (var x of document.querySelectorAll(".grades-bubble"))
                    x.classList.add("enabled");
                ipc.send("parsePls", {
                    type: "ann",
                    grade: ["Freshman", "Sophomore", "Junior", "Senior"],
                });
            } else {
                var grades = [
                    ...document.querySelectorAll(".grades-bubble.enabled"),
                ].map((e) => e.innerText);
                var valid = true;
                for (var x of grades) {
                    if (
                        x != "Freshman" &&
                        x != "Sophomore" &&
                        x != "Junior" &&
                        x != "Senior"
                    ) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    if (
                        grades == ["Freshman", "Sophomore"] ||
                        grades == ["Sophomore", "Junior"] ||
                        grades == ["Junior", "Senior"]
                    ) {
                        valid = true;
                    } else {
                        valid = false;
                    }
                }
                if (!valid) {
                    ann.status = "Invalid grade";
                }
                
                document.querySelector(".sorter").classList.remove("visible");
                ipc.send("parsePls", {
                    type: "ann",
                    grade: [
                        ...document.querySelectorAll(".grades-bubble.enabled"),
                    ].map((e) => e.innerText),
                    date: dx
                });
                ipc.once("reply", function (event, arg) {
                    if (arg.type == "ann") {
                        if (ann.status == "Invalid grade") {
                            var box = document.getElementById("ann-box");
                            box.children[0].innerHTML = `
                            <h1 class="error">Woops!</h1>
                            <h2 class="error">You have selected an invalid grade.</h2>
                        `;
                        }
                        if (
                            arg.status.now ==
                            "No announcements, enjoy your day!"
                        ) {
                            var box = document.getElementById("ann-box");
                            box.children[0].innerHTML = `
                    <img style="width: 50%;" src="assets/peace.png">
                    <h1 style="font-size: 2.5em;">No announcements, enjoy your day!</h1>
                    `;
                        } else {
                            var box = document.getElementById("ann-box");
                            box.children[0].innerHTML = `
                                ${arg.status.anns.map((e) => `
                                    <div class="ann">
                                        <div class="header">
                                            <div class="from">
                                                <h1>${e.from}</h1>
                                            </div>
                                            <div class="to">
                                                <h1>${e.to}</h1>
                                            </div>
                                            <div class="date">
                                                <h1>${dx}</h1>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h1>${e.content}</h1>
                                        </div>
                                    </div>
                                `).join("")}
                            `;
                            [...document.querySelectorAll('#ann-box a')].forEach(el => {
                                el.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    shell.openExternal(el.href);
                                    $(el).trigger('blur');
                                    $(el).trigger('focusout');
                                });
                            });
                        }
                    }
                });
            }
        });
});
