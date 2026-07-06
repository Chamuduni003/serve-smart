const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'serve_smart'
});

const query = (sql, params, callback) => {
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }

    if (typeof callback === 'function') {
        return connection.query(sql, params, callback);
    }

    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results, fields) => {
            if (err) return reject(err);
            resolve([results, fields]);
        });
    });
};

connection.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed: ' + err.stack);
        return;
    }
    console.log('✅ Connected to MySQL database serve_smart');
});

module.exports = {
    query,
    connect: connection.connect.bind(connection),
    end: connection.end.bind(connection)
};

