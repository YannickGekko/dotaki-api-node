# kafka-nodejs

This allows to create a container Node in our cluster with 4 clients kafka : 

- An AdminClient : create a topic with n numbers of partitions (here topic 'example' with 2 partitions)
- A ProducerClient : send some messages
- A Consumer1Client : consume messages sent in partition 0
- A Consumer2Client : consume messages sent in partition 1

## Steps performed

- Node app

npm init     // generate package.json file

npm install kafka-node --save    // install kafka-node lib

Setting up config file

Produce some code (admin, producer, consumer1 & consumer 2)

- Dockerfile creation

To pop a nodejs container

- deployment.yaml creation 

This deployment manage our pod 

- Deployment Kube

kubectl -n test-kafka apply -f deploymentNode.yaml

- In node-kafka pod (kubectl -n test-kafka exec -it node-kafka-XXX -- sh)

    - Topic creation

    node admin.js

    - Up 2 consumers 

    In two distinct terminals 
        - node consumer1.js
        - node consumer2.js

    - Send messages
    
    node producer.js

Messages sent in kafka are consumed by consumers 



testBuild



