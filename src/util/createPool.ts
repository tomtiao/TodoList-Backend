import mysql, { Pool } from 'mysql2';

const createPool = (): Pool => mysql.createPool({
    host: 'defuse.local',
    user: 'Todo_User',
    password: 'Todo_User',
    database: 'TodolistDB'
});

export default createPool;