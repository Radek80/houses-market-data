const fetch = require( 'node-fetch');
const jsdom = require('jsdom');
const fs = require('fs');
const eventEmitter = require('events');
const path = require('path');

function split(str, index) {
    return [str.slice(0, index), str.slice(index)];
}

const fn = function collectData(houses) {
    const housesJson = {};

    return new Promise(resolve => setTimeout(() => {
        const houseHtml = new jsdom.JSDOM(houses.innerHTML);
        let priceNotFormatted = undefined;
        if (houseHtml.window.document.getElementsByClassName("css-10b0gli")[0] !== undefined) {
            priceNotFormatted = houseHtml.window.document.getElementsByClassName("css-10b0gli")[0].innerHTML;
        }
        let housePrice = priceNotFormatted;
        if (priceNotFormatted && priceNotFormatted.search('zł') > 0) {
            [housePrice, additionalHtml] = split(priceNotFormatted, priceNotFormatted.search('zł') + 2);
        }
        if (housePrice !== undefined) {
            Object.assign(housesJson, {
                'houseName': houseHtml.window.document.getElementsByClassName("css-16v5mdi")[0].innerHTML,
                'price': housePrice,
                'surface': houseHtml.window.document.getElementsByClassName("css-643j0o")[0].textContent,
                'houseLink': houseHtml.window.document.getElementsByClassName("css-rc5s2u")[0].href,
            });
        }
        resolve(housesJson);
    }, 100));
};

exports.fetchHousesData = (housesUrl) => {
    const today = new Date().toISOString().slice(0, 10)
    const dir = './storage';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    const filePath = dir + '/' + today + '.json';
    fetch(`${housesUrl}`)
        .then(resp => resp.text())
        .then(body => {
            const dom = new jsdom.JSDOM(body);
            const houses = dom.window.document.getElementsByClassName("css-1sw7q4x");
            return Array.prototype.slice.call(houses);
        })
        .then(houses => {
            const actions = houses.map(fn); // run the function over all items
            const results = Promise.all(actions);
            results.then(data => {
                const filtered =  data.filter(function(e) {
                    return e.houseName || e.price || e.surface || e.houseLink;
                });
                if (fs.existsSync(filePath)) {
                    const fileData = fs.readFileSync(path.join(filePath));
                    const freshContent = JSON.parse(fileData.toString()).concat(JSON.parse(JSON.stringify(filtered)));
                    fs.writeFile(filePath, JSON.stringify(freshContent),function (err) {
                        if (err) throw err;
                        console.log('File updated!');
                    });
                } else {
                    fs.writeFile(filePath, JSON.stringify(filtered),function (err) {
                        if (err) throw err;
                        console.log('New file created!');
                    });
                }
            });
        });
}

exports.showDifferences = () => {
    const jsonFiles = [];
    class MyEventEmitter extends eventEmitter {
        historicPrices = [];
        files = [];
    }
    const eventEmitterModel = new MyEventEmitter();

    eventEmitterModel.once('readFiles', function (jsonFiles) {
        console.log('read files event');
        this.files = fs.readdirSync('./storage').filter(file => path.extname(file) === '.json');
        // jsonFiles = fs.readdirSync('./storage').filter(file => path.extname(file) === '.json');
        console.log('after push');
    });

    eventEmitterModel.on('collectData', function (file) {
        const fileData = fs.readFileSync(path.join('./storage', file)).toString();
        const json = JSON.parse(fileData);
        let currentFileDate = file.replace(".json", "");

        json.forEach(element => {
            let priceRow = [];
            let houseName = element.houseName;
            let housePrice = element.price;
            if (this.historicPrices[houseName]) {
                Object.keys(this.historicPrices[houseName]).forEach(date => {
                    if (housePrice !== this.historicPrices[houseName][date]
                        && !this.historicPrices[houseName].hasOwnProperty(currentFileDate)) {
                        // priceRow[currentFileDate] = housePrice;
                        this.historicPrices[houseName][currentFileDate] = housePrice;
                    }
                });
            } else {
                priceRow[currentFileDate] = housePrice;
                this.historicPrices[houseName] = priceRow;
            }
        })
    });

    eventEmitterModel.once('compareData', function () {
        console.log('compare event');
    });
    eventEmitterModel.once('showDifferences', function () {
        console.log('show differences event');
    });

    // Emit all events
    eventEmitterModel.emit('readFiles', jsonFiles);
    eventEmitterModel.files.forEach(file => {
        eventEmitterModel.emit('collectData', file);
    });
    eventEmitterModel.emit('compareData');
    eventEmitterModel.emit('showDifferences');
    console.log(eventEmitterModel.historicPrices);
    console.log('complete');
    return eventEmitterModel.historicPrices;
}