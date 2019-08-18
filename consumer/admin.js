const kafka = require('kafka-node');
const bp = require('body-parser');
const config = require('./config');

try {
    const client = new kafka.KafkaClient({kafkaHost:config.kafka_server});

    var topicsToCreate = [{
        topic: 'example',
        partitions: 2,
        replicationFactor: 2
      }];

    client.createTopics(topicsToCreate, (err, data) => {
        if(err){
            console.log(err);
        } else {
            console.log(data);
        }
    })

    client.on('error', function(err) {
        console.log(err);
        throw err;
    });
}
catch(e) {
  console.log(e);
}