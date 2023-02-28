const housesService = require("./utils/houses-service");

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
            housesService.showDifferences(url);
            break;
        }
        default: {
            console.log('Unknown command');
        }
    }
} else {
    console.log('Command missing');
}