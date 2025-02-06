const amqplib = require('amqplib');

const message = 'hello ,RabbitMq for Tips javascript'

const runProducer = async () => {
    try {
        const connection = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queueName = 'test-topic';
        await channel.assertQueue(queueName, { 
            durable: true // khi server crash vấn đề gi đó , khi start lại rabbitmq thì nó sẽ gửi lại message chứ ko mất dữ liệu
         });

         // send message to consumer channel
         channel.sendToQueue(queueName, Buffer.from(message));
         console.log(`message sent : `, message);
    }catch(e) {
        console.log(e)
    }
}

runProducer().catch(console.error)