import app from './app.js';
import connectToDatabase from './db/database.js';

const port: number = +process.env.PORT! || 3000;

const startServer = async (): Promise<void> => {
    try {
        await connectToDatabase();
        console.log(`The database was connected successfully`);
        app.listen(port, () => {
            console.log(`Server is listening on ${port} port`);
        });
    } catch(error: any) {
        console.error('Error starting the server', error.message);
    }
};

startServer();