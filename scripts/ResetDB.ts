import axios from 'axios';
import * as dotenv from 'dotenv';
import FormData from 'form-data';
import * as fs from 'fs';
import { MongoClient } from 'mongodb';
import * as path from 'path';
import askForConfirmation from './AskForConfirmation';
import { DEFAULT_PASSWORD, DEFAULT_USER_EMAIL } from './Utils';

dotenv.config();

const IS_PROD = process.env.ENVIRONMENT === 'prod';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const API_URL = process.env.API_URL || 'http://localhost:4000/api';

function generateRandomBirthdate(): string {
    const start = new Date(1960, 0, 1);
    const end = new Date(1990, 0, 1);
    const birthdate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
    return birthdate.toISOString().split('T')[0];
}

async function insertUser(fullname: string, email: string): Promise<string> {
    console.log('Inserting user with email:', email);

    const { data: userData } = await axios.post(`${API_URL}/users`, {
        fullname,
        email,
        birthdate: generateRandomBirthdate(),
        password: DEFAULT_PASSWORD,
    });

    console.log(`Inserted user with id: ${userData.id}`);

    return userData.id as string;
}

async function updateUserProfilePicture(
    userId: string,
    picPath: string,
): Promise<void> {
    console.log(`Updating profile picture for user with id: ${userId}`);
    const profilePic: FormData = new FormData();
    profilePic.append('profilePicture', fs.createReadStream(picPath), '');
    await axios.put(`${API_URL}/users/${userId}/profile-picture`, profilePic, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    console.log(`Updated profile picture for user with id: ${userId}`);
}

async function resetMongoDB() {
    if (IS_PROD) {
        await askForConfirmation(
            'You are about to reset DB in PRODUCTION environment. Do you want to proceed?',
        );
    }

    console.log(`Connecting to MongoDB at: ${DATABASE_URL}`);

    const client = new MongoClient(DATABASE_URL);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();
        const collections = await db.collections();

        console.log(
            `Found ${collections.length} collections. Clearing all collections`,
        );

        for (const collection of collections) {
            console.log(`Clearing collection: ${collection.collectionName}`);
            const result = await collection.deleteMany({});
            console.log(
                `Cleared ${collection.collectionName}: ${result.deletedCount} documents removed.`,
            );
        }

        console.log('Waiting for 10 seconds before proceeding...');
        await new Promise((resolve) => setTimeout(resolve, 10000));

        console.log('Inserting user');

        const userId = await insertUser(
            'Valmir Gonçalves Martins Junior',
            DEFAULT_USER_EMAIL,
        );

        console.log('Updating user profile picture');

        const userPicPath = path.join(
            path.resolve(__dirname, 'assets'),
            'monkey.jpg',
        );

        await updateUserProfilePicture(userId, userPicPath);

        console.log('Database reset process completed successfully.');
    } catch (error) {
        console.error('Error clearing collections:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

resetMongoDB();
