const fs = require('fs');
const http = require('https');
const axios = require('axios');
let radios = fs.readFileSync('radios.json');
radios = JSON.parse(radios);

const main = async (uid) => {
    const url = `https://feed.tunein.com/profiles/s${uid}/nowPlaying?itemToken=BgUFAAEAAQABAAEAb28BgmABAAEFAAA&formats=mp3,aac,ogg,flash,html,hls&serial=8c31f318-8c19-41cd-b8db-7ae18538e302&partnerId=RadioTime&version=5.2602&itemUrlScheme=secure&reqAttempt=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.Primary && data.Primary.Image) {
        const { Primary, Header, Classification, Link } = data;
        const { Image, GuideId } = data.Primary;
        const extension = Image.split('.')[Image.split('.').length - 1].split('?')[0];
        const archivo = `https://opml.radiotime.com/Tune.ashx?id=${GuideId}`;
        var statuserror = false;

        radios.push({ Primary, Header, Classification, Link });
        fs.writeFileSync('radios.json', JSON.stringify(radios));

        const m3uResponse = await axios.get(archivo, { responseType: 'stream' }).catch((err) => console.log(err));
        await m3uResponse.data.on('data', chunk => {
            if (chunk.includes('#STATUS')) {
                statuserror = true;
            }
        });


        if (statuserror) {
            m3uResponse.pipe(fs.createWriteStream(`./m3u/${uid}.m3u`));

            await axios.get(Image, { responseType: 'stream' }).then(response => {
                response.data.pipe(fs.createWriteStream(`./images/${uid}.${extension}`));
            }).catch(error => {
                console.log('error image');
            });
        }

    }
}




const forLoop = async () => {
    for (uid = 5337; uid < 1000000; uid++) {
        await main(uid);
    }
};

forLoop();
