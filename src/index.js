const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
var fetch = require('undici').request;
var { JSDOM } = require('jsdom');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: false,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('close', (event, arg) => {
  app.quit();
});

ipcMain.on('minimize', (event, arg) => {
  BrowserWindow.getFocusedWindow().minimize();
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

ipcMain.on('parsePls', async (event, arg) => {
  switch (arg.type) {
    case 'ann':
      var grd = !arg.grade ? 0 : multipleIncludes(arg.grade, 'Freshman', 'Sophomore', 'Junior', 'Senior') ? 0 : arg.grade == ['Freshman'] ? 1 : arg.grade == ['Sophomore'] ? 2 : arg.grade == ['Junior'] ? 3 : arg.grade == ['Senior'] ? 4 : arg.grade == ['Sophomore', 'Junior'] ? 5 : arg.grade == ['Junior', 'Senior'] ? 6 : 7;
      var date;
      var qs = '';
      if (arg.date && grd) {
        qs = `?date=${date}&view=${grd}`;
      } else if (arg.date) {
        qs = `?date=${date}`;
      } else if (grd) {
        qs = `?view=${grd}`;
      }
      var resp = await (await fetch("https://ehgp.holyghostprep.org/announcements.php/" + qs, {
        "headers": {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-US,en;q=0.9,ca;q=0.8",
          "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "cookie": "dark=true; theme=false; color=%23000000; drag=true; PHPSESSID=d0912367ebe82f4921c89464e549a137",
          "Referer": "https://ehgp.holyghostprep.org/index_2.php",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      })).body.text();
      var dom = new JSDOM(resp);

      var status = {};

      var dates = [...dom.window.document.querySelectorAll('#navbarNavAltMarkup > ul > div > li:nth-child(2) > div > form > select > option')].map(x => x.value);
      status.dates = dates;
      var center = dom.window.document.querySelector('#canv-container > h3:nth-child(8)');
      if (center.textContent == 'No Announcements Today') {
        status.now = 'No announcements, enjoy your day!';
      }

      return event.sender.send('reply', {
        type: 'ann',
        status: status,
      });
  }
});