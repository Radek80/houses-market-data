const housesService = require("./utils/houses-service");
const express = require('express');
const app = express();
const server = app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
app.get('/', (req, res) => {

    app.set('view engine', 'pug');
    const filesData = housesService.showDifferences(url);
    // res.sendStatus(200);
    res.send('Hello ')
});

const command = process.argv[2];
const url = process.argv[3];

if (command) {
    switch (command) {
        case 'houses': {
            if (url) {
                housesService.fetchHousesData(url);
            } else {
                console.log('Parameter missing');
            }
            break;
        }
        case 'show_diff': {
            housesService.showDifferences();
            break;
        }
        default: {
            console.log('Unknown command');
        }
    }
} else {
    console.log('Command missing');
}