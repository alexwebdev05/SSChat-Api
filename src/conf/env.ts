// Database
const dbUrl = 'postgresql://postgres.ggmjrbvfzvalslpcyexj:SSChatApi123@aws-0-eu-west-3.pooler.supabase.com:6543/postgres'

// Listeners
const http = 3000

// Websockets
const websocket = 4000

const env = {
    DB_URL: dbUrl,
    HTTP: http,
    SOCKET: websocket,
};

export default env;
