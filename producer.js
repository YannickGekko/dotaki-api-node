const kafka = require('kafka-node');
const bp = require('body-parser');
const config = require('./config');
const express = require('express'), 
    app = express(), 
    port = 8081

const bodyParser = require('body-parser')

app.use(bodyParser.json());

app.post('/', function (req, res) {
  try {
    const Producer = kafka.Producer;
    const client = new kafka.KafkaClient({kafkaHost:config.kafka_server});
    const producer = new Producer(client);

    let payloads = [
      {
        topic: req.body.topic,
        messages: req.body.message,
      }
    ];
  producer.on('ready', async function() {
      let push_status = producer.send(payloads, (err, data) => {
        if (err) {
          console.log('[kafka-producer -> '+config.kafka_topic+']: broker update failed');
          res.send('Message send error');
        } else {
          console.log('[kafka-producer -> '+config.kafka_topic+']: broker update success');
          console.log(req.body.message);
          res.send('Message sent');
        }
      });
    });


    producer.on('error', function(err) {
      console.log(err);
      console.log('[kafka-producer -> '+config.kafka_topic+']: connection errored');
      res.send('Connection errored');
      throw err;
    });
  }
  catch(e) {
    console.log(e);
  }
});

app.listen(port)