const fs = require('fs');
const axios = require('axios');

// Read the radios.json file
let radios = fs.readFileSync('radios.json');
radios = JSON.parse(radios);

// The main function
const main = async (uid) => {

    try {

        // The url of the radio
        const url = `https://feed.tunein.com/profiles/s${uid}/nowPlaying?itemToken=BgUFAAEAAQABAAEAb28BgmABAAEFAAA&formats=mp3,aac,ogg,flash,html,hls&serial=8c31f318-8c19-41cd-b8db-7ae18538e302&partnerId=RadioTime&version=5.2602&itemUrlScheme=secure&reqAttempt=1`;

        const response = await axios.get(url).then(response => response.data).catch(error => console.log('no' + uid));
        const { Primary } = response;
        const { Image, GuideId } = Primary;

        // Extension of Image
        const extension = Image.split('.')[Image.split('.').length - 1].split('?')[0];
        // The url of the m3u file
        const url_m3u = `https://opml.radiotime.com/Tune.ashx?id=${GuideId}`;

        //Get m3u file
        const m3uResponse = await axios.get(url_m3u).then(response => response.data)

        //Verify Status of m3u file
        const promesa = new Promise((resolve, reject) => {
            m3uResponse.on('data', chunk => {
                if (chunk.includes('#STATUS')) {
                    reject('error');
                } else {
                    fs.writeFileSync(`./m3u/${uid}.m3u`, chunk);
                    resolve('success');
                }
            });
        });

        // Save result of Promesa
        const result = await promesa;

        // Verify result of Promesa
        if (result === 'success') {
            radios.push(response);
            fs.writeFileSync('radios.json', JSON.stringify(radios));

            // Download the image
            await axios.get(Image, { responseType: 'stream' }).then(response => {
                response.data.pipe(fs.createWriteStream(`./images/${uid}.${extension}`));
            }).catch(error => {
                console.log('error image ' + uid);
            });

            console.log('station saved ', uid);
        } else {
            console.log(`status error `, uid)
        }

    } catch (error) {
    }
}

const forLoop = async () => {
    for (uid = 1000; uid < 1000000; uid++) {
        await main(uid);
    }

};

forLoop();