const session = require("express-session");
const crypto = require("crypto");

const db = require("./db");

class TursoSessionStore extends session.Store {

    constructor() {
        super();
    }

    hashSid(sid) {
        return crypto
            .createHash("sha256")
            .update(sid)
            .digest("hex");
    }

    get(sid, callback) {
        const sidHash = this.hashSid(sid);

        db.execute({
            sql: `
                SELECT data, expires_at
                FROM sessoes
                WHERE sid_hash = ?
            `,
            args: [sidHash]
        })
        .then((result) => {
            if (result.rows.length === 0) {
                return callback(null, null);
            }

            const row = result.rows[0];

            if (
                row.expires_at &&
                new Date(row.expires_at) <= new Date()
            ) {
                return this.destroy(sid, (erro) => {
                    if (erro) {
                        return callback(erro);
                    }

                    callback(null, null);
                });
            }

            try {
                callback(null, JSON.parse(row.data));
            } catch (erro) {
                callback(erro);
            }
        })
        .catch(callback);
    }

    set(sid, sessionData, callback) {
        const sidHash = this.hashSid(sid);

        const expiresAt =
            sessionData.cookie && sessionData.cookie.expires
                ? new Date(sessionData.cookie.expires).toISOString()
                : new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

        db.execute({
            sql: `
                INSERT INTO sessoes
                (
                    sid_hash,
                    data,
                    expires_at
                )
                VALUES (?, ?, ?)
                ON CONFLICT(sid_hash)
                DO UPDATE SET
                    data = excluded.data,
                    expires_at = excluded.expires_at
            `,
            args: [
                sidHash,
                JSON.stringify(sessionData),
                expiresAt
            ]
        })
        .then(() => callback(null))
        .catch(callback);
    }

    destroy(sid, callback) {
        const sidHash = this.hashSid(sid);

        db.execute({
            sql: `
                DELETE FROM sessoes
                WHERE sid_hash = ?
            `,
            args: [sidHash]
        })
        .then(() => callback(null))
        .catch(callback);
    }

    touch(sid, sessionData, callback) {
        const sidHash = this.hashSid(sid);

        const expiresAt =
            sessionData.cookie && sessionData.cookie.expires
                ? new Date(sessionData.cookie.expires).toISOString()
                : new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

        db.execute({
            sql: `
                UPDATE sessoes
                SET expires_at = ?
                WHERE sid_hash = ?
            `,
            args: [expiresAt, sidHash]
        })
        .then(() => callback(null))
        .catch(callback);
    }
}

module.exports = new TursoSessionStore();
