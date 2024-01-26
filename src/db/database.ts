import { connect } from 'mongoose';

const connectToDatabase = () => {
    const databaseURI: string = process.env.MONGO_URI
    ?.replace('<username>', process.env.MONGO_USER as string)
    .replace('<password>', process.env.MONGO_PASSWORD as string)!;

    return connect(databaseURI, {});
}

export default connectToDatabase;