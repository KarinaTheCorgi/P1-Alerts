//token expires after a bit
// https://erau.teamdynamix.com/TDWebApi/api/auth/loginsso


token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6InNvbGlzazNAZXJhdS5lZHUiLCJ0ZHhfZW50aXR5IjoiMiIsInRkeF9wYXJ0aXRpb24iOiIxOCIsIm5iZiI6MTczNjk2MzcxNSwiZXhwIjoxNzM3MDUwMTE1LCJpYXQiOjE3MzY5NjM3MTUsImlzcyI6IlREIiwiYXVkIjoiaHR0cHM6Ly93d3cudGVhbWR5bmFtaXguY29tLyJ9.IX9ZZDOpSQT2w2uvmHpZDoJaOzRCnpg5G7qEPivo3t0';
url = 'https://erau.teamdynamix.com/TDWebApi/api/';
apiID = '30/'
reportID = 6261; // custom karina report for most recent p1

headers = { Authorization: `Bearer ${token}`, };

let port;

// adds ticket id to csv
async function addTXtoCSV(id) {
    try {
        // https://www.npmjs.com/package/csv-writer
        let createCSVWriter = require('csv-writer').createObjectCsvWriter;

        let csvWriter = createCSVWriter({
            path: 'p1data.csv',
            header: [
                { id: 'ticketID', title: 'Ticket ID' }
            ],
            append: true
        });

        let record = {
            ticketID: id
        };

        await csvWriter.writeRecords([record]);
        console.log(`Added ${id} to p1data.csv`);
    } catch (error) {
        console.error('Error writing ID to file:', error);
    }
}

// gets most recent P1 id
async function getMostRecentP1() {
    try {
        let response = await fetch(url + "reports/" + reportID + "?withData=true", { headers: headers });
        let info = await response.json();

        return await info.DataRows[0].TicketID;
    } catch (error) {
        console.log("Error getting ticket info:", error);
    }
}

// checks if ticket id is in the CSV file
async function isAlreadyInCSV(id) {
    try {
        // https://www.npmjs.com/package/csv-parser
        let csvReader = require('csv-parser');
        let fs = require('fs')
        let oldIDs = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream('p1data.csv')
                .pipe(csvReader())
                .on('data', (row) => {
                    // first row of csv has to be 'Ticket ID
                    oldIDs.push(row['Ticket ID']);
                })
                .on('end', () => {
                    resolve(oldIDs.includes(id.toString()));
                })
                .on('error', (error) => {
                    console.log("Error opening file.");
                    reject(error);
                });
        });
    } catch (error) {
        console.log("Error checking id/file: ", error);
    }
}

async function openPort() {
    return new Promise(async (resolve, reject) => {
        const { SerialPort } = require('serialport');
        const port = new SerialPort({
            path: '/dev/cu.usbmodem14301',
            baudRate: 9600
        }, err => {if (err) return reject(err)})

            port.on('data', data => console.log(data.toString()));

            await sleep(4000);
            port.write("startup");
            console.log('opened');
            resolve(port);
    })
}

async function closePort(port) {
    return new Promise((resolve, reject) => {
        port.close(err => {
            if (err) return reject(err)
            console.log('closed')
            resolve()
        })
    })
}

async function sleep(delay) {
    await new Promise(r => setTimeout(r, delay))
}

// super secret brandon things (probably a siren or smtg)
async function triggerArduino(port) {

    const path = require('node:path');

    port.write("trigger")
    await sleep(2000);
}

// https://www.freecodecamp.org/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
function playVideo() {
    // win command
    // havent tested the /fullscreen, if doesnt work - remove it
    let commanc = `start vid.mp4 /fullscreen`;
    // mac command
    // let command = `open -a VLC vid.mp4`;
    let { exec } = require('child_process');

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log("I tried:", error);
            return;
        }
    })
}

// handles p1 checking/executes
async function checkP1s(count) {
    try {
        let considerThisID = await getMostRecentP1();
        console.log('Most recent P1:', considerThisID);

        if ((considerThisID !== null) && !(await isAlreadyInCSV(considerThisID))) {
            console.log(`Alert the media! We've got a new P1: ${considerThisID}`);
            console.log('Trigger Arduino Here');
            triggerArduino(port);
            playVideo();
            addTXtoCSV(considerThisID);
        } else {
            console.log('Aww man. No new P1s.');
        }
    } catch (error) {
        console.log('um somthing went wrong:', error)
    }
}

// relay help: https://www.instructables.com/Driving-a-Relay-With-an-Arduino/

async function go() {
    //Open the port with the arduino
    port = await openPort();
    await sleep(5000);
    //Start the interval
    console.log("P1 checking time");
    let interval = setInterval(checkP1s, 5000);
    
process.on("SIGINT", async () => {
    console.log("Shutting down")
    clearInterval(interval)
    port.write("bye")
    await sleep(2000)
    closePort(port)
    console.log("Bye!")
})

process.on("SIGTERM", async () => {
    console.log("Shutting down")
    clearInterval(interval)
    port.write("bye")
    await sleep(2000)
    closePort(port)
    console.log("Bye!")
})
}

go();