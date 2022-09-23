#!/usr/bin/env node

var amqp = require("amqplib/callback_api");

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = "order_exchange";

    channel.assertExchange(exchange, "topic");

    channel.assertQueue(
      "",
      {
        exclusive: true,
      },
      function (err, result) {
        if (err) {
          throw err;
        }
        channel.prefetch(1);
        console.log(
          " [*] Waiting for messages in %s. To exit press CTRL+C",
          exchange
        );

        process.argv.slice(2).forEach((type) => {
          channel.bindQueue(result.queue, exchange, type);
        });

        channel.consume(
          result.queue,
          function (msg) {
            var secs = msg.content.toString().split(".").length - 1;
            console.log(" [x] Received");
            console.log(JSON.parse(msg.content));

            setTimeout(function () {
              console.log(" [x] Done");
              channel.ack(msg);
            }, secs * 1000);
          },
          {
            noAck: false,
          }
        );
      }
    );
  });
});
