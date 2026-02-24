import Fastify from 'fastify';
import { pool } from './db.js';

const fastify = Fastify({ logger: true });


fastify.get('/caliaire/:idb', async (request, reply) => {
  const { idb } = request.params;

  const { rows } = await pool.query(
    `
    SELECT DISTINCT ON (idb)
        id,
        idb,
        humedad,
        temperatura_c,
        dioxido_carbono_ppm,
        fecha_registro
    FROM caliaire_registros
    WHERE idb = $1
    ORDER BY idb, fecha_registro DESC;
    `,
    [idb]
  );

  if (rows.length === 0) {
    return reply.code(404).send({ message: 'Dispositivo no encontrado' });
  }

  return rows[0];
});


fastify.get('/cupe/:cam_id', async (request, reply) => {
  const { cam_id } = request.params;

  const { rows } = await pool.query(
    `
    SELECT DISTINCT ON (cam_id)
        id,
        cam_id,
        ts,
        aforo
    FROM cupe_registros
    WHERE cam_id = $1
    ORDER BY cam_id, ts DESC;
    `,
    [cam_id]
  );

  if (rows.length === 0) {
    return reply.code(404).send({ message: 'Cámara no encontrada' });
  }

  return rows[0];
});

fastify.get('/sp/:cam_id', async (request, reply) => {
  const { cam_id } = request.params;

  const { rows } = await pool.query(
    `
    SELECT DISTINCT ON (cam_id)
        id,
        cam_id,
        ts,
        spots_state,
        spot_ids,
        layout
    FROM sp_registros
    WHERE cam_id = $1
    ORDER BY cam_id, ts DESC;
    `,
    [cam_id]
  );

  if (rows.length === 0) {
    return reply.code(404).send({ message: 'Cámara no encontrada' });
  }

  return rows[0];
});

const start = async () => {
    await fastify.listen({ port: 3004, host: '0.0.0.0' });
};

start();
