if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const fs = require('fs');

const { GOOGLE_CONFIG, GOOGLE_APPLICATION_CREDENTIALS } = process.env;

fs.writeFile(GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CONFIG, err => {
    if (err) {
        throw new Error('Error writing', GOOGLE_APPLICATION_CREDENTIALS);
    }

    console.log('Created GOOGLE CONFIG');
});
