const fs = require('fs');
const axios = require('axios');

// Read the radios.json file
let radios = fs.readFileSync('radios.json');
radios = JSON.parse(radios);

// The main function
const main = async (uid) => {

    try {

        // The url of the radio
        const url = `https://feed.tunein.com/profiles/s${uid}/nowPlaying?token=eyJwIjpmYWxzZSwidCI6IjIwMjItMTAtMDNUMTM6MjM6MTYuNjk2Mjg2MloifQ&itemToken=BgUFAAEAAQABAAEAb28BEWAAAAEFAAA&formats=mp3,aac,ogg,flash,html,hls&serial=8c31f318-8c19-41cd-b8db-7ae18538e302&partnerId=RadioTime&version=5.2602&itemUrlScheme=secure&reqAttempt=1`;

        const data_radio = await axios.get(url).then(response => response.data).catch(error => console.log('no' + uid));
        if (data_radio) {
            radios.push(data_radio);
            fs.writeFileSync('radios.json', JSON.stringify(radios));
        }



        // The url of the m3u file
        const url_m3u = `https://opml.radiotime.com/Tune.ashx?id=s${uid}`;

        //Get m3u file
        await axios.get(url_m3u).then(response => response.data).then(data => {
            if (data.includes('#STATUS')) {
                console.log('error ', uid)
            } else {
                fs.writeFileSync(`./m3u/${uid}.m3u`, data);
            }
        })



        // Verify result of Promesa

        const { Image } = data_radio.Primary;

        // Extension of Image
        const extension = Image.split('.')[Image.split('.').length - 1].split('?')[0];
        // Download the image
        await axios.get(Image, { responseType: 'stream' }).then(response => {
            response.data.pipe(fs.createWriteStream(`./images/${uid}.${extension}`));
        }).catch(error => {
            console.log('error image ' + uid);
        });

        console.log('station saved ', uid);

    } catch (error) {
    }
}

const forLoop = async () => {
    for (uid = 1000; uid < 1000000; uid++) {
        await main(uid);
    }

};

forLoop();