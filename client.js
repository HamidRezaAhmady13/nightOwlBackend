const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.resolve(__dirname, './proto/greeter.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDefinition).greeter;

const client = new proto.GreeterService(
  'localhost:5000',
  grpc.credentials.createInsecure(),
);

client.SayHello({ name: 'Hamid' }, (err, response) => {
  console.log(response);
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Response:', response); // Should show { message: 'Hello, Hamid! 👋' }
  }
});
