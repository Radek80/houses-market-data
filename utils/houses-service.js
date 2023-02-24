const fetch = require( 'node-fetch');
const jsdom = require('jsdom');
const fs = require('fs');

function split(str, index) {
    return [str.slice(0, index), str.slice(index)];
}

const fn = function collectData(houses) {
    const housesArray = {
        data: []
    };

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
            housesArray.data.push({
                'houseName': houseHtml.window.document.getElementsByClassName("css-16v5mdi")[0].innerHTML,
                'price': housePrice,
                'surface': houseHtml.window.document.getElementsByClassName("css-643j0o")[0].textContent,
                'houseLink': houseHtml.window.document.getElementsByClassName("css-rc5s2u")[0].href,
            });
        }
        resolve(housesArray);
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
                if (fs.existsSync(filePath)) {
                    fs.appendFile(filePath, JSON.stringify(data), function (err) {
                        if (err) throw err;
                        console.log('File updated!');
                    });
                } else {
                    fs.writeFile(filePath, JSON.stringify(data),function (err) {
                        if (err) throw err;
                        console.log('New file created!');
                    });
                }
            });
        });
}