import { Client, Databases } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

export const client = new Client();
let databases = null;

if (endpoint && projectId) {
    client
        .setEndpoint(endpoint)
        .setProject(projectId);

    databases = new Databases(client);
}

export { databases };
