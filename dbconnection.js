const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConnection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function select(table, column, where, values) {
  try {
    const connection = await dbConnection.getConnection();
    try {
      // Aqui, a consulta é preparada com placeholders (?) e os valores são passados separadamente para evitar injeção de SQL
      const [rows, fields] = await connection.query(`SELECT ${column} FROM ${table} WHERE ${where}`, values);
      return rows;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error(err);
    throw new Error('Erro ao acessar o banco de dados');
  }
}


async function add(table, data) {
  const connection = await dbConnection.getConnection();
  try {
    const [result] = await connection.query(`INSERT INTO ${table} SET ?`, data);
    return result;
  } finally {
    connection.release();
  }
}

async function update(table, data, where) {
  const connection = await dbConnection.getConnection();
  try {
    const [result] = await connection.query(`UPDATE ${table} SET ? WHERE ${where}`, data);
    return result;
  } finally {
    connection.release();
  }
}

module.exports = {
  select,
  add,
  update,
};