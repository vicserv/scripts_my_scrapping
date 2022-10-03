const fs = require('fs');
const axios = require('axios');

// Read the radios.json file
let radios = fs.readFileSync('radios.json');
radios = JSON.parse(radios);

// The main function
const main = async (uid) => {

    try {

        const url_m3u = `http://opml.radiotime.com/Tune.ashx?id=s${uid}`;

        //Get m3u file
        const m3uResponse = await axios.get(url_m3u, { responseType: 'stream' }).then(response => response.data)

        //Verify Status of m3u file
        const promesa = new Promise((resolve, reject) => {
            m3uResponse.on('data', chunk => {
                if (chunk.includes('#STATUS')) {
                    reject('error');
                } else {
                    fs.writeFileSync(`./m3u-only-files/${uid}.m3u`, chunk);
                    console.log('success ', uid)
                    resolve('success');
                }
            });
        });


        await promesa
    } catch (error) {
        console.log('error ', uid)
    }
}

const forLoop = async () => {
    for (uid = 1000; uid < 5000000; uid++) {
        await main(uid);
    }

};

forLoop();