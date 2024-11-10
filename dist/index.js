const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req,
              res) => {
    res.send('Welcome');
})

app.get('/videos', (req,
                    res) => {
    res.send('Videos');
})

app.post('/videos', (req,
                    res) => {
    res.send('We have created Videos');
})
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})