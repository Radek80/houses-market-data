const housesService = require("./utils/houses-service");

const command = process.argv[2];
const url = process.argv[3];

if (command && url) {
    switch (command) {
        case 'houses': {
            housesService.fetchHousesData(url);
            break;
        }
        default: {
            console.log('Unknown command');
        }
    }
} else {
    console.log('Command missing');
}