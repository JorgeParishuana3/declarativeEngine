import os
import time
from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row
from psycopg import OperationalError, InterfaceError
from config.config import PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD

DB_CONFIG = {
    "host": PGHOST,
    "port": PGPORT,
    "dbname": PGDATABASE,
    "user": PGUSER,
    "password": PGPASSWORD
}

MAX_RETRIES = 5
INITIAL_BACKOFF = 0.2

_pool: ConnectionPool | None = None


def _init_pool() -> ConnectionPool:
    return ConnectionPool(
        conninfo=" ".join(f"{k}={v}" for k, v in DB_CONFIG.items()),
        min_size=1,
        max_size=10,
        kwargs={"row_factory": dict_row},
    )

# Singleton
def get_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        _pool = _init_pool()
    return _pool

# get conn con retrys
def get_conn():
    pool = get_pool()
    last_exc = None
    backoff = INITIAL_BACKOFF

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return pool.connection()
        except (OperationalError, InterfaceError) as e:
            last_exc = e
            if attempt == MAX_RETRIES:
                break
            time.sleep(backoff)
            backoff *= 2

    raise last_exc
