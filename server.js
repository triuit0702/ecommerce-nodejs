const app = require("./src/app");

//const PORT = 3055;
const PORT = process.env.PORT || 3056
const server = app.listen(PORT, () => {
    console.log(`Ecommerce start with ${PORT} `);
})

process.on('SIGINT', () => {
    server.close( () => console.log('exit server express'))
})