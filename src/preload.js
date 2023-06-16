var electron = require("electron");
var shell = require("electron").shell;
var ipc = electron.ipcRenderer;
var remote = electron.remote;

window.addEventListener("DOMContentLoaded", async function () {
    var quotes = {};
    fetch("https://type.fit/api/quotes", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((data) => {
            quotes = data;
            var quote = data[Math.floor(Math.random() * data.length)];
            if (!quote.author)
                document.getElementById("author").textContent = "Unknown";
            else document.getElementById("author").textContent = quote.author;

            document.getElementById("saying").textContent = quote.text;
            document.getElementById("quote").classList.remove("invisible");

            setTimeout(function () {
                document.getElementById("author").classList.remove("invisible");
            }, 500);
        });
    setInterval(function () {
        document.getElementById("author").classList.add("invisible");
        setTimeout(function () {
            document.getElementById("quote").classList.add("invisible");
        }, 500);
        setTimeout(function () {
            var quote = quotes[Math.floor(Math.random() * quotes.length)];
            if (!quote.author)
                document.getElementById("author").textContent = "Unknown";
            else document.getElementById("author").textContent = quote.author;

            document.getElementById("saying").textContent = quote.text;
            document.getElementById("quote").classList.remove("invisible");

            setTimeout(function () {
                document.getElementById("author").classList.remove("invisible");
            }, 1000);
        }, 1000);
    }, 10000);
    [...document.querySelectorAll('a[href^="http"]')].forEach(function (el) {
        el.addEventListener("click", function (e) {
            e.preventDefault();
            shell.openExternal(this.href);
            $(el).trigger("blur");
            $(el).trigger("focusout");
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
            } else {
                var box = document.getElementById("ann-box");
                box.children[0].innerHTML = `
                    ${arg.status.anns
                        .map(
                            (e) => `
                        <div class="ann">
                            <div class="header">
                                <div class="from">
                                    <h1>${
                                        e.from
                                            .split("From:")[1]
                                            .trim()
                                            .split(" ")[0] == "Fr."
                                            ? '<i class="ann-icon-relig fal fa-church"></i> ' +
                                              e.from.split("From:")[1].trim()
                                            : e.from
                                                  .split("From:")[1]
                                                  .trim()
                                                  .split(" ")[0] == "Dr." ||
                                              e.from
                                                  .split("From:")[1]
                                                  .trim()
                                                  .split(" ")[0] == "Mr." ||
                                              e.from
                                                  .split("From:")[1]
                                                  .trim()
                                                  .split(" ")[0] == "Mrs." ||
                                              e.from
                                                  .split("From:")[1]
                                                  .trim()
                                                  .split(" ")[0] == "Ms."
                                            ? '<i class="ann-icon-edu fal fa-school"></i> ' +
                                              e.from.split("From:")[1].trim()
                                            : e.from.split("From:")[1].trim()
                                    }</h1>
                                </div>
                                <div class="to">
                                    <h1>${e.to.split("To:")[1].trim()}</h1>
                                </div>
                                <div class="date">
                                    <h1>${dx}</h1>
                                </div>
                            </div>
                            <div class="content">
                                <h1>${e.content}</h1>
                                ${
                                    e.content.toLowerCase().includes("must") ||
                                    e.content
                                        .toLowerCase()
                                        .includes("should") ||
                                    e.content
                                        .toLowerCase()
                                        .includes("have to") ||
                                    e.content
                                        .toLowerCase()
                                        .includes("need to") ||
                                    e.content.toLowerCase().includes("please")
                                        ? `<i class="ann-icon-urgent fal fa-exclamation-triangle"></i>`
                                        : e.content
                                              .toLowerCase()
                                              .includes("join us") ||
                                          e.content
                                              .toLowerCase()
                                              .includes("come to") ||
                                          e.content
                                              .toLowerCase()
                                              .includes("attend") ||
                                          e.content
                                              .toLowerCase()
                                              .includes("meeting") ||
                                          e.content
                                              .toLowerCase()
                                              .includes("event")
                                        ? `<i class="ann-icon-event fal fa-calendar-alt"></i>`
                                        : e.content
                                              .toLowerCase()
                                              .includes("club") ||
                                          e.content
                                              .toLowerCase()
                                              .includes("quiz") ||
                                          e.content
                                              .toLowerCase()
                                              .includes("competition")
                                        ? `<i class="ann-icon-club fal fa-users"></i>`
                                        : ""
                                }
                            </div>
                        </div>
                    `
                        )
                        .join("")}
                `;
                [...document.querySelectorAll("#ann-box a")].forEach((el) => {
                    el.addEventListener("click", function (e) {
                        e.preventDefault();
                        shell.openExternal(el.href);
                        $(el).trigger("blur");
                        $(el).trigger("focusout");
                    });
                });
                [...document.querySelectorAll("#ann-box .picture")].forEach(
                    (el) => {
                        el.style.cursor = "pointer";
                        el.addEventListener("click", function (e) {
                            var modalContainer = document.createElement("div");
                            modalContainer.classList.add("sorter");
                            modalContainer.innerHTML = `
                            <div class="modal">
                                <div class="header">
                                    <div class="back" id="modal-back">
                                        <i class="fal fa-arrow-left"></i>
                                    </div>
                                    <h1>Image (from ${dx})</h1>
                                </div>

                                <img id="mimg" src="${el.src}" alt="Image from ${dx}" style="cursor: pointer;">
                            </div>
                        `;
                            document.body.appendChild(modalContainer);
                            setTimeout(function () {
                                modalContainer.classList.add("visible");
                            }, 100);
                            document
                                .getElementById("modal-back")
                                .addEventListener("click", function (e) {
                                    modalContainer.classList.remove("visible");
                                    setTimeout(function () {
                                        modalContainer.remove();
                                    }, 500);
                                });
                            document
                                .getElementById("mimg")
                                .addEventListener("click", function (e) {
                                    shell.openExternal(el.src);
                                });
                        });
                    }
                );
            }
        }
        var dates = arg.status.dates.slice(1);
        dates = dates.map(
            (x) =>
                new Date(x.replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1"))
                    .toISOString()
                    .split("T")[0]
        );
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
            if (
                !dates.some((x) => new Date(x).getTime() === current.getTime())
            ) {
                between.push(new Date(current).toISOString().split("T")[0]);
            }
            current.setDate(current.getDate() + 1);
        }

        $("#datepicker").datepicker({
            dateFormat: "yy-mm-dd",
            beforeShowDay: function (date) {
                var string = jQuery.datepicker.formatDate("yy-mm-dd", date);
                if (dates.includes(string)) {
                    return [true, "highlight", "Highlight"];
                } else {
                    return [false, "", ""];
                }
            },
            onSelect: function (dateText, inst) {
                dx = $("#datepicker")
                    .datepicker("getDate")
                    .toISOString()
                    .split("T")[0];
            },
        });

        $("#datepicker").datepicker("setDate", new Date());

        $("#datepicker").datepicker("hide");
    });

    $("#datepicker").on("show", function (e) {
        $("#ui-datepicker-div").toggleClass("show");
    });

    document.getElementById("close").addEventListener("click", function (e) {
        document.querySelector(".watermark").style = "opacity: 0;";
        for (var x of [...document.querySelectorAll(".box")]) {
            x.style =
                "transition: all 0.5s cubic-bezier(0.950, 0.050, 0.795, 0.035); transform: translate(-50%, 20%); opacity: 0;";
        }
        document.body.style.filter = "blur(10px) brightness(0.5)";
        setTimeout(function () {
            ipc.send("close");
        }, 700);
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

        cbox.classList.add("hidden");
        ann.classList.remove("hidden");
    });

    document.getElementById("ann-back").addEventListener("click", function (e) {
        var watermark = document.querySelector(".watermark");
        watermark.style = "";
        var cbox = document.getElementById("anncment").parentElement;
        var ann = document.getElementById("ann-wrapper");

        cbox.classList.remove("hidden");
        ann.classList.add("hidden");
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
                    term:
                        document.getElementById("grades-text").value.trim() ==
                        ""
                            ? undefined
                            : document
                                  .getElementById("grades-text")
                                  .value.trim(),
                    date: dx,
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
                                ${arg.status.anns
                                    .map(
                                        (e) => `
                                    <div class="ann">
                                        <div class="header">
                                            <div class="from">
                                                <h1>${
                                                    e.from
                                                        .split("From:")[1]
                                                        .trim()
                                                        .split(" ")[0] == "Fr."
                                                        ? '<i class="ann-icon-relig fal fa-church"></i> ' +
                                                          e.from
                                                              .split("From:")[1]
                                                              .trim()
                                                        : e.from
                                                              .split("From:")[1]
                                                              .trim()
                                                              .split(" ")[0] ==
                                                              "Dr." ||
                                                          e.from
                                                              .split("From:")[1]
                                                              .trim()
                                                              .split(" ")[0] ==
                                                              "Mr." ||
                                                          e.from
                                                              .split("From:")[1]
                                                              .trim()
                                                              .split(" ")[0] ==
                                                              "Mrs." ||
                                                          e.from
                                                              .split("From:")[1]
                                                              .trim()
                                                              .split(" ")[0] ==
                                                              "Ms."
                                                        ? '<i class="ann-icon-edu fal fa-school"></i> ' +
                                                          e.from
                                                              .split("From:")[1]
                                                              .trim()
                                                        : e.from
                                                              .split("From:")[1]
                                                              .trim()
                                                }</h1>
                                            </div>
                                            <div class="to">
                                                <h1>${e.to
                                                    .split("To:")[1]
                                                    .trim()}</h1>
                                            </div>
                                            <div class="date">
                                                <h1>${dx}</h1>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h1>${e.content}</h1>
                                            ${
                                                e.content
                                                    .toLowerCase()
                                                    .includes("club") ||
                                                e.content
                                                    .toLowerCase()
                                                    .includes("quiz") ||
                                                e.content
                                                    .toLowerCase()
                                                    .includes("competition")
                                                    ? `<i class="ann-icon-club fal fa-users"></i>`
                                                    : e.content
                                                          .toLowerCase()
                                                          .includes(
                                                              "join us"
                                                          ) ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes(
                                                              "come to"
                                                          ) ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes("attend") ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes(
                                                              "meeting"
                                                          ) ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes("event") ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes(
                                                              "this break"
                                                          ) ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes("at break")
                                                    ? `<i class="ann-icon-event fal fa-calendar-alt"></i>`
                                                    : e.content
                                                          .toLowerCase()
                                                          .includes("must") ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes("should") ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes(
                                                              "have to"
                                                          ) ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes(
                                                              "need to"
                                                          ) ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes(
                                                              "needs to"
                                                          ) ||
                                                      e.content
                                                          .toLowerCase()
                                                          .includes("miss")
                                                    ? `<i class="ann-icon-urgent fal fa-exclamation-triangle"></i>`
                                                    : ""
                                            }
                                        </div>
                                    </div>
                                `
                                    )
                                    .join("")}
                            `;
                            [
                                ...document.querySelectorAll("#ann-box a"),
                            ].forEach((el) => {
                                el.addEventListener("click", function (e) {
                                    e.preventDefault();
                                    shell.openExternal(el.href);
                                    $(el).trigger("blur");
                                    $(el).trigger("focusout");
                                });
                            });
                            [
                                ...document.querySelectorAll(
                                    "#ann-box .picture"
                                ),
                            ].forEach((el) => {
                                el.style.cursor = "pointer";
                                el.addEventListener("click", function (e) {
                                    var modalContainer =
                                        document.createElement("div");
                                    modalContainer.classList.add("sorter");
                                    modalContainer.innerHTML = `
                                        <div class="modal">
                                            <div class="header">
                                                <div class="back" id="modal-back">
                                                    <i class="fal fa-arrow-left"></i>
                                                </div>
                                                <h1>Image (from ${dx})</h1>
                                            </div>

                                            <img id="mimg" src="${el.src}" alt="Image from ${dx}" style="cursor: pointer;">
                                        </div>
                                    `;
                                    document.body.appendChild(modalContainer);
                                    setTimeout(function () {
                                        modalContainer.classList.add("visible");
                                    }, 100);
                                    document
                                        .getElementById("modal-back")
                                        .addEventListener(
                                            "click",
                                            function (e) {
                                                modalContainer.classList.remove(
                                                    "visible"
                                                );
                                                setTimeout(function () {
                                                    modalContainer.remove();
                                                }, 500);
                                            }
                                        );
                                    document
                                        .getElementById("mimg")
                                        .addEventListener(
                                            "click",
                                            function (e) {
                                                shell.openExternal(el.src);
                                            }
                                        );
                                });
                            });
                        }

                        var annContainer = document.getElementById("ann-box");
                        var rect1 = annContainer.getBoundingClientRect();
                        var watermark = document.querySelector(".watermark");
                        var rect2 = watermark.getBoundingClientRect();
                        var overlap = !(
                            rect1.right < rect2.left ||
                            rect1.left > rect2.right ||
                            rect1.bottom < rect2.top ||
                            rect1.top > rect2.bottom
                        );
                        if (overlap) {
                            watermark.style = "transform: translateX(100%);";
                        } else {
                            watermark.style = "transform: translateX(0%);";
                        }
                    }
                });
            }
        });

    var ii = 0;
    var silly = false;
    document.getElementById("logo").addEventListener("click", function (e) {
        ii++;
        if (ii == 10) {
            if (!silly) {
                var text = document.getElementById("toast-text");
                text.innerHTML = "Enabled silly mode!";
                var toast = document.getElementById("toast");
                toast.classList.add("visible");
                setTimeout(function () {
                    toast.classList.remove("visible");
                }, 10000);
                silly = true;
                for (var x of [...document.getElementsByTagName("*")].filter(
                    (x) => x.id !== "logo"
                )) {
                    x.style.backgroundColor =
                        "hsl(" + Math.random() * 360 + ", 100%, 10%)";
                    x.style.color =
                        "hsl(" + Math.random() * 360 + ", 100%, 50%)";
                    x.style.border =
                        "1px solid hsl(" + Math.random() * 360 + ", 100%, 50%)";
                    x.style.transiton = "all 0s linear";
                    x.style.borderRadius = "0px";
                    x.style.boxShadow = "none";
                    x.style.textShadow = "none";
                    x.style.fontFamily = "Comic Sans MS";
                    x.style.fontWeight = "bold";
                    x.style.fontSize = "50px";
                    x.style.transform =
                        "rotate(" + (Math.random() * 360 - 180) + "deg)";
                    x.style.transformOrigin = "center";
                    x.style.filter =
                        "hue-rotate(" + Math.random() * 360 + "deg)";
                    x.style.zIndex = Math.random().toString().substring(2, 7);
                }
                var normal = document.createElement("div");
                normal.id = "normal";
                normal.innerHTML = "Normal mode";
                normal.style =
                    "position: fixed; top: 50%; left: 50%; padding: 1vw; background-color: #000; color: #fff; font-family: sans-serif; font-size: 50px; display: flex; flex-direction: column; text-align: center; justify-content: center; align-items: center; z-index: 2147483647; cursor: pointer;";
                document.body.appendChild(normal);
                normal.addEventListener("click", function (e) {
                    var text = document.getElementById("toast-text");
                    text.innerHTML = "Disabled silly mode!";
                    var toast = document.getElementById("toast");
                    toast.classList.add("visible");
                    setTimeout(function () {
                        toast.classList.remove("visible");
                    }, 10000);
                    silly = false;
                    for (var x of [
                        ...document.getElementsByTagName("*"),
                    ].filter((x) => x.id !== "logo")) {
                        x.style.backgroundColor = "";
                        x.style.color = "";
                        x.style.border = "";
                        x.style.transiton = "";
                        x.style.borderRadius = "";
                        x.style.boxShadow = "";
                        x.style.textShadow = "";
                        x.style.fontFamily = "";
                        x.style.fontWeight = "";
                        x.style.fontSize = "";
                        x.style.transform = "";
                        x.style.transformOrigin = "";
                        x.style.filter = "";
                        x.style.zIndex = "";
                    }
                    normal.remove();
                    silly = false;
                    ii = 0;
                });
            }
        }
    });
});
