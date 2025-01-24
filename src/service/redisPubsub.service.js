const Redis = require('redis');

class RedisPubSubService {

    constructor() {
        this.subscriber = Redis.createClient();
        this.publisher = Redis.createClient();
        
        //this.subscriber.connect().catch(console.error)
        //this.publisher.connect().catch(console.error)
        this.subscriber.connect()
        this.publisher.connect()

    }

    publish( channel, message ) {
        return new Promise ( (resovel, reject)=> {
            this.publisher.publish( channel, message, (err, reply) => {
                if (err) {
                    reject(err);
                } else {
                    resovel(reply);
                }
            })
        })
    }

    subscribe(channel, callback) {
        this.subscriber.subscribe(channel, (subscriberChannel, message) => {
            console.log('subscriberChannel ' , subscriberChannel);
            console.log('message ' , message);
            if ( channel === message ) {
                console.log('vo ham')
               callback(subscriberChannel, message);
            }
        });

        // this.subscriber.on('message', (subscriberChannel, message) => {
        //     console.log('subscriberChannel', subscriberChannel);
        //     if ( channel === subscriberChannel ) {
        //         callback(channel, message);
        //     }
        // })
    }
}

module.exports = new RedisPubSubService();