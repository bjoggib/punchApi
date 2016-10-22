var amqp = require('amqplib/callback_api');

//list of stuff
var args = ['user.add', 'punch.add'];

if (args.length == 0) {
  console.log("Usage: receive_logs_topic.js <facility>.<severity>");
  process.exit(1);
}

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'punchcardApi';

    ch.assertExchange(ex, 'topic', { durable: false });

    ch.assertQueue('', { exclusive: true }, function(err, q) {
      console.log(' [*] Waiting for logs. To exit press CTRL+C');

      args.forEach(function(key) {
        ch.bindQueue(q.queue, ex, key);
      });

      ch.consume(q.queue, function(msg) {
        console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
      }, { noAck: true });
    });
  });
});